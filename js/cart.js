const Cart = {
    items: [],
    coupon: null,
    discountPercent: 0,

    init() {
        this.loadFromStorage();
        this.updateUI();
        this.bindEvents();
    },

    loadFromStorage() {
        const saved = localStorage.getItem('novacart_cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
        const savedCoupon = localStorage.getItem('novacart_coupon');
        if (savedCoupon) {
            try {
                this.coupon = JSON.parse(savedCoupon);
                this.discountPercent = this.coupon.discount || 0;
            } catch (e) {
                this.coupon = null;
            }
        }
    },

    saveToStorage() {
        localStorage.setItem('novacart_cart', JSON.stringify(this.items));
        if (this.coupon) {
            localStorage.setItem('novacart_coupon', JSON.stringify(this.coupon));
        } else {
            localStorage.removeItem('novacart_coupon');
        }
        this.updateUI();
    },

    addItem(product, quantity = 1) {
        const existingIndex = this.items.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            this.items[existingIndex].quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || product.image,
                quantity: quantity
            });
        }
        this.saveToStorage();
        NotificationSystem.show(`Added "${product.name}" to cart!`, 'success');
        this.openDrawer();
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        NotificationSystem.show('Item removed from cart', 'info');
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity, 10);
            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveToStorage();
            }
        }
    },

    applyCoupon(code) {
        const normalized = code.trim().toUpperCase();
        if (normalized === 'NOVA10' || normalized === 'WELCOME10') {
            this.coupon = { code: normalized, discount: 10 };
            this.discountPercent = 10;
            this.saveToStorage();
            NotificationSystem.show(`Coupon ${normalized} applied (10% OFF)!`, 'success');
            return true;
        } else if (normalized === 'NOVA20') {
            this.coupon = { code: normalized, discount: 20 };
            this.discountPercent = 20;
            this.saveToStorage();
            NotificationSystem.show(`Coupon ${normalized} applied (20% OFF)!`, 'success');
            return true;
        } else {
            NotificationSystem.show('Invalid or expired coupon code', 'error');
            return false;
        }
    },

    removeCoupon() {
        this.coupon = null;
        this.discountPercent = 0;
        this.saveToStorage();
        NotificationSystem.show('Coupon removed', 'info');
    },

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getDiscountAmount() {
        return (this.getSubtotal() * this.discountPercent) / 100;
    },

    getTotal() {
        return Math.max(0, this.getSubtotal() - this.getDiscountAmount());
    },

    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    openDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) drawer.classList.add('active');
    },

    closeDrawer() {
        const drawer = document.getElementById('cart-drawer');
        if (drawer) drawer.classList.remove('active');
    },

    updateUI() {
        // Badges
        const badge = document.getElementById('cart-badge');
        const itemCount = this.getItemCount();
        if (badge) badge.textContent = itemCount;

        const countLabel = document.getElementById('cart-item-count');
        if (countLabel) countLabel.textContent = itemCount;

        // Drawer Items List
        const container = document.getElementById('cart-items-container');
        if (container) {
            if (this.items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state text-center" style="padding: 3rem 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; color: var(--text-muted);"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Your cart is currently empty.</p>
                        <a href="shop.html" class="btn btn-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Start Shopping</a>
                    </div>
                `;
            } else {
                container.innerHTML = this.items.map(item => `
                    <div class="cart-item">
                        <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <div class="cart-item-price">${Utils.formatCurrency(item.price)}</div>
                            <div class="cart-item-controls">
                                <div class="quantity-selector">
                                    <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                    <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                                    <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                                </div>
                                <button class="remove-item-btn" onclick="Cart.removeItem('${item.id}')">Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Summary calculations
        const subtotalEl = document.getElementById('cart-subtotal');
        if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(this.getSubtotal());

        const discountWrapper = document.getElementById('cart-discount-wrapper');
        const discountAmountEl = document.getElementById('cart-discount-amount');
        const couponLabel = document.getElementById('coupon-code-label');

        if (discountWrapper && discountAmountEl) {
            if (this.coupon && this.discountPercent > 0) {
                discountWrapper.style.display = 'flex';
                discountAmountEl.textContent = `-${Utils.formatCurrency(this.getDiscountAmount())}`;
                if (couponLabel) couponLabel.textContent = this.coupon.code;
            } else {
                discountWrapper.style.display = 'none';
            }
        }

        const totalEl = document.getElementById('cart-total');
        if (totalEl) totalEl.textContent = Utils.formatCurrency(this.getTotal());
    },

    bindEvents() {
        const triggerBtn = document.getElementById('cart-trigger-btn');
        const closeBtn = document.getElementById('cart-close-btn');
        const backdrop = document.querySelector('#cart-drawer .cart-backdrop');

        if (triggerBtn) triggerBtn.addEventListener('click', () => this.openDrawer());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
        if (backdrop) backdrop.addEventListener('click', () => this.closeDrawer());

        const applyCouponBtn = document.getElementById('apply-coupon-btn');
        const couponInput = document.getElementById('cart-coupon-input');
        if (applyCouponBtn && couponInput) {
            applyCouponBtn.addEventListener('click', () => {
                if (couponInput.value.trim()) {
                    this.applyCoupon(couponInput.value);
                    couponInput.value = '';
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());
