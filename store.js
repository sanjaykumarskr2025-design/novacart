import { supabase } from "./supabase.js";

const WA = "919999999999";

let products = [];
let posts = [];
let cart = JSON.parse(localStorage.novacart || "[]");

const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN");

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


/* =========================
   LOAD WEBSITE SETTINGS
========================= */

async function loadSiteSettings() {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Site settings error:", error);
    return;
  }

  if (!data) return;

  if ($("siteLogo") && data.site_name) {
    $("siteLogo").innerHTML =
      esc(data.site_name).replace(
        /(.+?)(cart)/i,
        "$1<span>$2</span>"
      );
  }

  if (data.logo_url && $("siteLogo")) {
    $("siteLogo").style.backgroundImage =
      `url("${data.logo_url}")`;
    $("siteLogo").style.backgroundSize = "contain";
    $("siteLogo").style.backgroundRepeat = "no-repeat";
    $("siteLogo").style.backgroundPosition = "left center";
  }

  if ($("heroTitle") && data.hero_title) {
    $("heroTitle").innerHTML = esc(data.hero_title);
  }

  if ($("heroText") && data.hero_text) {
    $("heroText").textContent = data.hero_text;
  }

  if ($("heroButton") && data.hero_button_text) {
    $("heroButton").textContent = data.hero_button_text;
  }

  if ($("footer") && data.footer_text) {
    $("footer").textContent = data.footer_text;
  }

  if (data.background_color) {
    document.body.style.backgroundColor =
      data.background_color;
  }

  if (data.text_color) {
    document.body.style.color =
      data.text_color;
  }

  if (data.primary_color) {
    document.documentElement.style.setProperty(
      "--primary-color",
      data.primary_color
    );
  }

  if (data.secondary_color) {
    document.documentElement.style.setProperty(
      "--secondary-color",
      data.secondary_color
    );
  }

  if (data.seo_title) {
    document.title = data.seo_title;
  }

  if (data.seo_description) {
