const Wishlist = {
    items: [],

    init() {
        this.loadFromStorage();
        this.updateUI();
    },

    loadFromStorage() {
        const saved = localStorage.getItem('novacart_wishlist');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
    },

    saveToStorage() {
        localStorage.setItem('novacart_wishlist', JSON.stringify(this.items));
        this.updateUI();
    },

    toggleItem(product) {
        const index = this.items.findIndex(item => item.id === product.id);
        if (index > -1) {
            this.items.splice(index, 1);
            NotificationSystem.show(`Removed "${product.name}" from wishlist`, 'info');
            return false;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url || product.image,
                category: product.category_name || product.category
            });
            NotificationSystem.show(`Added "${product.name}" to wishlist!`, 'success');
            return true;
        }
    },

    isItemInWishlist(productId) {
        return this.items.some(item => item.id === productId);
    },

    updateUI() {
        const badge = document.getElementById('wishlist-badge');
        if (badge) badge.textContent = this.items.length;
    }
};

document.addEventListener('DOMContentLoaded', () => Wishlist.init());
