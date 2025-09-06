/**
 * Client-side encryption utilities for API keys
 * 
 * Note: The actual encryption/decryption happens on the server via edge functions
 * to keep the encryption key secure. These are helper functions for the client.
 */

export interface EncryptedApiKey {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  key_value: string; // This will be encrypted
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DecryptedApiKey extends Omit<EncryptedApiKey, 'key_value'> {
  key_value: string; // This will be decrypted
}

/**
 * Encrypt an API key using the server-side encryption endpoint
 */
export async function encryptApiKey(businessId: string, name: string, keyValue: string, description?: string): Promise<EncryptedApiKey> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase.functions.invoke('encrypt-api-key', {
    body: {
      business_id: businessId,
      name,
      key_value: keyValue,
      description
    }
  });

  if (error) {
    throw new Error(`Failed to encrypt API key: ${error.message}`);
  }

  return data;
}

/**
 * Decrypt an API key using the server-side decryption endpoint
 */
export async function decryptApiKey(apiKeyId: string): Promise<string> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase.functions.invoke('decrypt-api-key', {
    body: {
      api_key_id: apiKeyId
    }
  });

  if (error) {
    throw new Error(`Failed to decrypt API key: ${error.message}`);
  }

  return data.decrypted_key;
}

/**
 * Get all API keys for a business (encrypted)
 */
export async function getBusinessApiKeys(businessId: string): Promise<EncryptedApiKey[]> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch API keys: ${error.message}`);
  }

  return data || [];
}

/**
 * Delete an API key
 */
export async function deleteApiKey(apiKeyId: string): Promise<void> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', apiKeyId);

  if (error) {
    throw new Error(`Failed to delete API key: ${error.message}`);
  }
}