-- Migration to ensure API key encryption security
-- This migration adds indexes and functions to support encrypted API keys

-- Add index for better performance on API key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_business_id ON public.api_keys(business_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON public.api_keys(created_by);

-- Add a comment to document that key_value should contain encrypted data
COMMENT ON COLUMN public.api_keys.key_value IS 'Encrypted API key value using AES-GCM encryption';

-- Create a function to validate that we have proper business access
-- This enhances security by ensuring RLS policies work correctly
CREATE OR REPLACE FUNCTION public.validate_api_key_access(api_key_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.api_keys ak
    JOIN public.businesses b ON ak.business_id = b.id
    WHERE ak.id = api_key_id 
    AND (b.owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.business_id = b.id AND tm.user_id = auth.uid()
    ))
  );
END;
$$;