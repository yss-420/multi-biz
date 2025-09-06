-- Fix function search_path security warnings
-- Update existing functions to set search_path

-- Update has_business_access function
CREATE OR REPLACE FUNCTION public.has_business_access(business_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_id AND b.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.business_id = business_id AND tm.user_id = auth.uid()
  );
END;
$function$;

-- Update handle_new_user function  
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    'owner'
  );
  RETURN NEW;
END;
$function$;

-- Fix the businesses table RLS policy that has incorrect reference
DROP POLICY IF EXISTS "Users can view their businesses" ON public.businesses;

CREATE POLICY "Users can view their businesses" 
ON public.businesses 
FOR SELECT 
USING (
  (owner_id = auth.uid()) OR 
  (EXISTS ( 
    SELECT 1 FROM team_members tm 
    WHERE tm.business_id = businesses.id AND tm.user_id = auth.uid()
  ))
);