
-- Create a database function to generate housekeeping tasks for bookings
CREATE OR REPLACE FUNCTION public.generate_housekeeping_tasks_for_booking(booking_record guesty_bookings)
RETURNS void
LANGUAGE plpgsql
AS $$
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
$$;

-- Create trigger function for automatic task generation
CREATE OR REPLACE FUNCTION public.trigger_generate_housekeeping_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate tasks for the new/updated booking
  PERFORM public.generate_housekeeping_tasks_for_booking(NEW);
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
DROP TRIGGER IF EXISTS trigger_housekeeping_tasks_on_insert ON public.guesty_bookings;
CREATE TRIGGER trigger_housekeeping_tasks_on_insert
  AFTER INSERT ON public.guesty_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_generate_housekeeping_tasks();

-- Create trigger for UPDATE operations
DROP TRIGGER IF EXISTS trigger_housekeeping_tasks_on_update ON public.guesty_bookings;
CREATE TRIGGER trigger_housekeeping_tasks_on_update
  AFTER UPDATE ON public.guesty_bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR 
        OLD.check_in IS DISTINCT FROM NEW.check_in OR 
        OLD.check_out IS DISTINCT FROM NEW.check_out)
  EXECUTE FUNCTION public.trigger_generate_housekeeping_tasks();
