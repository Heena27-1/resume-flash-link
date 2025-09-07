-- Enable RLS (Row Level Security)
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resumes table
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  mime_type text not null,
  share_token uuid default gen_random_uuid() unique not null,
  is_public boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create storage bucket for resumes
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);

-- Set up Row Level Security (RLS) policies

-- Profiles policies
alter table public.profiles enable row level security;

create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

create policy "Users can update own profile" 
on public.profiles for update 
using ( auth.uid() = id );

create policy "Users can insert own profile" 
on public.profiles for insert 
with check ( auth.uid() = id );

-- Resumes policies
alter table public.resumes enable row level security;

create policy "Users can view own resumes" 
on public.resumes for select 
using ( auth.uid() = user_id );

create policy "Users can insert own resumes" 
on public.resumes for insert 
with check ( auth.uid() = user_id );

create policy "Users can update own resumes" 
on public.resumes for update 
using ( auth.uid() = user_id );

create policy "Users can delete own resumes" 
on public.resumes for delete 
using ( auth.uid() = user_id );

create policy "Anyone can view public resumes by share token" 
on public.resumes for select 
using ( is_public = true );

-- Storage policies for resumes bucket
create policy "Users can upload resumes" 
on storage.objects for insert 
with check ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can view own resumes" 
on storage.objects for select 
using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update own resumes" 
on storage.objects for update 
using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete own resumes" 
on storage.objects for delete 
using ( bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Anyone can download public resumes" 
on storage.objects for select 
using ( 
  bucket_id = 'resumes' 
  and exists (
    select 1 from public.resumes 
    where file_path = name and is_public = true
  )
);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers to update updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_resumes_updated_at
  before update on public.resumes
  for each row execute procedure public.handle_updated_at();