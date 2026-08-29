import { supabase } from './supabase.js';

const $ = (id) => document.getElementById(id);

let products = [];
let editingProduct = null;
let editingPost = null;
let editingNavigation = null;


// ===============================
// MESSAGE
// ===============================

function message(id, text, error = false) {
  const el = $(id);
  if (!el) return;

  el.textContent = text;
  el.style.color = error ? '#ff6b6b' : '';
}


// ===============================
// ADMIN CHECK
// ===============================

async function isAdmin() {

  try {

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(authError);
      return false;
    }

    if (!user) return false;


    const {
      data,
      error
    } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();


    if (error) {
      console.error('Admin check error:', error);
      return false;
    }

    return !!data;

  } catch (err) {

    console.error(err);
    return false;

  }
}


// ===============================
// SHOW PANEL
// ===============================

function showPanel() {

  $('login').hidden = true;
  $('panel').hidden = false;

  loadAll();

}


// ===============================
// BOOT
// ===============================

async function boot() {

  const admin = await isAdmin();

  if (admin) {

    showPanel();

  } else {

    $('login').hidden = false;
    $('panel').hidden = true;

  }

}


// ===============================
// LOGIN
// ===============================

async function login() {

  const email = $('email').value.trim();
  const password = $('password').value;


  if (!email || !password) {

    message(
      'loginMsg',
      'Please enter email and password.',
      true
    );

    return;
  }


  const button = $('loginBtn');

  button.disabled = true;
  button.textContent = 'Logging in...';

  message('loginMsg', '');


  try {

    const {
      data,
      error
    } = await supabase.auth.signInWithPassword({

      email: email,
      password: password

    });


    if (error) {

      console.error('Login error:', error);

      message(
        'loginMsg',
        error.message,
        true
      );

      return;
    }


    if (!data.user) {

      message(
        'loginMsg',
        'Login failed. Please try again.',
        true
      );

      return;
    }


    const admin = await isAdmin();


    if (!admin) {

      await supabase.auth.signOut();

      message(
        'loginMsg',
        'Login successful, but this account is not an admin.',
        true
      );

      return;
    }


    message(
      'loginMsg',
      'Login successful!'
    );


    showPanel();


  } catch (err) {

    console.error(err);

    message(
      'loginMsg',
      err.message || 'Something went wrong.',
      true
    );

  } finally {

    button.disabled = false;
    button.textContent = 'Login';

  }

}


// ===============================
// LOGOUT
// ===============================

async function logout() {

  await supabase.auth.signOut();

  $('panel').hidden = true;
  $('login').hidden = false;

}


// ===============================
// TABS
// ===============================

function setupTabs() {

  document
    .querySelectorAll('[data-tab]')
    .forEach(button => {

      button.addEventListener('click', () => {

        document
          .querySelectorAll('.tab')
          .forEach(tab => {
            tab.hidden = true;
          });


        const tab = $(
          'tab-' + button.dataset.tab
        );


        if (tab) {

          tab.hidden = false;

        }

      });

    });

}


// ===============================
// LOAD EVERYTHING
// ===============================

async function loadAll() {

  await Promise.allSettled([

    loadSite(),
    loadProducts(),
    loadPosts(),
    loadNavigation(),
    loadAds()

  ]);

}


// ===============================
// WEBSITE SETTINGS
// ===============================

async function loadSite() {

  try {

    const {
      data,
      error
    } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();


    if (error) {

      console.error('Site settings:', error);
      return;

    }


    if (!data) return;


    const fields = [

      ['siteName', 'site_name'],
      ['tagline', 'tagline'],
      ['logoUrl', 'logo_url'],
      ['primaryColor', 'primary_color'],
      ['accentColor', 'accent_color'],
      ['heroTitle', 'hero_title'],
      ['heroText', 'hero_text'],
      ['heroButton', 'hero_button'],
      ['footerText', 'footer_text'],
      ['seoTitle', 'seo_title'],
      ['seoDescription', 'seo_description']

    ];


    fields.forEach(([id, column]) => {

      const el = $(id);

      if (el) {

        el.value = data[column] ?? '';

      }

    });

  } catch (err) {

    console.error(err);

  }

}


// ===============================
// SAVE WEBSITE
// ===============================

$('siteForm').addEventListener(
  'submit',
  async (e) => {

    e.preventDefault();


    const row = {

      site_name: $('siteName').value,
      tagline: $('tagline').value,
      logo_url: $('logoUrl').value,
      primary_color: $('primaryColor').value,
      accent_color: $('accentColor').value,
      hero_title: $('heroTitle').value,
      hero_text: $('heroText').value,
      hero_button: $('heroButton').value,
      footer_text: $('footerText').value,
      seo_title: $('seoTitle').value,
      seo_description: $('seoDescription').value,

      updated_at:
        new Date().toISOString()

    };


    const {
      data: old,
      error: findError
    } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1)
      .maybeSingle();


    if (findError) {

      alert(findError.message);
      return;

    }


    let result;


    if (old) {

      result = await supabase
        .from('site_settings')
        .update(row)
        .eq('id', old.id);

    } else {

      result = await supabase
        .from('site_settings')
        .insert(row);

    }


    if (result.error) {

      alert(result.error.message);

    } else {

      alert('Website settings saved successfully.');

    }

  }
);


// ===============================
// PRODUCTS
// ===============================

async function loadProducts() {

  try {

    const {
      data,
      error
    } = await supabase
      .from('products')
      .select('*')
      .order('created_at', {
        ascending: false
      });


    if (error) {

      console.error(error);

      $('adminProducts').innerHTML =
        '<p>Unable to load products.</p>';

      return;

    }


    products = data || [];


    renderProducts();

    loadProductChecks();

  } catch (err) {

    console.error(err);

  }

}


function renderProducts() {

  const container =
    $('adminProducts');

  if (!container) return;


  if (!products.length) {

    container.innerHTML =
      '<p>No products yet.</p>';

    return;

  }


  container.innerHTML =
    products.map(product => `

      <div class="admin-card">

        <img
          src="${esc(product.image_url || '')}"
          alt=""
        >

        <div>

          <b>
            ${esc(product.name)}
          </b>

          <br>

          <small>
            ${esc(product.category || '')}
            · ₹${Number(product.price || 0)
              .toLocaleString('en-IN')}
          </small>

        </div>

        <div class="admin-actions">

          <button
            type="button"
            data-edit-product="${product.id}"
          >
            Edit
          </button>

          <button
            type="button"
            class="danger"
            data-delete-product="${product.id}"
          >
            Delete
          </button>

        </div>

      </div>

    `).join('');


  document
    .querySelectorAll('[data-edit-product]')
    .forEach(button => {

      button.onclick = () => {

        editProduct(
          Number(button.dataset.editProduct)
        );

      };

    });


  document
    .querySelectorAll('[data-delete-product]')
    .forEach(button => {

      button.onclick = () => {

        deleteProduct(
          Number(button.dataset.deleteProduct)
        );

      };

    });

}


// ===============================
// SAVE PRODUCT
// ===============================

$('productForm').addEventListener(
  'submit',
  async (e) => {

    e.preventDefault();


    const row = {

      name: $('pname').value.trim(),

      category:
        $('pcategory').value.trim(),

      price:
        Number($('pprice').value),

      image_url:
        $('pimage').value.trim(),

      buy_url:
        $('pb
