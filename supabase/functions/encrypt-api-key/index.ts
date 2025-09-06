import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const encryptionKey = Deno.env.get('API_ENCRYPTION_KEY')!

    if (!encryptionKey) {
      throw new Error('API_ENCRYPTION_KEY not configured')
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid or expired token')
    }

    const { business_id, name, key_value, description } = await req.json()

    if (!business_id || !name || !key_value) {
      throw new Error('Missing required fields: business_id, name, key_value')
    }

    // Verify user has access to this business
    const { data: businessAccess, error: accessError } = await supabase
      .rpc('has_business_access', { business_id })

    if (accessError || !businessAccess) {
      throw new Error('Access denied to this business')
    }

    // Encrypt the API key using AES-GCM
    const encoder = new TextEncoder()
    const keyData = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyData,
      encoder.encode(key_value)
    )

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedData), iv.length)
    
    // Convert to base64 for storage
    const encryptedValue = btoa(String.fromCharCode(...combined))

    // Insert the encrypted API key into the database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        business_id,
        name,
        key_value: encryptedValue,
        description,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in encrypt-api-key function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})