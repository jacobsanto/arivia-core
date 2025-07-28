-- Populate existing cleaning rules with default actions based on their rule names and stay length
DO $$
DECLARE
    rule_record RECORD;
    default_actions JSONB;
BEGIN
    -- Loop through all existing rules that have empty or null actions_by_day
    FOR rule_record IN 
        SELECT id, rule_name, min_nights, max_nights, actions_by_day
        FROM cleaning_rules 
        WHERE actions_by_day IS NULL OR actions_by_day = '{}'::jsonb
    LOOP
        -- Determine default actions based on rule name and stay length
        IF rule_record.rule_name ILIKE '%short%' OR rule_record.max_nights <= 3 THEN
            -- Short stays: Standard cleaning on day 1
            default_actions := jsonb_build_object(
                '1', jsonb_build_array('Standard Cleaning')
            );
        ELSIF rule_record.rule_name ILIKE '%medium%' OR (rule_record.min_nights <= 5 AND rule_record.max_nights <= 7) THEN
            -- Medium stays: Standard cleaning on day 1, Full cleaning mid-stay, Linen change
            default_actions := jsonb_build_object(
                '1', jsonb_build_array('Standard Cleaning'),
                '3', jsonb_build_array('Full Cleaning'),
                '4', jsonb_build_array('Linen & Towel Change')
            );
        ELSIF rule_record.rule_name ILIKE '%extended%' OR rule_record.max_nights > 7 THEN
            -- Extended stays: Multiple cleaning sessions
            default_actions := jsonb_build_object(
                '1', jsonb_build_array('Standard Cleaning'),
                '3', jsonb_build_array('Full Cleaning'),
                '4', jsonb_build_array('Linen & Towel Change'),
                '6', jsonb_build_array('Full Cleaning'),
                '7', jsonb_build_array('Linen & Towel Change')
            );
        ELSE
            -- Default fallback: Standard cleaning on day 1
            default_actions := jsonb_build_object(
                '1', jsonb_build_array('Standard Cleaning')
            );
        END IF;
        
        -- Update the rule with default actions
        UPDATE cleaning_rules 
        SET actions_by_day = default_actions,
            updated_at = now()
        WHERE id = rule_record.id;
        
        RAISE NOTICE 'Updated rule % with default actions: %', rule_record.rule_name, default_actions;
    END LOOP;
END $$;