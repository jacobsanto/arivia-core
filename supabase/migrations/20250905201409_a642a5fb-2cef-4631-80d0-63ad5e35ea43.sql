-- Delete all mock profiles data
DELETE FROM public.profiles;

-- Delete any other mock data from other tables
DELETE FROM public.housekeeping_tasks;
DELETE FROM public.maintenance_tasks;
DELETE FROM public.tasks;
DELETE FROM public.properties;
DELETE FROM public.inventory_items;
DELETE FROM public.inventory_categories;
DELETE FROM public.vendors;
DELETE FROM public.chat_channels;
DELETE FROM public.channel_members;
DELETE FROM public.chat_messages;
DELETE FROM public.direct_conversations;
DELETE FROM public.checklist_templates;
DELETE FROM public.housekeeping_checklist_templates;
DELETE FROM public.cleaning_rules;
DELETE FROM public.rule_conditions;
DELETE FROM public.rule_actions;
DELETE FROM public.rule_assignments;
DELETE FROM public.cleaning_actions;
DELETE FROM public.property_cleaning_configs;
DELETE FROM public.rule_test_results;
DELETE FROM public.task_comments;
DELETE FROM public.task_dependencies;
DELETE FROM public.order_items;
DELETE FROM public.message_reactions;
DELETE FROM public.typing_indicators;
DELETE FROM public.guesty_listings;
DELETE FROM public.user_activity_log;
DELETE FROM public.audit_logs;
DELETE FROM public.security_events;
DELETE FROM public.system_settings;
DELETE FROM public.system_permissions;