import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[c]));
}

const money = (value) =>
  "₹" + Number(value || 0).toLocaleString("en-IN");


/* =========================
   GET POST SLUG
========================= */

function getSlug() {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get("slug");
}


/* =========================
   PRODUCT CARD
========================= */

function productCard(product) {
  return `
    <article class="card">

      <img
        src="${esc(product.image_url || "")}"
        alt="${esc(product.name || "Product")}"
        loading="lazy"
      >

      <div class="info">

        <small>
          ${esc(product.category || "")}
        </small>

        <h3>
          ${esc(product.name || "Product")}
        </h3>

        ${
          product.description
            ? `
              <p>
                ${esc(product.description)}
              </p>
            `
            : ""
        }

        <div class="row">

          <span class="price">
            ${money(product.price)}
          </span>

          ${
            product.buy_url
              ? `
                <a
                  class="buy"
                  href="${esc(product.buy_url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy ↗
                </a>
              `
              : ""
          }

        </div>

      </div>

    </article>
  `;
}


/* =========================
   LOAD POST
========================= */

async function loadPost() {

  const slug = getSlug();

  if (!slug) {
    showError();
    return;
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Post loading error:", error);
    showError();
    return;
  }

  if (!post) {
    showError();
    return;
  }


  /* =========================
     POST INFORMATION
  ========================= */

  document.title =
    post.title || "NovaCart Post";

  const meta =
    document.querySelector(
      'meta[name="description"]'
    );

  if (meta && post.excerpt) {
    meta.setAttribute(
      "content",
      post.excerpt
    );
  }


  if ($("postTitle")) {
    $("postTitle").textContent =
      post.title || "";
  }

  if ($("postExcerpt")) {
    $("postExcerpt").textContent =
      post.excerpt || "";
  }

  if ($("postBody")) {

    /*
      Preserve line breaks from the
      admin textarea.
    */

    $("postBody").innerHTML =
      esc(post.content || "")
        .replace(/\n/g, "<br>");
  }


  /* =========================
     POST IMAGE
  ========================= */

  if (
    $("postImageWrap") &&
    post.image_url
  ) {

    $("postImageWrap").innerHTML = `
      <img
        src="${esc(post.image_url)}"
        alt="${esc(post.title || "Post")}"
        style="
          width:100%;
          max-height:600px;
          object-fit:cover;
          border-radius:20px;
          margin-bottom:30px;
        "
      >
    `;
  }


  /* =========================
     LOAD RELATED PRODUCTS
  ========================= */

  await
