import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);

let products = [];
let editingProduct = null;
let editingPost = null;
let editingNavigation = null;


/* =====================================================
   HELPERS
===================================================== */

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[c]));
}

function showMessage(id, message, error = false) {
  const el = $(id);

  if (!el) return;

  el.textContent = message;
  el.style.display = "block";
  el.style.color = error ? "crimson" : "green";
}

function clearMessage(id) {
  const el = $(id);

  if (el) {
    el.textContent = "";
  }
}


/* =====================================================
   ADMIN AUTH
===================================================== */

async function isAdmin() {

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  const {
    data,
    error: adminError
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    console.error(
      "Admin check error:",
      adminError
    );

    return false;
  }

  return !!data;
}


async function boot() {

  const admin = await isAdmin();

  if (admin) {

    if ($("login")) {
      $("login").hidden = true;
    }

    if ($("panel")) {
      $("panel").hidden = false;
    }

    await loadAll();

  } else {

    if ($("login")) {
      $("login").hidden = false;
    }

    if ($("panel")) {
      $("panel").hidden = true;
    }
  }
}


/* =====================================================
   LOGIN
===================================================== */

if ($("loginBtn")) {

  $("loginBtn").onclick = async () => {

    clearMessage("loginMsg");

    const email =
      $("email").value.trim();

    const password =
      $("password").value;

    if (!email || !password) {

      showMessage(
        "loginMsg",
        "Enter email and password.",
        true
      );

      return;
    }


    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });


    if (error) {

      showMessage(
        "loginMsg",
        error.message,
        true
      );

      return;
    }


    showMessage(
      "loginMsg",
      "Login successful."
    );

    await boot();
  };
}


/* =====================================================
   LOGOUT
===================================================== */

if ($("logout")) {

  $("logout").onclick = async () => {

    await supabase.auth.signOut();

    location.reload();
  };
}


supabase.auth.onAuthStateChange(() => {
  setTimeout(boot, 0);
});


/* =====================================================
   TABS
===================================================== */

document
  .querySelectorAll("[data-tab]")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".tab")
        .forEach(tab => {
          tab.hidden = true;
        });


      const target =
        $("tab-" + button.dataset.tab);

      if (target) {
        target.hidden = false;
      }
    };
  });


/* =====================================================
   LOAD ALL
===================================================== */

async function loadAll() {

  await Promise.all([
    loadSite(),
    loadProducts(),
    loadPosts(),
    loadNavigation(),
    loadAds()
  ]);
}


/* =====================================================
   WEBSITE SETTINGS
===================================================== */

async function loadSite() {

  const {
    data,
    error
  } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();


  if (error) {

    console.error(
      "Site settings load error:",
      error
    );

    showMessage(
      "siteMsg",
      error.message,
      true
    );

    return;
  }


  if (!data) return;


  const fields = [
    ["siteName", "site_name"],
    ["tagline", "tagline"],
    ["logoUrl", "logo_url"],
    ["primaryColor", "primary_color"],
    ["accentColor", "accent_color"],
    ["heroTitle", "hero_title"],
    ["heroText", "hero_text"],
    ["heroButton", "hero_button"],
    ["footerText", "footer_text"],
    ["seoTitle", "seo_title"],
    ["seoDescription", "seo_description"]
  ];


  fields.forEach(([element, column]) => {

    if ($(element)) {
      $(element).value =
        data[column] ?? "";
    }

  });
}


/* =====================================================
   SAVE WEBSITE
===================================================== */

if ($("siteForm")) {

  $("siteForm").onsubmit = async (event) => {

    event.preventDefault();

    clearMessage("siteMsg");


    const row = {

      site_name:
        $("siteName").value.trim(),

      tagline:
        $("tagline").value.trim(),

      logo_url:
        $("logoUrl").value.trim(),

      primary_color:
        $("primaryColor").value.trim(),

      accent_color:
        $("accentColor").value.trim(),

      hero_title:
        $("heroTitle").value.trim(),

      hero_text:
        $("heroText").value.trim(),

      hero_button:
        $("heroButton").value.trim(),

      footer_text:
        $("footerText").value.trim(),

      seo_title:
        $("seoTitle").value.trim(),

      seo_description:
        $("seoDescription").value.trim(),

      updated_at:
        new Date().toISOString()
    };


    try {

      const {
        data: old,
        error: findError
      } = await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();


      if (findError) {
        throw findError;
      }


      let result;


      if (old?.id) {

        result =
          await supabase
            .from("site_settings")
            .update(row)
            .eq("id", old.id);

      } else {

        result =
          await supabase
            .from("site_settings")
            .insert(row);

      }


      if (result.error) {
        throw result.error;
      }


      showMessage(
        "siteMsg",
        "✅ Website settings saved successfully."
      );

    } catch (error) {

      console.error(
        "Website save error:",
        error
      );

      showMessage(
        "siteMsg",
        "❌ Save failed: " + error.message,
        true
      );
    }
  };
}


/* =====================================================
   PRODUCTS
===================================================== */

async function loadProducts() {

  const {
    data,
    error
  } = await supabase
    .from("products")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    console.error(
      "Products load error:",
      error
    );

    showMessage(
      "productMsg",
      error.message,
      true
    );

    return;
  }


  products = data || [];


  const container =
    $("adminProducts");

  if (!container) return;


  if (!products.length) {

    container.innerHTML =
      "<p>No products.</p>";

    return;
  }


  container.innerHTML =
    products.map(product => `

      <div class="admin-card">

        <img
          src="${esc(product.image_url || "")}"
          alt="${esc(product.name || "Product")}"
        >

        <div>

          <b>
            ${esc(product.name)}
          </b>

          <br>

          <small>
            ${esc(product.category || "")}
            · ₹${Number(product.price || 0).toLocaleString("en-IN")}
          </small>

        </div>

        <div class="admin-actions">

          <button
            data-edit-p="${product.id}"
          >
            Edit
          </button>

          <button
            class="danger"
            data-del-p="${product.id}"
          >
            Delete
          </button>

        </div>

      </div>

    `).join("");


  document
    .querySelectorAll("[data-edit-p]")
    .forEach(button => {

      button.onclick = () =>
        editProduct(
          Number(button.dataset.editP)
        );

    });


  document
    .querySelectorAll("[data-del-p]")
    .forEach(button => {

      button.onclick = () =>
        deleteProduct(
          Number(button.dataset.delP)
        );

    });
}


/* =====================================================
   PRODUCT FORM
===================================================== */

if ($("productForm")) {

  $("productForm").onsubmit =
    async (event) => {

      event.preventDefault();

      clearMessage("productMsg");


      const row = {

        name:
          $("pname").value.trim(),

        category:
          $("pcategory").value.trim(),

        price:
          Number($("pprice").value || 0),

        image_url:
          $("pimage").value.trim(),

        buy_url:
          $("pbuy").value.trim(),

        description:
          $("pdesc").value.trim(),

        featured:
          $("pfeatured").checked,

        updated_at:
          new Date().toISOString()
      };


      try {

        let result;


        if (editingProduct) {

          result =
            await supabase
              .from("products")
              .update(row)
              .eq("id", editingProduct);

        } else {

          result =
            await supabase
              .from("products")
              .insert(row);
        }


        if (result.error)
