const SearchModule = {
    init() {
        const triggerBtn = document.getElementById('search-trigger-btn');
        const closeBtn = document.getElementById('search-close-btn');
        const overlay = document.getElementById('search-overlay');
        const backdrop = document.querySelector('.search-overlay-backdrop');
        const input = document.getElementById('global-search-input');

        if (triggerBtn && overlay) {
            triggerBtn.addEventListener('click', () => {
                overlay.classList.add('active');
                if (input) input.focus();
            });
        }

        if (closeBtn && overlay) {
            closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
        }

        if (backdrop && overlay) {
            backdrop.addEventListener('click', () => overlay.classList.remove('active'));
        }

        if (input) {
            input.addEventListener('input', Utils.debounce((e) => {
                this.performSearch(e.target.value.trim());
            }, 300));
        }

        // Tag clicks
        document.querySelectorAll('.search-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const query = tag.getAttribute('data-query');
                if (input) input.value = query;
                this.performSearch(query);
            });
        });
    },

    performSearch(query) {
        const container = document.getElementById('search-results-container');
        if (!container) return;

        if (!query) {
            container.innerHTML = '';
            return;
        }

        const products = Utils.sampleProducts;
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No products found matching "${query}".</p>`;
            return;
        }

        container.innerHTML = filtered.map(p => `
            <div class="product-card" style="font-size: 0.9rem;">
                <div class="product-image-wrapper" style="height: 160px;">
                    <img src="${p.image_url}" alt="${p.name}" class="product-image">
                </div>
                <div class="product-content" style="padding: 1rem;">
                    <h4 class="product-title"><a href="product.html?id=${p.id}">${p.name}</a></h4>
                    <div class="product-price">
                        <span class="current-price">${Utils.formatCurrency(p.price)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => SearchModule.init());
