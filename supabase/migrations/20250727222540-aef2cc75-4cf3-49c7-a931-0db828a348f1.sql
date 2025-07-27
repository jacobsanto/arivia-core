-- Fix the handle_new_booking function to resolve column ambiguity
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE 
  stay_duration INTEGER;
  total_guests INTEGER;
  midpoint INTEGER;
  third_point INTEGER;
  two_thirds_point INTEGER;
  booking_task_type TEXT;
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
    booking_task_type := 'Standard Cleaning';
    -- Check if task already exists to avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'Auto-created for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
  -- For medium stays (3-5 nights)
  ELSIF stay_duration BETWEEN 3 AND 5 THEN
    -- Calculate mid-stay point
    midpoint := stay_duration / 2;
    
    -- Full cleaning at mid-stay
    booking_task_type := 'Full Cleaning';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'Mid-stay full cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- Linen & towel change day before check-out
    booking_task_type := 'Linen & Towel Change';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'Pre-departure linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
  -- For longer stays (6-7 nights)
  ELSIF stay_duration BETWEEN 6 AND 7 THEN
    third_point := stay_duration / 3;
    two_thirds_point := (stay_duration * 2) / 3;
    
    -- First full cleaning at 1/3 of stay
    booking_task_type := 'Full Cleaning';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'First mid-stay cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- First linen change at 1/3 of stay
    booking_task_type := 'Linen & Towel Change';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'First linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- Second full cleaning at 2/3 of stay
    booking_task_type := 'Full Cleaning';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'Second mid-stay cleaning for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
    -- Second linen change at 2/3 of stay
    booking_task_type := 'Linen & Towel Change';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'Second linen change for ' || stay_duration || '-night stay (' || total_guests || ' guests)',
        'pending'
      );
    END IF;
    
  -- For extended stays (>7 nights)
  ELSIF stay_duration > 7 THEN
    -- For extended stays, create a custom cleaning task
    booking_task_type := 'Custom Cleaning Schedule';
    IF NOT EXISTS (
      SELECT 1 FROM public.housekeeping_tasks 
      WHERE booking_id = NEW.id 
      AND housekeeping_tasks.task_type = booking_task_type
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
        booking_task_type,
        'Extended stay (' || stay_duration || ' nights) - Create custom schedule with guest. ' || total_guests || ' guests total.',
        'pending'
      );
    END IF;
  END IF;

  -- Always include a standard post-checkout cleaning
  booking_task_type := 'Standard Cleaning';
  IF NOT EXISTS (
    SELECT 1 FROM public.housekeeping_tasks 
    WHERE booking_id = NEW.id 
    AND housekeeping_tasks.task_type = booking_task_type
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
      booking_task_type,
      'Post-checkout cleaning after ' || total_guests || ' guests (' || stay_duration || '-night stay)',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;