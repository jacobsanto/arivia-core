-- Fix search_path syntax for security compliance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
set search_path = public
AS $function$
DECLARE
  v_role app_role;
  v_superadmin_exists boolean;
BEGIN
  -- Check if a superadmin already exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'superadmin'
  ) INTO v_superadmin_exists;
  
  -- Determine the role for this user
  IF NOT v_superadmin_exists AND (NEW.raw_user_meta_data->>'role')::text = 'superadmin' THEN
    -- First user with superadmin request becomes superadmin
    v_role := 'superadmin';
  ELSIF v_superadmin_exists AND (NEW.raw_user_meta_data->>'role')::text = 'superadmin' THEN
    -- Prevent additional superadmin creation
    v_role := 'property_manager';
  ELSE
    -- Use the requested role or default to property_manager
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'property_manager');
  END IF;
  
  -- Insert into profiles
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    v_role
  );
  
  -- Insert into user_roles (the source of truth for role checking)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role);
  
  RETURN NEW;
END;
$function$;