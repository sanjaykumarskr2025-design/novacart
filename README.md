# NovaCart — Public Store + Separate Admin Panel

This version uses Supabase for the product database and authentication.

FILES:
index.html = public store
admin.html = separate admin panel
store.js = public store logic
admin.js = admin CRUD logic
supabase.js = Supabase connection
style.css = design
schema.sql = database + security policies

SETUP:
1. Create a free Supabase project.
2. Open SQL Editor and run schema.sql.
3. In Supabase Authentication → Users, create your admin user/email and password.
4. Open Project Settings → API and copy Project URL + anon/publishable key.
5. Put them into supabase.js.
6. Replace WHATSAPP_NUMBER in store.js.
7. Replace sample buy_url/image_url values from the Admin panel.
8. Upload all files to a GitHub repository.
9. Enable GitHub Pages.

PUBLIC:
https://YOUR-USERNAME.github.io/YOUR-REPO/

ADMIN:
https://YOUR-USERNAME.github.io/YOUR-REPO/admin.html

SECURITY:
The admin panel uses Supabase Authentication. Do NOT put a Supabase service-role/secret key in frontend files. Only use the public anon/publishable key. Row Level Security policies in schema.sql protect product writes to authenticated users.

For stronger production security, restrict admin writes to a dedicated admin role/table rather than every authenticated user.
