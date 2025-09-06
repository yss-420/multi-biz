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

    const { api_key_id } = await req.json()

    if (!api_key_id) {
      throw new Error('Missing required field: api_key_id')
    }

    // Fetch the encrypted API key from the database
    const { data: apiKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', api_key_id)
      .single()

    if (fetchError || !apiKey) {
      throw new Error('API key not found')
    }

    // Verify user has access to this business
    const { data: businessAccess, error: accessError } = await supabase
      .rpc('has_business_access', { business_id: apiKey.business_id })

    if (accessError || !businessAccess) {
      throw new Error('Access denied to this API key')
    }

    // Decrypt the API key
    const encryptedValue = apiKey.key_value
    const combined = new Uint8Array(
      atob(encryptedValue).split('').map(char => char.charCodeAt(0))
    )

    const iv = combined.slice(0, 12)
    const encryptedData = combined.slice(12)

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    const keyData = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      keyData,
      encryptedData
    )

    const decryptedKey = decoder.decode(decryptedData)

    return new Response(
      JSON.stringify({ decrypted_key: decryptedKey }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in decrypt-api-key function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})