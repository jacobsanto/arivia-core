-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'administrator', 'property_manager', 'housekeeping_staff', 'maintenance_staff', 'guest');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'housekeeping_staff',
  avatar TEXT,
  phone TEXT,
  custom_permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  status TEXT DEFAULT 'active',
  property_type TEXT DEFAULT 'villa',
  num_bedrooms INTEGER DEFAULT 0,
  num_bathrooms INTEGER DEFAULT 0,
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory categories table
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  categories TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category_id UUID REFERENCES public.inventory_categories(id),
  quantity NUMERIC DEFAULT 0,
  min_quantity NUMERIC DEFAULT 0,
  target_quantity NUMERIC,
  unit TEXT DEFAULT 'Each',
  unit_cost NUMERIC DEFAULT 0,
  vendor TEXT,
  location TEXT DEFAULT 'main',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  property_id UUID REFERENCES public.properties(id),
  room_number TEXT,
  assigned_to UUID REFERENCES public.profiles(user_id),
  created_by UUID REFERENCES public.profiles(user_id),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration INTEGER, -- in minutes
  notes TEXT,
  checklist_items JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cleaning rules table
CREATE TABLE public.cleaning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id),
  task_type TEXT NOT NULL,
  conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory usage table
CREATE TABLE public.inventory_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.inventory_items(id),
  property_id UUID REFERENCES public.properties(id),
  quantity_used NUMERIC NOT NULL,
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reported_by UUID REFERENCES public.profiles(user_id),
  task_id UUID REFERENCES public.tasks(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id),
  order_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  total_amount NUMERIC DEFAULT 0,
  requestor UUID REFERENCES public.profiles(user_id),
  department TEXT,
  notes TEXT,
  manager_approved_by UUID REFERENCES public.profiles(user_id),
  manager_approved_at TIMESTAMP WITH TIME ZONE,
  admin_approved_by UUID REFERENCES public.profiles(user_id),
  admin_approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES public.profiles(user_id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.inventory_items(id),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table (for role assignments)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);
  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Properties policies
CREATE POLICY "Authenticated users can view properties" ON public.properties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage properties" ON public.properties
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'superadmin'));

-- Inventory categories policies
CREATE POLICY "Authenticated users can view categories" ON public.inventory_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage categories" ON public.inventory_categories
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'superadmin'));

-- Vendors policies
CREATE POLICY "Authenticated users can view vendors" ON public.vendors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage vendors" ON public.vendors
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'administrator') OR public.has_role(auth.uid(), 'superadmin'));

-- Inventory items policies
CREATE POLICY "Authenticated users can view inventory" ON public.inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can update inventory" ON public.inventory_items
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'housekeeping_staff') OR 
         public.has_role(auth.uid(), 'property_manager') OR
         public.has_role(auth.uid(), 'administrator') OR 
         public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Managers can insert inventory" ON public.inventory_items
  FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'property_manager') OR
              public.has_role(auth.uid(), 'administrator') OR 
              public.has_role(auth.uid(), 'superadmin'));

-- Tasks policies
CREATE POLICY "Authenticated users can view tasks" ON public.tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update assigned tasks" ON public.tasks
  FOR UPDATE TO authenticated 
  USING (assigned_to = auth.uid() OR created_by = auth.uid() OR
         public.has_role(auth.uid(), 'property_manager') OR
         public.has_role(auth.uid(), 'administrator') OR 
         public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Staff can create tasks" ON public.tasks
  FOR INSERT TO authenticated 
  WITH CHECK (created_by = auth.uid());

-- Orders policies
CREATE POLICY "Authenticated users can view orders" ON public.orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can create orders" ON public.orders
  FOR INSERT TO authenticated 
  WITH CHECK (requestor = auth.uid());

CREATE POLICY "Managers can update orders" ON public.orders
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'property_manager') OR
         public.has_role(auth.uid(), 'administrator') OR 
         public.has_role(auth.uid(), 'superadmin'));

-- Other tables - basic authenticated access
CREATE POLICY "Authenticated access" ON public.cleaning_rules
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated access" ON public.inventory_usage
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated access" ON public.order_items
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can manage their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'housekeeping_staff'::app_role)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_categories_updated_at BEFORE UPDATE ON public.inventory_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cleaning_rules_updated_at BEFORE UPDATE ON public.cleaning_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data

-- Sample categories
INSERT INTO public.inventory_categories (name, description) VALUES
  ('Cleaning Supplies', 'General cleaning products and tools'),
  ('Linens', 'Bed linens, towels, and textiles'),
  ('Toiletries', 'Guest bathroom amenities'),
  ('Kitchen Supplies', 'Kitchen equipment and consumables'),
  ('Maintenance', 'Tools and supplies for property maintenance');

-- Sample properties
INSERT INTO public.properties (name, address, status, property_type, num_bedrooms, num_bathrooms) VALUES
  ('Villa Aurora', 'Oia, Santorini, Greece', 'active', 'villa', 3, 2),
  ('Villa Caldera', 'Fira, Santorini, Greece', 'active', 'villa', 4, 3),
  ('Villa Oceana', 'Mykonos, Greece', 'active', 'villa', 2, 2),
  ('Villa Azure', 'Paros, Greece', 'maintenance', 'villa', 5, 4),
  ('Villa Sunset', 'Naxos, Greece', 'active', 'villa', 3, 2);

-- Sample vendors
INSERT INTO public.vendors (name, email, phone, categories, status) VALUES
  ('Clean & Fresh Supplies', 'orders@cleanfresh.gr', '+30 210 123 4567', ARRAY['Cleaning Supplies', 'Toiletries'], 'active'),
  ('Aegean Linens Co', 'sales@aegeanlinens.gr', '+30 210 234 5678', ARRAY['Linens'], 'active'),
  ('Island Maintenance', 'info@islandmaint.gr', '+30 210 345 6789', ARRAY['Maintenance'], 'active');

-- Sample inventory items
INSERT INTO public.inventory_items (name, sku, category_id, quantity, min_quantity, target_quantity, unit, unit_cost, vendor, location) 
SELECT 
  'All-Purpose Cleaner', 'APC-001', id, 50, 10, 100, 'Bottle', 3.50, 'Clean & Fresh Supplies', 'main'
FROM public.inventory_categories WHERE name = 'Cleaning Supplies'
UNION ALL
SELECT 
  'White Bath Towels', 'BTW-001', id, 25, 5, 50, 'Each', 12.00, 'Aegean Linens Co', 'main'
FROM public.inventory_categories WHERE name = 'Linens'
UNION ALL
SELECT 
  'Shampoo Bottles', 'SHP-001', id, 30, 8, 60, 'Bottle', 2.25, 'Clean & Fresh Supplies', 'main'
FROM public.inventory_categories WHERE name = 'Toiletries';