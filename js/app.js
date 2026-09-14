const App = {
    init() {
        this.renderCategories();
        this.renderFeaturedProducts();
        this.renderTrendingProducts();
        this.bindEvents();
    },

    renderCategories() {
        const container = document.getElementById('categories-grid-container');
        const dropdown = document.getElementById('nav-categories-dropdown');
        if (!container && !dropdown) return;

        const categories = Utils.sampleCategories;

        if (container) {
            container.innerHTML = categories.map(cat => `
                <a href="shop.html?category=${cat.slug}" class="category-card">
                    <div class="category-icon">${cat.icon}</div>
                    <h3>${cat.name}</h3>
                    <p>${cat.count} Products</p>
                </a>
            `).join('');
        }

        if (dropdown) {
            dropdown.innerHTML = categories.map(cat => `
                <a href="shop.html?category=${cat.slug}">${cat.name}</a>
            `).join('');
        }
    },

    renderFeaturedProducts() {
        const container = document.getElementById('featured-products-container');
        if (!container) return;

        const products = Utils.sampleProducts.slice(0, 4);
        container.innerHTML = products.map(p => this.createProductCardHtml(p)).join('');
    },

    renderTrendingProducts() {
        const container = document.getElementById('trending-products-container');
        if (!container) return;

        const products = Utils.sampleProducts.slice(2, 6);
        container.innerHTML = products.map(p => this.createProductCardHtml(p)).join('');
    },

    createProductCardHtml(p) {
        const isInWishlist = Wishlist.isItemInWishlist(p.id);
        const discountPercent = Math.round(((p.original_price - p.price) / p.original_price) * 100);

        return `
            <div class="product-card" data-id="${p.id}">
                <div class="product-image-wrapper">
                    <span class="product-badge">${p.badge || `${discountPercent}% OFF`}</span>
                    <button class="wishlist-toggle-btn ${isInWishlist ? 'active' : ''}" onclick="App.toggleWishlist('${p.id}')" aria-label="Add to Wishlist">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </button>
                    <a href="product.html?id=${p.id}">
                        <img src="${p.image_url}" alt="${p.name}" class="product-image" loading="lazy">
                    </a>
                </div>
                <div class="product-content">
                    <div class="product-category">${p.category_name}</div>
                    <h3 class="product-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
                    <div class="product-rating">
                        ★ <span>${p.rating} (${p.reviews_count})</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="current-price">${Utils.formatCurrency(p.price)}</span>
                            <span class="original-price">${Utils.formatCurrency(p.original_price)}</span>
                        </div>
                        <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="Cart.addItem(${JSON.stringify(p).replace(/"/g, '&quot;')})">Add</button>
                    </div>
                </div>
            </div>
        `;
    },

    toggleWishlist(productId) {
        const product = Utils.sampleProducts.find(p => p.id === productId);
        if (product) {
            Wishlist.toggleItem(product);
            // Re-render to update heart icon state
            this.renderFeaturedProducts();
            this.renderTrendingProducts();
        }
    },

    bindEvents() {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('newsletter-email');
                if (emailInput && emailInput.value) {
                    NotificationSystem.show('Successfully subscribed! Use code NOVA15 for 15% off.', 'success');
                    newsletterForm.reset();
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
