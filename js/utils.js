const Utils = {
    formatCurrency(amount) {
        return `${SITE_CONFIG.currencySymbol}${Number(amount).toLocaleString(SITE_CONFIG.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    generateId(prefix = 'id') {
        return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
    },

    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    sampleProducts: [
        {
            id: 'prod_1',
            name: 'Nova Smart LED Desk Lamp',
            slug: 'nova-smart-led-desk-lamp',
            category: 'smart-lighting',
            category_name: 'Smart Lighting',
            price: 2999.00,
            original_price: 4999.00,
            rating: 4.8,
            reviews_count: 142,
            image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
            badge: 'Best Seller',
            stock: 45,
            description: 'Futuristic minimalist desk lamp with adjustable color temperature, wireless Qi charging pad in base, and app integration.'
        },
        {
            id: 'prod_2',
            name: 'NovaPulse Portable Blender Pro',
            slug: 'novapulse-portable-blender-pro',
            category: 'kitchen',
            category_name: 'Kitchen Tech',
            price: 1899.00,
            original_price: 2999.00,
            rating: 4.9,
            reviews_count: 288,
            image_url: 'https://images.unsplash.com/photo-1570222094114-d074f7e2e83e?w=600&auto=format&fit=crop&q=80',
            badge: 'Trending',
            stock: 80,
            description: 'High-speed USB-C rechargeable blender with stainless steel blades for smoothies, shakes, and coffee anywhere.'
        },
        {
            id: 'prod_3',
            name: 'NovaMag 3-in-1 Wireless Charging Station',
            slug: 'novamag-wireless-charger',
            category: 'power',
            category_name: 'Power & Chargers',
            price: 2499.00,
            original_price: 3999.00,
            rating: 4.7,
            reviews_count: 96,
            image_url: 'https://images.unsplash.com/photo-1622445275576-7743d570fb16?w=600&auto=format&fit=crop&q=80',
            badge: 'Sale',
            stock: 30,
            description: 'Foldable magnetic wireless charger designed to power your phone, smartwatch, and wireless earbuds simultaneously.'
        },
        {
            id: 'prod_4',
            name: 'NovaBeam Ultra Mini Projector',
            slug: 'novabeam-ultra-mini-projector',
            category: 'audio-visual',
            category_name: 'Audio & Visual',
            price: 8999.00,
            original_price: 12999.00,
            rating: 4.6,
            reviews_count: 64,
            image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
            badge: 'New',
            stock: 15,
            description: 'Pocket-sized HD projector with built-in Android TV, dual speakers, and wireless screen mirroring for home cinema.'
        },
        {
            id: 'prod_5',
            name: 'NovaShield Smart Travel Organizer',
            slug: 'novashield-smart-travel-organizer',
            category: 'lifestyle',
            category_name: 'Lifestyle',
            price: 1499.00,
            original_price: 2299.00,
            rating: 4.8,
            reviews_count: 112,
            image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
            badge: 'Popular',
            stock: 60,
            description: 'Water-resistant tech pouch with RFID blocking, customizable dividers, and built-in cable management.'
        },
        {
            id: 'prod_6',
            name: 'NovaGlow RGB Ambient Light Bars',
            slug: 'novaglow-rgb-ambient-light-bars',
            category: 'smart-lighting',
            category_name: 'Smart Lighting',
            price: 2199.00,
            original_price: 3499.00,
            rating: 4.9,
            reviews_count: 210,
            image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
            badge: 'Hot',
            stock: 50,
            description: 'Music-syncing smart light bars with 16 million colors and multiple lighting modes for gaming and entertainment setups.'
        }
    ],

    sampleCategories: [
        { id: 'cat_1', name: 'Smart Lighting', slug: 'smart-lighting', count: 24, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>' },
        { id: 'cat_2', name: 'Kitchen Tech', slug: 'kitchen', count: 18, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>' },
        { id: 'cat_3', name: 'Power & Chargers', slug: 'power', count: 32, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/></svg>' },
        { id: 'cat_4', name: 'Audio & Visual', slug: 'audio-visual', count: 15, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>' },
        { id: 'cat_5', name: 'Lifestyle', slug: 'lifestyle', count: 29, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>' }
    ]
};
