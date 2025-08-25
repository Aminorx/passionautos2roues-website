-- =====================================================
-- PASSION AUTO2ROUES - SUPABASE DATABASE SETUP
-- =====================================================
-- Ce script configure la base de données complète pour le marketplace

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLES STRUCTURE
-- =====================================================

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text not null,
  phone text,
  whatsapp text,
  type text not null default 'individual' check (type in ('individual', 'professional')),
  company_name text,
  company_logo text,
  address text,
  city text,
  postal_code text,
  website text,
  siret text,
  bio text,
  avatar text,
  specialties jsonb default '[]',
  verified boolean default false,
  email_verified boolean default false,
  contact_preferences jsonb default '[]',
  created_at timestamp with time zone default now() not null,
  last_login_at timestamp with time zone
);

-- Vehicles table
create table public.vehicles (
  id text primary key default ('vehicle_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  brand text not null,
  model text not null,
  year integer not null,
  mileage integer,
  fuel_type text check (fuel_type in ('gasoline', 'diesel', 'electric', 'hybrid')),
  condition text not null check (condition in ('new', 'used', 'damaged')),
  price real not null,
  location text not null,
  images jsonb default '[]',
  features jsonb default '[]',
  is_premium boolean default false,
  premium_type text check (premium_type in ('daily', 'weekly', 'monthly')),
  premium_expires_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  views integer default 0,
  favorites integer default 0,
  status text default 'approved' check (status in ('pending', 'approved', 'rejected'))
);

-- Messages table
create table public.messages (
  id text primary key default ('msg_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  from_user_id uuid references public.users(id) on delete cascade not null,
  to_user_id uuid references public.users(id) on delete cascade not null,
  vehicle_id text references public.vehicles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now() not null,
  read boolean default false
);

-- Wishlist table
create table public.wishlist (
  id text primary key default ('wish_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  user_id uuid references public.users(id) on delete cascade not null,
  vehicle_id text references public.vehicles(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, vehicle_id)
);

-- Saved searches table
create table public.saved_searches (
  id text primary key default ('search_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::text),
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  filters jsonb not null,
  alerts_enabled boolean default false,
  last_checked timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
create index idx_users_email on public.users(email);
create index idx_users_type on public.users(type);
create index idx_users_verified on public.users(verified);

-- Vehicles indexes
create index idx_vehicles_user_id on public.vehicles(user_id);
create index idx_vehicles_category on public.vehicles(category);
create index idx_vehicles_brand on public.vehicles(brand);
create index idx_vehicles_condition on public.vehicles(condition);
create index idx_vehicles_price on public.vehicles(price);
create index idx_vehicles_created_at on public.vehicles(created_at desc);
create index idx_vehicles_is_premium on public.vehicles(is_premium);
create index idx_vehicles_status on public.vehicles(status);
create index idx_vehicles_location on public.vehicles(location);

-- Messages indexes
create index idx_messages_from_user on public.messages(from_user_id);
create index idx_messages_to_user on public.messages(to_user_id);
create index idx_messages_vehicle on public.messages(vehicle_id);
create index idx_messages_created_at on public.messages(created_at desc);

-- Wishlist indexes
create index idx_wishlist_user_id on public.wishlist(user_id);
create index idx_wishlist_vehicle_id on public.wishlist(vehicle_id);

-- Saved searches indexes
create index idx_saved_searches_user_id on public.saved_searches(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.vehicles enable row level security;
alter table public.messages enable row level security;
alter table public.wishlist enable row level security;
alter table public.saved_searches enable row level security;

-- Users policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- Vehicles policies
create policy "Anyone can view approved vehicles" on public.vehicles
  for select using (status = 'approved');

create policy "Users can view their own vehicles" on public.vehicles
  for select using (auth.uid() = user_id);

create policy "Users can insert their own vehicles" on public.vehicles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own vehicles" on public.vehicles
  for update using (auth.uid() = user_id);

create policy "Users can delete their own vehicles" on public.vehicles
  for delete using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view their own messages" on public.messages
  for select using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send messages" on public.messages
  for insert with check (auth.uid() = from_user_id);

create policy "Users can update their received messages" on public.messages
  for update using (auth.uid() = to_user_id);

-- Wishlist policies
create policy "Users can view their own wishlist" on public.wishlist
  for select using (auth.uid() = user_id);

create policy "Users can manage their own wishlist" on public.wishlist
  for all using (auth.uid() = user_id);

-- Saved searches policies
create policy "Users can view their own saved searches" on public.saved_searches
  for select using (auth.uid() = user_id);

create policy "Users can manage their own saved searches" on public.saved_searches
  for all using (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger for vehicles updated_at
create trigger update_vehicles_updated_at
    before update on public.vehicles
    for each row
    execute function update_updated_at_column();

-- Trigger for saved_searches updated_at
create trigger update_saved_searches_updated_at
    before update on public.saved_searches
    for each row
    execute function update_updated_at_column();

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user profile on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample users (these will be created when users sign up via Supabase Auth)
-- Sample professional user
insert into public.users (
  id, email, name, type, company_name, verified, specialties, contact_preferences
) values (
  gen_random_uuid(),
  'garage.martin@example.com',
  'Garage Martin',
  'professional',
  'Garage Martin SARL',
  true,
  '["Réparation", "Vente", "Entretien"]',
  '["email", "phone", "whatsapp"]'
) on conflict (email) do nothing;

-- Sample individual user
insert into public.users (
  id, email, name, type, verified
) values (
  gen_random_uuid(),
  'jean.dupont@example.com',
  'Jean Dupont',
  'individual',
  false
) on conflict (email) do nothing;

-- Note: Vehicles will be inserted via the application after users sign up

-- =====================================================
-- REALTIME SUBSCRIPTIONS (Optional)
-- =====================================================

-- Enable realtime for messages (for chat functionality)
alter publication supabase_realtime add table public.messages;

-- Enable realtime for vehicles (for live updates)
alter publication supabase_realtime add table public.vehicles;

-- =====================================================
-- STORAGE BUCKETS (for vehicle images)
-- =====================================================

-- Create storage bucket for vehicle images
insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

-- Policy for vehicle images bucket
create policy "Anyone can view vehicle images" on storage.objects
  for select using (bucket_id = 'vehicle-images');

create policy "Authenticated users can upload vehicle images" on storage.objects
  for insert with check (
    bucket_id = 'vehicle-images' 
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own vehicle images" on storage.objects
  for update using (
    bucket_id = 'vehicle-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own vehicle images" on storage.objects
  for delete using (
    bucket_id = 'vehicle-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This script has created:
-- ✅ All necessary tables with proper relationships
-- ✅ Indexes for optimal performance  
-- ✅ Row Level Security policies for data protection
-- ✅ Triggers for automatic timestamp updates
-- ✅ User profile creation on signup
-- ✅ Storage bucket for vehicle images
-- ✅ Sample data structure

-- Next steps:
-- 1. Run this script in your Supabase SQL editor
-- 2. Configure OAuth providers (Google, Apple) in Supabase Auth settings
-- 3. Update your application environment variables
-- 4. Test the authentication flow

select 'Supabase database setup completed successfully! 🎉' as status;