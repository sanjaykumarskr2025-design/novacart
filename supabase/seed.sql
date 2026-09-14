-- NovaCart Seed Data

insert into public.categories (name, slug) values
('Smart Lighting', 'smart-lighting'),
('Kitchen Tech', 'kitchen'),
('Power & Chargers', 'power'),
('Audio & Visual', 'audio-visual'),
('Lifestyle', 'lifestyle');

insert into public.products (name, slug, category_id, price, original_price, stock, image_url, badge, rating, reviews_count, description) values
('Nova Smart LED Desk Lamp', 'nova-smart-led-desk-lamp', (select id from public.categories where slug = 'smart-lighting'), 2999.00, 4999.00, 45, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 'Best Seller', 4.8, 142, 'Futuristic minimalist desk lamp with adjustable color temperature and wireless charging.'),
('NovaPulse Portable Blender Pro', 'novapulse-portable-blender-pro', (select id from public.categories where slug = 'kitchen'), 1899.00, 2999.00, 80, 'https://images.unsplash.com/photo-1570222094114-d074f7e2e83e?w=600&auto=format&fit=crop&q=80', 'Trending', 4.9, 288, 'High-speed USB-C rechargeable blender with stainless steel blades.'),
('NovaMag 3-in-1 Wireless Charging Station', 'novamag-wireless-charger', (select id from public.categories where slug = 'power'), 2499.00, 3999.00, 30, 'https://images.unsplash.com/photo-1622445275576-7743d570fb16?w=600&auto=format&fit=crop&q=80', 'Sale', 4.7, 96, 'Foldable magnetic wireless charger for phone, watch, and earbuds.');
