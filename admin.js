import { supabase } from "./supabase.js";

/*
  NovaCart Admin 2.0
  - Safe DOM initialization
  - Supabase login/logout
  - Admin verification
  - Website settings
  - Products CRUD
  - Posts CRUD
  - Post + Product relationship
  - Navigation CRUD
  - AdSense settings
*/

const $ = (id) => document.getElementById(id);

let products = [];
let posts = [];
let navigationItems = [];

let editingProductId = null;
let editingPostId = null;
let editingNavigationId = null;

/* =========================================================
   HELPERS
========================================================= */

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function val(id, fallback = "") {
  const el = $(id);
  return el ? el.value : fallback;
}

function checked(id) {
  const el = $(id);
  return el ? el.checked : false;
}

function setValue(id, value = "") {
  const el = $(id);
  if (el) el.value = value ?? "";
}

function setChecked(id, value) {
  const el = $(id);
  if (el) el.checked = !!value;
}

function msg(id, text, error = false) {
  const el = $(id);
  if (!el) return;

  el.textContent = text || "";
  el.style.color = error ? "#ff6b6b" : "";
}

function showError(error, target = "loginMsg") {
  console.error(error);

  const text =
    error?.message ||
    error?.error_description ||
    "Something went wrong.";

  msg(target, text, true);
}

function clearElement(id) {
  const el = $(id);
  if (el) el.innerHTML = "";
}

/* =========================================================
   ADMIN AUTH
========================================================= */

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("getUser:", error);
    return null;
  }

  return data?.user || null;
}

async function isAdmin() {
  try {
    const user = await getCurrentUser();

    if (!user) return false;

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin check:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("isAdmin:", error);
    return false;
  }
}

function showLogin() {
  const login = $("login");
  const panel = $("panel");

  if (login) login.hidden = false;
  if (panel) panel.hidden = true;
}

function showPanel() {
  const login = $("login");
  const panel = $("panel");

  if (login) login.hidden = true;
  if (panel) panel.hidden = false;

  loadAll();
}

/* =========================================================
   LOGIN
========================================================= */

async function login() {
  const emailEl = $("email");
  const passwordEl = $("password");
  const button = $("loginBtn");

  if (!emailEl || !passwordEl) {
    console.error("Login fields are missing from admin.html");
    return;
  }

  const email = emailEl.value.trim();
  const password = passwordEl.value;

  if (!email || !password) {
    msg(
      "loginMsg",
      "Please enter your email and password.",
      true
    );
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "Logging in...";
  }

  msg("loginMsg", "");

  try {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      showError(error);
      return;
    }

    if (!data?.user) {
      msg("loginMsg", "Login failed.", true);
      return;
    }

    const admin = await isAdmin();

    if (!admin) {
      await supabase.auth.signOut();

      msg(
        "loginMsg",
        "Login successful, but this account is not an admin.",
        true
      );

      return;
    }

    msg("loginMsg", "Login successful.");

    showPanel();

  } catch (error) {
    showError(error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Login";
    }
  }
}

/* =========================================================
   LOGOUT
========================================================= */

async function logout() {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error(error);
  }

  showLogin();
}

/* =========================================================
   TABS
========================================================= */

function setupTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.tab;

      document.querySelectorAll(".tab").forEach((tab) => {
        tab.hidden = true;
      });

      const selected = $("tab-" + name);

      if (selected) {
        selected.hidden = false;
      }
    });
  });
}

/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadAll() {
  await Promise.allSettled([
    loadSite(),
    loadProducts(),
    loadPosts(),
    loadNavigation(),
    loadAds()
  ]);
}

/* =========================================================
   WEBSITE SETTINGS
========================================================= */

async function loadSite() {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("loadSite:", error);
      msg("siteMsg", error.message, true);
      return;
    }

    if (!data) return;

    const fields = {
      siteName: "site_name",
      tagline: "tagline",
      logoUrl: "logo_url",
      primaryColor: "primary_color",
      accentColor: "accent_color",
      heroTitle: "hero_title",
      heroText: "hero_text",
      heroButton: "hero_button",
      footerText: "footer_text",
      seoTitle: "seo_title",
      seoDescription: "seo_description"
    };

    Object.entries(fields).forEach(([id, column]) => {
      setValue(id, data[column] ?? "");
    });

  } catch (error) {
    showError(error, "siteMsg");
  }
}

async function saveSite(event) {
  event.preventDefault();

  const row = {
    site_name: val("siteName"),
    tagline: val("tagline"),
    logo_url: val("logoUrl"),
    primary_color: val("primaryColor"),
    accent_color: val("accentColor"),
    hero_title: val("heroTitle"),
    hero_text: val("heroText"),
    hero_button: val("heroButton"),
    footer_text: val("footerText"),
    seo_title: val("seoTitle"),
    seo_description: val("seoDescription"),
    updated_at: new Date().toISOString()
  };

  try {
    const { data: existing, error: findError } =
      await supabase
        .from("site_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (findError) {
      showError(findError, "siteMsg");
      return;
    }

    let result;

    if (existing?.id) {
      result = await supabase
        .from("site_settings")
        .update(row)
        .eq("id", existing.id);
    } else {
      result = await supabase
        .from("site_settings")
        .insert(row);
    }

    if (result.error) {
      showError(result.error, "siteMsg");
      return;
    }

    msg("siteMsg", "Website settings saved successfully.");

  } catch (error) {
    showError(error, "siteMsg");
  }
}

/* =========================================================
   PRODUCTS
========================================================= */

async function loadProducts() {
  const container = $("adminProducts");

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadProducts:", error);

      if (container) {
        container.innerHTML =
          `<p>${esc(error.message)}</p>`;
      }

      return;
    }

    products = data || [];

    renderProducts();
    renderProductChecks();

  } catch (error) {
    console.error(error);

    if (container) {
      container.innerHTML =
        "<p>Unable to load products.</p>";
    }
  }
}

function renderProducts() {
  const container = $("adminProducts");

  if (!container) return;

  if (!products.length) {
    container.innerHTML = "<p>No products yet.</p>";
    return;
  }

  container.innerHTML = products.map((product) => `
    <div class="admin-card">

      <img
        src="${esc(product.image_url || "")}"
        alt="${esc(product.name || "Product")}"
        loading="lazy"
      >

      <div>
        <b>${esc(product.name)}</b>

        <br>

        <small>
          ${esc(product.category || "")}
          · ₹${Number(product.price || 0).toLocaleString("en-IN")}
        </small>
      </div>

      <div class="admin-actions">

        <button
          type="button"
          data-edit-product="${esc(product.id)}"
        >
          Edit
        </button>

        <button
          type="button"
          class="danger"
          data-delete-product="${esc(product.id)}"
        >
          Delete
        </button>

      </div>

    </div>
  `).join("");

  container
    .querySelectorAll("[data-edit-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editProduct(button.dataset.editProduct);
      });
    });

  container
    .querySelectorAll("[data-delete-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deleteProduct(button.dataset.deleteProduct);
      });
    });
}

function clearProductForm() {
  editingProductId = null;

  setValue("pid", "");
  setValue("pname", "");
  setValue("pcategory", "");
  setValue("pprice", "");
  setValue("pimage", "");
  setValue("pbuy", "");
  setValue("pdesc", "");
  setChecked("pfeatured", false);

  msg("productMsg", "");
}

async function saveProduct(event) {
  event.preventDefault();

  const name = val("pname").trim();
  const category = val("pcategory").trim();
  const price = Number(val("pprice") || 0);
  const image = val("pimage").trim();
  const buy = val("pbuy").trim();
  const description = val("pdesc").trim();

  if (!name || !category || !image || !buy) {
    msg(
      "productMsg",
      "Please fill all required product fields.",
      true
    );
    return;
  }

  const row = {
    name,
    category,
    price,
    image_url: image,
    buy_url: buy,
    description
  };

  try {
    let result;

    if (editingProductId) {
      result = await supabase
        .from("products")
        .update(row)
        .eq("id", editingProductId);
    } else {
      result = await supabase
        .from("products")
        .insert(row);
    }

    if (result.error) {
      showError(result.error, "productMsg");
      return;
    }

    msg(
      "productMsg",
      editingProductId
        ? "Product updated successfully."
        : "Product added successfully."
    );

    clearProductForm();

    await loadProducts();

  } catch (error) {
    showError(error, "productMsg");
  }
}

function editProduct(id) {
  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) return;

  editingProductId = product.id;

  setValue("pid", product.id);
  setValue("pname", product.name);
  setValue("pcategory", product.category);
  setValue("pprice", product.price);
  setValue("pimage", product.image_url);
  setValue("pbuy", product.buy_url);
  setValue("pdesc", product.description);

  const productsTab = $("tab-products");

  if (productsTab) {
    productsTab.hidden = false;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      showError(error, "productMsg");
      return;
    }

    msg("productMsg", "Product deleted.");

    await loadProducts();

  } catch (error) {
    showError(error, "productMsg");
  }
}

/* =========================================================
   POST PRODUCT CHECKBOXES
========================================================= */

function renderProductChecks(selectedIds = []) {
  const container = $("productChecks");

  if (!container) return;

  if (!products.length) {
    container.innerHTML = "<p>No products available.</p>";
    return;
  }

  const selected = new Set(
    selectedIds.map((id) => String(id))
  );

  container.innerHTML = products.map((product) => `
    <label style="display:block;margin:8px 0;">
      <input
        type="checkbox"
        class="post-product-check"
        value="${esc(product.id)}"
        ${selected.has(String(product.id)) ? "checked" : ""}
      >
      ${esc(product.name)}
    </label>
  `).join("");
}

function getSelectedProductIds() {
  return Array.from(
    document.querySelectorAll(".post-product-check:checked")
  ).map((input) => input.value);
}

/* =========================================================
   POSTS
========================================================= */

async function loadPosts() {
  const container = $("adminPosts");

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadPosts:", error);

      if (container) {
        container.innerHTML =
          `<p>${esc(error.message)}</p>`;
      }

      return;
    }

    posts = data || [];

    await renderPosts();

  } catch (error) {
    console.error(error);

    if (container) {
      container.innerHTML =
        "<p>Unable to load posts.</p>";
    }
  }
}

async function getPostProductIds(postId) {
  try {
    const { data, error } = await supabase
      .from("post_products")
      .select("product_id")
      .eq("post_id", postId);

    if (error) {
      console.error("post_products:", error);
      return [];
    }

    return (data || []).map(
      (row) => row.product_id
    );

  } catch (error) {
    console.error(error);
    return [];
  }
}

async function renderPosts() {
  const container = $("adminPosts");

  if (!container) return;

  if (!posts.length) {
    container.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  const cards = [];

  for (const post of posts) {
    const productIds =
      await getPostProductIds(post.id);

    const productNames = productIds
      .map((id) => {
        const product = products.find(
          (p) => String(p.id) === String(id)
        );

        return product?.name;
      })
      .filter(Boolean);

    cards.push(`
      <div class="admin-card">

        ${
          post.image_url
            ? `
              <img
                src="${esc(post.image_url)}"
                alt="${esc(post.title)}"
                loading="lazy"
              >
            `
            : ""
        }

        <div>

          <b>${esc(post.title)}</b>

          <br>

          <small>
            /${esc(post.slug || "")}
          </small>

          <p>
            ${esc(post.excerpt || "")}
          </p>

          <small>
            Products:
            ${
              productNames.length
                ? esc(productNames.join(", "))
                : "None"
            }
          </small>

          <br>

          <small>
            ${post.published ? "Published" : "Draft"}
          </small>

        </div>

        <div class="admin-actions">

          <button
            type="button"
            data-edit-post="${esc(post.id)}"
          >
            Edit
          </button>

          <button
            type="button"
            class="danger"
            data-delete-post="${esc(post.id)}"
          >
            Delete
          </button>

        </div>

      </div>
    `);
  }

  container.innerHTML = cards.join("");

  container
    .querySelectorAll("[data-edit-post]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editPost(button.dataset.editPost);
      });
    });

  container
    .querySelectorAll("[data-delete-post]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deletePost(button.dataset.deletePost);
      });
    });
}

async function savePost(event) {
  event.preventDefault();

  const title = val("postTitle").trim();
  const slug = val("postSlug").trim();
  const imageUrl = val("postImage").trim();
  const excerpt = val("postExcerpt").trim();
  const content = val("postContent").trim();
  const published = checked("postPublished");

  if (!title || !slug) {
    msg(
      "postMsg",
      "Post title and slug are required.",
      true
    );
    return;
  }

  const row = {
    title,
    slug,
    image_url: imageUrl,
    excerpt,
    content,
    published
  };

  try {
    let result;

    if (editingPostId) {
      result = await supabase
        .from("posts")
        .update(row)
        .eq("id", editingPostId);
    } else {
      result = await supabase
        .from("posts")
        .insert(row)
        .select("id")
        .single();
    }

    if (result.error) {
      showError(result.error, "postMsg");
      return;
    }

    const postId =
      editingPostId || result.data?.id;

    if (!postId) {
      msg(
        "postMsg",
        "Post saved, but post ID was not returned.",
        true
      );
      return;
    }

    /*
      Replace the old product relationships.
    */

    const { error: deleteRelationError } =
      await supabase
        .from("post_products")
        .delete()
        .eq("post_id", postId);

    if (deleteRelationError) {
      showError(
        deleteRelationError,
        "postMsg"
      );
      return;
    }

    const selectedIds =
      getSelectedProductIds();

    if (selectedIds.length) {
      const relationRows =
        selectedIds.map((productId) => ({
          post_id: postId,
          product_id: productId
        }));

      const { error: relationError } =
        await supabase
          .from("post_products")
          .insert(relationRows);

      if (relationError) {
        showError(
          relationError,
          "postMsg"
        );
        return;
      }
    }

    msg(
      "postMsg",
      editingPostId
        ? "Post and products updated successfully."
        : "Post and products saved successfully."
    );

    clearPostForm();

    await loadPosts();

  } catch (error) {
    showError(error, "postMsg");
  }
}

async function editPost(id) {
  const post = posts.find(
    (item) => String(item.id) === String(id)
  );

  if (!post) return;

  editingPostId = post.id;

  setValue("postId", post.id);
  setValue("postTitle", post.title);
  setValue("postSlug", post.slug);
  setValue("postImage", post.image_url);
  setValue("postExcerpt", post.excerpt);
  setValue("postContent", post.content);

  setChecked(
    "postPublished",
    post.published
  );

  const productIds =
    await getPostProductIds(post.id);

  renderProductChecks(productIds);

  const tab = $("tab-posts");

  if (tab) tab.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function clearPostForm() {
  editingPostId = null;

  setValue("postId", "");
  setValue("postTitle", "");
  setValue("postSlug", "");
  setValue("postImage", "");
  setValue("postExcerpt", "");
  setValue("postContent", "");

  setChecked("postPublished", true);

  renderProductChecks([]);

  msg("postMsg", "");
}

async function deletePost(id) {
  if (!confirm("Delete this post?")) return;

  try {
    /*
      Delete relationships first.
    */

    const { error: relationError } =
      await supabase
        .from("post_products")
        .delete()
        .eq("post_id", id);

    if (relationError) {
      showError(
        relationError,
        "postMsg"
      );
      return;
    }

    const { error } =
      await supabase
        .from("posts")
        .delete()
        .eq("id", id);

    if (error) {
      showError(error, "postMsg");
      return;
    }

    msg("postMsg", "Post deleted.");

    await loadPosts();

  } catch (error) {
    showError(error, "postMsg");
  }
}

/* =========================================================
   NAVIGATION
========================================================= */

async function loadNavigation() {
  const container = $("adminNavigation");

  try {
    const { data, error } = await supabase
      .from("navigation_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("loadNavigation:", error);

      if (container) {
        container.innerHTML =
          `<p>${esc(error.message)}</p>`;
      }

      return;
    }

    navigationItems = data || [];

    renderNavigation();

  } catch (error) {
    console.error(error);
  }
}

function renderNavigation() {
  const container = $("adminNavigation");

  if (!container) return;

  if (!navigationItems.length) {
    container.innerHTML =
      "<p>No navigation items yet.</p>";
    return;
  }

  container.innerHTML =
    navigationItems.map((item) => `
      <div class="admin-card">

        <div>
          <b>${esc(item.label)}</b>

          <br>

          <small>
            ${esc(item.url || "")}
            · Order ${esc(item.sort_order ?? 0)}
            · ${item.visible ? "Visible" : "Hidden"}
          </small>
        </div>

        <div class="admin-actions">

          <button
            type="button"
            data-edit-navigation="${esc(item.id)}"
          >
            Edit
          </button>

          <button
            type="button"
            class="danger"
            data-delete-navigation="${esc(item.id)}"
          >
            Delete
          </button>

        </div>

      </div>
    `).join("");

  container
    .querySelectorAll("[data-edit-navigation]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editNavigation(
          button.dataset.editNavigation
        );
      });
    });

  container
    .querySelectorAll("[data-delete-navigation]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deleteNavigation(
          button.dataset.deleteNavigation
        );
      });
    });
}

async function saveNavigation(event) {
  event.preventDefault();

  const label = val("navLabel").trim();
  const url = val("navUrl").trim();
  const sortOrder =
    Number(val("navOrder") || 0);
  const visible = checked("navVisible");

  if (!label || !url) {
    msg(
      "navigationMsg",
      "Menu name and URL are required.",
      true
    );
    return;
  }

  const row = {
    label,
    url,
    sort_order: sortOrder,
    visible
  };

  try {
    let result;

    if (editingNavigationId) {
      result = await supabase
        .from("navigation_items")
        .update(row)
        .eq("id", editingNavigationId);
    } else {
      result = await supabase
        .from("navigation_items")
        .insert(row);
    }

    if (result.error) {
      showError(
        result.error,
        "navigationMsg"
      );
      return;
    }

    msg(
      "navigationMsg",
      editingNavigationId
        ? "Navigation updated."
        : "Navigation saved."
    );

    clearNavigationForm();

    await loadNavigation();

  } catch (error) {
    showError(error, "navigationMsg");
  }
}

function editNavigation(id) {
  const item = navigationItems.find(
    (row) => String(row.id) === String(id)
  );

  if (!item) return;

  editingNavigationId = item.id;

  setValue("navId", item.id);
  setValue("navLabel", item.label);
  setValue("navUrl", item.url);
  setValue("navOrder", item.sort_order ?? 0);

  setChecked(
    "navVisible",
    item.visible
  );

  const tab = $("tab-navigation");

  if (tab) tab.hidden = false;
}

function clearNavigationForm() {
  editingNavigationId = null;

  setValue("navId", "");
  setValue("navLabel", "");
  setValue("navUrl", "");
  setValue("navOrder", 0);

  setChecked("navVisible", true);

  msg("navigationMsg", "");
}

async function deleteNavigation(id) {
  if (!confirm("Delete this navigation item?")) {
    return;
  }

  try {
    const { error } =
      await supabase
        .from("navigation_items")
        .delete()
        .eq("id", id);

    if (error) {
      showError(
        error,
        "navigationMsg"
      );
      return;
    }

    msg(
      "navigationMsg",
      "Navigation item deleted."
    );

    await loadNavigation();

  } catch (error) {
    showError(
      error,
      "navigationMsg"
    );
  }
}

/* =========================================================
   ADSENSE
========================================================= */

async function loadAds() {
  try {
    const { data, error } =
     
