# NovaCart — Futuristic Dropshipping E-Commerce

NovaCart is a production-ready, mobile-first, futuristic dropshipping e-commerce web application featuring immersive Three.js 3D hero scenes and product viewers, GSAP animations, a complete Supabase database and authentication backend, automated order fulfillment workflow simulation, admin dashboard, and full static compatibility for GitHub Pages deployment.

## Key Features

- **Immersive 3D Experience**: Three.js hero scene with interactive lighting and particle effects, plus 3D product view capabilities.
- **Modern UI/UX**: Glassmorphism design tokens, dark and light mode support, smooth GSAP animations, and fully responsive layouts.
- **E-Commerce Flow**: Advanced product catalog, search, filtering, categories, shopping cart drawer, discount coupon system, and multi-step secure checkout.
- **Supabase Backend & Demo Mode**: Fully integrated with Supabase Auth and PostgreSQL, featuring an instant Demo Mode with local sample data when Supabase credentials are not yet configured.
- **Admin Dashboard**: Comprehensive management interface for products, orders, inventory, customers, and analytics charts.
- **GitHub Pages Ready**: Configured for static hosting on GitHub Pages with automated GitHub Actions CI/CD workflows.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Modern JavaScript (ES Modules)
- **3D Graphics**: Three.js (`r128`), OrbitControls
- **Animations**: GSAP 3.12, ScrollTrigger
- **Backend & Database**: Supabase (PostgreSQL, Auth, RLS Policies)
- **Hosting**: GitHub Pages via GitHub Actions CI/CD

---

## Project Structure

```
novacart/
├── index.html
├── shop.html
├── product.html
├── cart.html
├── checkout.html
├── login.html
├── register.html
├── account.html
├── orders.html
├── wishlist.html
├── contact.html
├── about.html
├── faq.html
├── privacy.html
├── terms.html
├── shipping.html
├── refunds.html
├── 404.html
│
├── admin/
│   ├── index.html
│   └── dashboard.html
│
├── css/
│   ├── main.css
│   ├── responsive.css
│   └── animations.css
│
├── js/
│   ├── app.js
│   ├── config.js
│   ├── supabase.js
│   ├── auth.js
│   ├── cart.js
│   ├── wishlist.js
│   ├── search.js
│   ├── theme.js
│   ├── notifications.js
│   ├── utils.js
│   └── 3d/
│       └── hero3d.js
│
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   └── policies.sql
│
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── manifest.json
├── robots.txt
├── sitemap.xml
├── .nojekyll
└── README.md
```

---

## Getting Started & Setup

### 1. Clone or Download Repository
```bash
git init
git add .
git commit -m "Initial NovaCart build"
```

### 2. Configure Supabase (Optional for Demo Mode)
1. Create a new project on [Supabase](https://supabase.com).
2. Execute `supabase/schema.sql`, `supabase/policies.sql`, and `supabase/seed.sql` in your Supabase SQL Editor.
3. Update `js/config.js` with your `supabaseUrl` and `supabaseAnonKey`.
*(Note: If left unconfigured, NovaCart automatically runs in fully functional Demo Mode using local sample data).*

### 3. Deploy to GitHub Pages
1. Push your repository to GitHub.
2. In your GitHub repository settings, navigate to **Pages** and set the source to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy your static site.

---

## License
MIT License. Created with NovaCart Architecture.
