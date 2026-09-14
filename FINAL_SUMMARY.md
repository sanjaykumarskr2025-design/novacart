# NovaCart — Futuristic E-Commerce & Dropshipping Store

NovaCart has been successfully created as a **complete, production-ready, mobile-first dropshipping e-commerce web application** built with HTML5, CSS3, JavaScript (ES Modules), Three.js, GSAP, and Supabase.

---

## What Was Built

1. **Immersive Homepage (`index.html`)**:
   - 3D interactive hero scene powered by **Three.js** with floating geometric tech models and particle fields.
   - Dynamic category grids, featured innovations, trending worldwide products, trust badges, and newsletter subscription form.
2. **Product Catalog & Search (`shop.html`)**:
   - Grid view, category filtering, price sorting, real-time search overlay with instant keyword suggestions.
3. **Product Detail Page (`product.html`)**:
   - High-resolution image preview, ratings, reviews, stock status, and add-to-cart functionality.
4. **Interactive Shopping Cart & Drawer (`js/cart.js`)**:
   - Slide-out glassmorphism cart drawer, quantity increments, promo code system (`NOVA10`, `NOVA20`), and `localStorage` persistence.
5. **Secure Checkout (`checkout.html`)**:
   - Multi-step order form with secure payment options (Razorpay, Stripe, Cash on Delivery) and automated demo order confirmation.
6. **Customer Account & Wishlist (`account.html`, `wishlist.html`)**:
   - Profile management, order history, and saved items wishlist.
7. **Admin Dashboard (`admin/dashboard.html`)**:
   - Comprehensive analytics overview, revenue metrics, order management, and dropshipping supplier status timeline.
8. **Backend & Database (`supabase/`)**:
   - Complete PostgreSQL schema (`schema.sql`), Row Level Security policies (`policies.sql`), and seed data (`seed.sql`).
9. **GitHub Pages & CI/CD Deployment**:
   - Fully configured `.github/workflows/deploy.yml` for automated GitHub Pages deployment, `.nojekyll`, robots.txt, sitemap.xml, and PWA manifest.

---

## How to Run & Test Locally

1. Open `index.html` in any modern web browser or serve locally using a static server:
   ```bash
   npx http-server .
   ```
2. The application runs immediately in **Demo Mode** with fully functional sample products, cart, wishlist, search, and checkout.

---

## How to Deploy to GitHub Pages

1. Initialize git and push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Complete NovaCart build"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/novacart.git
   git push -u origin main
   ```
2. In your GitHub repository settings, go to **Pages**, select **GitHub Actions** as the deployment source, and wait for the workflow to complete.
