-- NovaCart Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    email text,
    role text default 'customer' check (role in ('customer', 'admin')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    icon text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products table
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    description text,
    category_id uuid references public.categories(id) on delete set null,
    price decimal(10,2) not null,
    original_price decimal(10,2),
    stock integer default 0 not null,
    image_url text,
    badge text,
    rating decimal(3,2) default 5.00,
    reviews_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references public.profiles(id) on delete set null,
    order_number text unique not null,
    status text default 'pending' not null,
    payment_status text default 'pending' not null,
    supplier_status text default 'pending' not null,
    total decimal(10,2) not null,
    shipping_address jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items table
create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity integer not null,
    price decimal(10,2) not null
);

-- Wishlist table
create table public.wishlists (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(customer_id, product_id)
);

-- Contact messages table
create table public.contact_messages (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Newsletter subscribers
create table public.newsletter_subscribers (
    id uuid default uuid_generate_v4() primary key,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
