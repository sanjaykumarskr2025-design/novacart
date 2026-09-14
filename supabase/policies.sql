-- NovaCart Supabase Row Level Security (RLS) Policies

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlists enable row level security;

-- Products and categories are publicly readable
create policy "Public products are viewable by everyone" on public.products for select using (true);
create policy "Public categories are viewable by everyone" on public.categories for select using (true);

-- Profiles readable by owner
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Wishlists policy
create policy "Users can manage own wishlist" on public.wishlists for all using (auth.uid() = customer_id);

-- Orders policy
create policy "Users can view own orders" on public.orders for select using (auth.uid() = customer_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = customer_id);
