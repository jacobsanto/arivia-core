
-- Phase 1: Create RLS policies for tables that have RLS enabled but no policies

-- Bookings: Users can view bookings for properties they manage
CREATE POLICY "Property managers can view relevant bookings" ON public.bookings
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Property managers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Property managers can update bookings" ON public.bookings
  FOR UPDATE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator')
  );

-- Maintenance Tasks: Role-based access for maintenance staff
CREATE POLICY "Staff can view maintenance tasks" ON public.maintenance_tasks
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'maintenance_staff') 
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Managers can create maintenance tasks" ON public.maintenance_tasks
  FOR INSERT WITH CHECK (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager')
  );

CREATE POLICY "Staff can update assigned tasks" ON public.maintenance_tasks
  FOR UPDATE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager')
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Admins can delete maintenance tasks" ON public.maintenance_tasks
  FOR DELETE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator')
  );

-- Orders: Role-based access for inventory management
CREATE POLICY "Staff can view orders" ON public.orders
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager')
    OR created_by = auth.uid()
  );

CREATE POLICY "Staff can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager')
    AND created_by = auth.uid()
  );

CREATE POLICY "Managers can update orders" ON public.orders
  FOR UPDATE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager')
  );

CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator')
  );

-- Order Items: Linked to orders access
CREATE POLICY "Staff can view order items" ON public.order_items
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager')
  );

CREATE POLICY "Staff can manage order items" ON public.order_items
  FOR ALL USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager')
  );

-- Inventory Categories: Admin and inventory manager access
CREATE POLICY "Staff can view inventory categories" ON public.inventory_categories
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff')
  );

CREATE POLICY "Managers can manage inventory categories" ON public.inventory_categories
  FOR ALL USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'inventory_manager')
  );

-- Inventory Items: Staff access for viewing, managers for editing
CREATE POLICY "Staff can view inventory items" ON public.inventory_items
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff')
  );

CREATE POLICY "Managers can manage inventory items" ON public.inventory_items
  FOR ALL USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'inventory_manager')
  );

-- Inventory Stock: Staff can view, managers can edit
CREATE POLICY "Staff can view inventory stock" ON public.inventory_stock
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff')
  );

CREATE POLICY "Staff can update stock levels" ON public.inventory_stock
  FOR INSERT WITH CHECK (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff')
    AND last_updated_by = auth.uid()
  );

CREATE POLICY "Staff can modify stock levels" ON public.inventory_stock
  FOR UPDATE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager', 'housekeeping_staff')
  );

CREATE POLICY "Managers can delete stock records" ON public.inventory_stock
  FOR DELETE USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'inventory_manager')
  );

-- Vendors: Admin and inventory manager access
CREATE POLICY "Staff can view vendors" ON public.vendors
  FOR SELECT USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'property_manager', 'inventory_manager')
  );

CREATE POLICY "Managers can manage vendors" ON public.vendors
  FOR ALL USING (
    public.get_current_user_role() IN ('superadmin', 'administrator', 'inventory_manager')
  );

-- Phase 2: Fix database function security issues by updating existing functions
-- Update functions to use SECURITY DEFINER and proper search paths

CREATE OR REPLACE FUNCTION public.generate_housekeeping_tasks_for_booking(booking_record guesty_bookings)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE 
  stay_duration INTEGER;
  total_guests INTEGER;
  midpoint INTEGER;
  third_point INTEGER;
  two_thirds_point INTEGER;
BEGIN
  -- Only proceed if booking status is confirmed
  IF booking_record.status != 'confirmed' THEN
    RETURN;
  END IF;

  -- Calculate stay duration in days
  stay_duration := DATE(booking_record.check_out) - DATE(booking_record.check_in);
  
  -- Try to get guest count from raw_data, default to 2
  BEGIN
    total_guests := COALESCE((booking_record.raw_data->'guestsCount')::int, 2);
    IF total_guests IS NULL OR total_guests = 0 THEN
      total_guests := 2;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    total_guests := 2;
  END;
  
  -- Pre-arrival Standard Cleaning (check-in preparation)
  IF NOT EXISTS (
    SELECT 1 FROM public.housekeeping_tasks 
    WHERE booking_id = booking_record.id 
    AND task_type = 'Standard Cleaning'
    AND due_date = booking_record.check_in - 1
  ) THEN
    INSERT INTO public.housekeeping_tasks (
      listing_id,
      booking_id,
      due_date,
      task_type,
      description,
      status
    ) VALUES (
      booking_record.listing_id,
      booking_record.id,
      booking_record.check_in - 1,
      'Standard Cleaning',
      'Pre-arrival preparation for ' || total_guests || ' guests (' || stay_duration || ' nights)',
      'pending'
    );
  END IF;
  
  -- Apply cleaning breakdown based on length of stay
  IF stay_duration <= 3 THEN
    -- Up to 3 nights: No additional cleaning during stay
    NULL;
    
  ELSIF stay_duration <= 5 THEN
    -- Up to 5 nights: Two cleaning sessions during stay
    midpoint := stay_duration / 2;
    
    -- Full cleaning at mid-stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Full Cleaning'
      AND due_date = booking_record.check_in + midpoint
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + midpoint,
        'Full Cleaning',
        'Mid-stay full cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests) - coordinate with guest',
        'pending'
      );
    END IF;
    
    -- Linen & towel change 1-2 days after full cleaning
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Linen & Towel Change'
      AND due_date = booking_record.check_in + midpoint + 1
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + midpoint + 1,
        'Linen & Towel Change',
        'Linen and towel change for ' || stay_duration || '-night stay (' || total_guests || ' guests) - coordinate with guest',
        'pending'
      );
    END IF;
    
  ELSIF stay_duration <= 7 THEN
    -- Up to 7 nights: Three cleaning sessions during stay
    third_point := stay_duration / 3;
    two_thirds_point := (stay_duration * 2) / 3;
    
    -- First full cleaning at 1/3 of stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Full Cleaning'
      AND due_date = booking_record.check_in + third_point
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + third_point,
        'Full Cleaning',
        'First mid-stay cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests) - coordinate with guest',
        'pending'
      );
    END IF;
    
    -- First linen change
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Linen & Towel Change'
      AND due_date = booking_record.check_in + third_point + 1
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + third_point + 1,
        'Linen & Towel Change',
        'First linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests) - coordinate with guest',
        'pending'
      );
    END IF;
    
    -- Second full cleaning at 2/3 of stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Full Cleaning'
      AND due_date = booking_record.check_in + two_thirds_point
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + two_thirds_point,
        'Full Cleaning',
        'Second mid-stay cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests) - coordinate with guest',
        'pending'
      );
    END IF;
    
    -- Second linen change
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Linen & Towel Change'
      AND due_date = booking_record.check_in + two_thirds_point + 1
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + two_thirds_point + 1,
        'Linen & Towel Change',
        'Second linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests) - coordinate with guest',
        'pending'
      );
    END IF;
    
  ELSE
    -- More than 7 nights: Custom cleaning schedule
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Custom Cleaning Schedule'
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_in + 1, -- Schedule for day after check-in to plan
        'Custom Cleaning Schedule',
        'Extended stay (' || stay_duration || ' nights) - Arrange custom cleaning schedule with ' || total_guests || ' guests based on preferences',
        'pending'
      );
    END IF;
  END IF;

  -- Check for same-day check-in after this booking's check-out
  IF NOT EXISTS (
    SELECT 1 FROM public.guesty_bookings 
    WHERE listing_id = booking_record.listing_id
    AND check_in = booking_record.check_out
    AND id != booking_record.id
    AND status = 'confirmed'
  ) THEN
    -- Post-checkout Standard Cleaning (if no same-day check-in)
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = booking_record.id 
      AND task_type = 'Standard Cleaning'
      AND due_date = booking_record.check_out
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        booking_record.listing_id,
        booking_record.id,
        booking_record.check_out,
        'Standard Cleaning',
        'Post-checkout cleanup after ' || total_guests || ' guests (' || stay_duration || '-night stay)',
        'pending'
      );
    END IF;
  END IF;
END;
$function$;

-- Update other functions with security definer and search path
CREATE OR REPLACE FUNCTION public.trigger_generate_housekeeping_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Generate tasks for the new/updated booking
  PERFORM public.generate_housekeeping_tasks_for_booking(NEW);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.extract_booking_financial_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Extract financial data from raw_data and update the booking record
  NEW.amount_paid := (NEW.raw_data->'money'->>'totalPrice')::numeric;
  NEW.currency := COALESCE(NEW.raw_data->'money'->>'currency', 'EUR');
  
  -- Extract guest email from raw_data
  NEW.guest_email := NEW.raw_data->'guest'->>'email';
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'property_manager'),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_webhook_health_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_booking_financials()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Extract financial data from the booking's raw_data
  INSERT INTO public.financial_reports (
    booking_id,
    listing_id,
    amount_paid,
    currency,
    channel_fee,
    check_in,
    check_out,
    revenue,
    month,
    property,
    profit,
    expenses,
    margin
  )
  VALUES (
    NEW.id,
    NEW.listing_id,
    COALESCE((NEW.raw_data->>'money'->>'netAmount')::numeric, 0),
    COALESCE(NEW.raw_data->>'money'->>'currency', 'EUR'),
    COALESCE((NEW.raw_data->>'money'->>'channelFee')::numeric, 0),
    NEW.check_in,
    NEW.check_out,
    COALESCE((NEW.raw_data->>'money'->>'netAmount')::numeric, 0),
    to_char(NEW.check_in, 'YYYY-MM'),
    NEW.listing_id,
    COALESCE((NEW.raw_data->>'money'->>'netAmount')::numeric, 0) - COALESCE((NEW.raw_data->>'money'->>'channelFee')::numeric, 0),
    COALESCE((NEW.raw_data->>'money'->>'channelFee')::numeric, 0),
    CASE 
      WHEN COALESCE((NEW.raw_data->>'money'->>'netAmount')::numeric, 0) > 0 
      THEN round(((COALESCE((NEW.raw_data->>'money'->>'netAmount')::numeric, 0) - COALESCE((NEW.raw_data->>'money'->>'channelFee')::numeric, 0)) / 
           COALESCE((NEW.raw_data->>'money'->>'netAmount')::numeric, 1) * 100)::numeric, 2)::text || '%'
      ELSE '0%'
    END
  )
  ON CONFLICT (booking_id) 
  DO UPDATE SET
    amount_paid = EXCLUDED.amount_paid,
    currency = EXCLUDED.currency,
    channel_fee = EXCLUDED.channel_fee,
    check_in = EXCLUDED.check_in,
    check_out = EXCLUDED.check_out,
    revenue = EXCLUDED.revenue,
    profit = EXCLUDED.profit,
    expenses = EXCLUDED.expenses,
    margin = EXCLUDED.margin,
    updated_at = now();

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE 
  stay_duration INTEGER;
  task_type TEXT;
  total_guests INTEGER;
  midpoint INTEGER;
  third_point INTEGER;
  two_thirds_point INTEGER;
BEGIN
  -- Only proceed if booking status is confirmed
  IF NEW.status != 'confirmed' THEN
    RETURN NEW;
  END IF;

  -- Calculate stay duration in days
  stay_duration := DATE(NEW.check_out) - DATE(NEW.check_in);
  
  -- Try to get guest count from raw_data
  BEGIN
    total_guests := (
      COALESCE((NEW.raw_data->'guests'->>'adults')::int, 0) + 
      COALESCE((NEW.raw_data->'guests'->>'children')::int, 0) + 
      COALESCE((NEW.raw_data->'guests'->>'infants')::int, 0)
    );
    -- If calculation fails or returns 0, default to 2
    IF total_guests IS NULL OR total_guests = 0 THEN
      total_guests := 2;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    total_guests := 2;
  END;
  
  -- For short stays (1-2 nights)
  IF stay_duration BETWEEN 1 AND 2 THEN
    -- Check if task already exists to avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Standard Cleaning'
      AND due_date = NEW.check_out
    ) THEN
      -- Create standard cleaning for check-out day
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_out,
        'Standard Cleaning',
        'Auto-created for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
  -- For medium stays (3-5 nights)
  ELSIF stay_duration BETWEEN 3 AND 5 THEN
    -- Calculate mid-stay point
    midpoint := stay_duration / 2;
    
    -- Full cleaning at mid-stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Full Cleaning'
      AND due_date = NEW.check_in + midpoint
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_in + midpoint,
        'Full Cleaning',
        'Mid-stay full cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- Linen & towel change day before check-out
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Linen & Towel Change'
      AND due_date = NEW.check_out - 1
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_out - 1,
        'Linen & Towel Change',
        'Pre-departure linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
  -- For longer stays (6-7 nights)
  ELSIF stay_duration BETWEEN 6 AND 7 THEN
    third_point := stay_duration / 3;
    two_thirds_point := (stay_duration * 2) / 3;
    
    -- First full cleaning at 1/3 of stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Full Cleaning'
      AND due_date = NEW.check_in + third_point
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_in + third_point,
        'Full Cleaning',
        'First mid-stay cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- First linen change at 1/3 of stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Linen & Towel Change'
      AND due_date = NEW.check_in + third_point
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_in + third_point,
        'Linen & Towel Change',
        'First linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- Second full cleaning at 2/3 of stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Full Cleaning'
      AND due_date = NEW.check_in + two_thirds_point
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_in + two_thirds_point,
        'Full Cleaning',
        'Second mid-stay cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- Second linen change at 2/3 of stay
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Linen & Towel Change'
      AND due_date = NEW.check_in + two_thirds_point
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_in + two_thirds_point,
        'Linen & Towel Change',
        'Second linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
  -- For extended stays (>7 nights)
  ELSIF stay_duration > 7 THEN
    -- For extended stays, create a custom cleaning task
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND task_type = 'Custom Cleaning Schedule'
    ) THEN
      INSERT INTO public.housekeeping_tasks (
        listing_id,
        booking_id,
        due_date,
        task_type,
        description,
        status
      ) VALUES (
        NEW.listing_id,
        NEW.id,
        NEW.check_in + 1, -- Schedule for day after check-in to plan
        'Custom Cleaning Schedule',
        'Extended stay (' || stay_duration || ' nights) - Create custom schedule with guest. ' || total_guests || ' guests total.',
        'pending'
      );
    END IF;
  END IF;

  -- Always include a standard post-checkout cleaning
  IF NOT EXISTS (
    SELECT 1 FROM public.housekeeping_tasks 
    WHERE booking_id = NEW.id 
    AND task_type = 'Standard Cleaning'
    AND due_date = NEW.check_out
  ) THEN
    INSERT INTO public.housekeeping_tasks (
      listing_id,
      booking_id,
      due_date,
      task_type,
      description,
      status
    ) VALUES (
      NEW.listing_id,
      NEW.id,
      NEW.check_out,
      'Standard Cleaning',
      'Post-checkout cleaning after ' || total_guests || ' guests (' || stay_duration || '-night stay)',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
