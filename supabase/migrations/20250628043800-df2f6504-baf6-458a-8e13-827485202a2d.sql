
-- First, let's ensure we have some default permissions with proper categories
INSERT INTO public.permissions (tenant_id, key, label, description, category) VALUES
  (gen_random_uuid(), 'dashboard.view', 'View Dashboard', 'Access to main dashboard', 'dashboard'),
  (gen_random_uuid(), 'properties.view', 'View Properties', 'View property listings', 'properties'),
  (gen_random_uuid(), 'properties.create', 'Create Properties', 'Create new properties', 'properties'),
  (gen_random_uuid(), 'properties.edit', 'Edit Properties', 'Modify existing properties', 'properties'),
  (gen_random_uuid(), 'properties.delete', 'Delete Properties', 'Remove properties', 'properties'),
  (gen_random_uuid(), 'tasks.view_all', 'View All Tasks', 'View all system tasks', 'tasks'),
  (gen_random_uuid(), 'tasks.view_assigned', 'View Assigned Tasks', 'View tasks assigned to user', 'tasks'),
  (gen_random_uuid(), 'tasks.create', 'Create Tasks', 'Create new tasks', 'tasks'),
  (gen_random_uuid(), 'tasks.assign', 'Assign Tasks', 'Assign tasks to team members', 'tasks'),
  (gen_random_uuid(), 'tasks.complete', 'Complete Tasks', 'Mark tasks as completed', 'tasks'),
  (gen_random_uuid(), 'inventory.view', 'View Inventory', 'View inventory levels and items', 'inventory'),
  (gen_random_uuid(), 'inventory.manage', 'Manage Inventory', 'Add, edit, and manage inventory items', 'inventory'),
  (gen_random_uuid(), 'inventory.transfers', 'Approve Transfers', 'Approve inventory transfers', 'inventory'),
  (gen_random_uuid(), 'users.view', 'View Users', 'View user profiles', 'users'),
  (gen_random_uuid(), 'users.create', 'Create Users', 'Create new user accounts', 'users'),
  (gen_random_uuid(), 'users.edit', 'Edit Users', 'Modify user accounts', 'users'),
  (gen_random_uuid(), 'users.delete', 'Delete Users', 'Remove user accounts', 'users'),
  (gen_random_uuid(), 'reports.view', 'View Reports', 'Access to system reports', 'reports'),
  (gen_random_uuid(), 'reports.create', 'Create Reports', 'Generate custom reports', 'reports'),
  (gen_random_uuid(), 'chat.access', 'Access Chat', 'Use chat functionality', 'communication'),
  (gen_random_uuid(), 'damage_reports.view', 'View Damage Reports', 'Access damage reports', 'reports'),
  (gen_random_uuid(), 'damage_reports.create', 'Create Damage Reports', 'Submit damage reports', 'reports'),
  (gen_random_uuid(), 'settings.manage', 'Manage Settings', 'Access system settings', 'system')
ON CONFLICT (tenant_id, key) DO NOTHING;

-- Create default role-permission assignments
-- Get role and permission IDs for assignments
DO $$
DECLARE
    superadmin_role_id uuid;
    tenant_admin_role_id uuid;
    property_manager_role_id uuid;
    housekeeping_role_id uuid;
    maintenance_role_id uuid;
    inventory_manager_role_id uuid;
    concierge_role_id uuid;
    perm_id uuid;
BEGIN
    -- Get role IDs
    SELECT id INTO superadmin_role_id FROM public.roles WHERE name = 'superadmin' LIMIT 1;
    SELECT id INTO tenant_admin_role_id FROM public.roles WHERE name = 'tenant_admin' LIMIT 1;
    SELECT id INTO property_manager_role_id FROM public.roles WHERE name = 'property_manager' LIMIT 1;
    SELECT id INTO housekeeping_role_id FROM public.roles WHERE name = 'housekeeping_staff' LIMIT 1;
    SELECT id INTO maintenance_role_id FROM public.roles WHERE name = 'maintenance_staff' LIMIT 1;
    SELECT id INTO inventory_manager_role_id FROM public.roles WHERE name = 'inventory_manager' LIMIT 1;
    SELECT id INTO concierge_role_id FROM public.roles WHERE name = 'concierge' LIMIT 1;

    -- Assign ALL permissions to superadmin
    IF superadmin_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), superadmin_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Assign permissions to tenant_admin (most permissions except user deletion)
    IF tenant_admin_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions WHERE key != 'users.delete' LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), tenant_admin_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Assign permissions to property_manager
    IF property_manager_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions 
        WHERE key IN (
            'dashboard.view', 'properties.view', 'properties.edit',
            'tasks.view_all', 'tasks.create', 'tasks.assign', 'tasks.complete',
            'inventory.view', 'reports.view', 'chat.access'
        ) LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), property_manager_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Assign permissions to housekeeping_staff
    IF housekeeping_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions 
        WHERE key IN (
            'dashboard.view', 'properties.view', 'tasks.view_assigned', 
            'tasks.complete', 'inventory.view', 'chat.access'
        ) LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), housekeeping_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Assign permissions to maintenance_staff
    IF maintenance_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions 
        WHERE key IN (
            'dashboard.view', 'properties.view', 'tasks.view_assigned', 
            'tasks.complete', 'inventory.view', 'chat.access', 'damage_reports.create'
        ) LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), maintenance_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Assign permissions to inventory_manager
    IF inventory_manager_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions 
        WHERE key IN (
            'dashboard.view', 'inventory.view', 'inventory.manage', 
            'inventory.transfers', 'reports.view', 'chat.access'
        ) LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), inventory_manager_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;

    -- Assign permissions to concierge
    IF concierge_role_id IS NOT NULL THEN
        FOR perm_id IN SELECT id FROM public.permissions 
        WHERE key IN (
            'dashboard.view', 'properties.view', 'tasks.view_assigned', 
            'tasks.complete', 'chat.access'
        ) LOOP
            INSERT INTO public.role_permissions (tenant_id, role_id, permission_id)
            VALUES (gen_random_uuid(), concierge_role_id, perm_id)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;
