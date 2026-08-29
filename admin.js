import { supabase } from "./supabase.js";
const $=id=>document.getElementById(id);
let products=[],editingProduct=null,editingPost=null,editingPage=null,editingNav=null;

async function isAdmin(){
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return false;
  const {data,error}=await supabase.from("admin_users").select("user_id").eq("user_id",user.id).maybeSingle();
  if(error){console.error(error);return false;}
  return !!data;
}
async function boot(){if(await isAdmin()){ $("login").hidden=true;$("panel").hidden=false;await loadAll(); }else{$("login").hidden=false;$("panel").hidden=true;}}
supabase.auth.onAuthStateChange(()=>setTimeout(boot,0));
$("loginBtn").onclick=async()=>{ $("loginMsg").textContent="Signing in…";const {error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){$("loginMsg").textContent=error.message;return;}await boot();};
$("logout").onclick=async()=>{await supabase.auth.signOut();location.reload();};
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.hidden=true);$("tab-"+b.dataset.tab).hidden=false;});

async function loadAll(){await Promise.all([loadSite(),loadProducts(),loadPosts(),loadPages(),loadNavigation(),loadAds()]);}
function esc(v=""){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
function attr(v=""){return esc(v);}
async function rows(table,order="created_at"){const {data,error}=await supabase.from(table).select("*").order(order,{ascending:false});if(error)throw error;return data||[];}

async function loadSite(){
  const {data,error}=await supabase.from("site_settings").select("*").limit(1).maybeSingle();if(error)throw error;if(!data)return;
  const map={siteName:"site_name",logoUrl:"logo_url",faviconUrl:"favicon_url",primaryColor:"primary_color",secondaryColor:"secondary_color",backgroundColor:"background_color",textColor:"text_color",heroTitle:"hero_title",heroText:"hero_subtitle",heroButtonText:"hero_button_text",heroButtonUrl:"hero_button_url",footerText:"footer_text",seoTitle:"seo_title",seoDescription:"seo_description"};
  Object.entries(map).forEach(([a,b])=>$(a).value=data[b]??"");
}
$("siteForm").onsubmit=async e=>{
 e.preventDefault();const row={site_name:$("siteName").value.trim(),logo_url:$("logoUrl").value.trim(),favicon_url:$("faviconUrl").value.trim(),primary_color:$("primaryColor").value.trim(),secondary_color:$("secondaryColor").value.trim(),background_color:$("backgroundColor").value.trim(),text_color:$("textColor").value.trim(),hero_title:$("heroTitle").value.trim(),hero_subtitle:$("heroText").value.trim(),hero_button_text:$("heroButtonText").value.trim(),hero_button_url:$("heroButtonUrl").value.trim(),footer_text:$("footerText").value.trim(),seo_title:$("seoTitle").value.trim(),seo_description:$("seoDescription").value.trim(),updated_at:new Date().toISOString()};
 const {data:old,error:re}=await supabase.from("site_settings").select("id").limit(1).maybeSingle();if(re)return alert(re.message);
 const {error}=old?await supabase.from("site_settings").update(row).eq("id",old.id):await supabase.from("site_settings").insert(row);if(error)alert(error.message);else alert("Website settings saved.");
};

async function loadProducts(){
 products=await rows("products");$("adminProducts").innerHTML=products.map(p=>`<div class="admin-card"><img src="${attr(p.image_url)}" alt=""><div><b>${esc(p.name)}</b><br><small>${esc(p.category)} · ₹${Number(p.price||0).toLocaleString("en-IN")} ${p.featured?"· Featured":""}</small></div><div class="admin-actions"><button data-edit-p="${p.id}">Edit</button><button class="danger" data-del-p="${p.id}">Delete</button></div></div>`).join("")||"<p>No products.</p>";
 document.querySelectorAll("[data-edit-p]").forEach(b=>b.onclick=()=>editProduct(+b.dataset.editP));document.querySelectorAll("[data-del-p]").forEach(b=>b.onclick=()=>deleteProduct(+b.dataset.delP));
}
$("productForm").onsubmit=async e=>{e.preventDefault();const row={name:$("pname").value.trim(),category:$("pcategory").value.trim(),price:Number($("pprice").value),image_url:$("pimage").value.trim(),buy_url:$("pbuy").value.trim(),description:$("pdesc").value.trim(),featured:$("pfeatured").checked};const q=editingProduct?supabase.from("products").update(row).eq("id",editingProduct):supabase.from("products").insert(row);const {error}=await q;if(error)return alert(error.message);resetProduct();await loadProducts();await loadProductChecks();};
function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;editingProduct=id;[["pname",p.name],["pcategory",p.category],["pprice",p.price],["pimage",p.image_url],["pbuy",p.buy_url],["pdesc",p.description||""]].forEach(([a,v])=>$(a).value=v);$("pfeatured").checked=!!p.featured;document.querySelector('[data-tab="products"]').click();scrollTo(0,0);}
async function deleteProduct(id){if(!confirm("Delete this product?"))return;const {error}=await supabase.from("products").delete().eq("id",id);if(error)alert(error.message);else await loadProducts();}
function resetProduct(){$("productForm").reset();editingProduct=null;}$("cancelProduct").onclick=resetProduct;

async function loadProductChecks(selected=[]){products=await rows("products");$("productChecks").innerHTML="<p><b>Related products</b></p>"+(products.map(p=>`<label class="check"><input type="checkbox" value="${p.id}" ${selected.includes(p.id)?"checked":""}> ${esc(p.name)}</label>`).join("")||"<p>No products.</p>");}
async function loadPosts(){
 const {data,error}=await supabase.from("posts").select("*").order("created_at",{ascending:false});if(error)throw error;
 $("adminPosts").innerHTML=(data||[]).map(p=>`<div class="admin-card"><div><b>${esc(p.title)}</b><br><small>${esc(p.slug)} · ${p.published?"Published":"Draft"}</small></div><div class="admin-actions"><button data-edit-post="${p.id}">Edit</button><button class="danger" data-del-post="${p.id}">Delete</button></div></div>`).join("")||"<p>No posts.</p>";
 document.querySelectorAll("[data-edit-post]").forEach(b=>b.onclick=()=>editPost(+b.dataset.editPost));document.querySelectorAll("[data-del-post]").forEach(b=>b.onclick=()=>deletePost(+b.dataset.delPost));await loadProductChecks();
}
async function editPost(id){const {data:p,error}=await supabase.from("posts").select("*").eq("id",id).single();if(error)return alert(error.message);const {data:links}=await supabase.from("post_products").select("product_id").eq("post_id",id);editingPost=id;[["postTitle",p.title],["postSlug",p.slug],["postImage",p.image_url||""],["postCategory",p.category||""],["postExcerpt",p.excerpt||""],["postContent",p.content||""]].forEach(([a,v])=>$(a).value=v);$("postPublished").checked=!!p.published;await loadProductChecks((links||[]).map(x=>x.product_id));document.querySelector('[data-tab="posts"]').click();scrollTo(0,0);}
$("postForm").onsubmit=async e=>{e.preventDefault();const slug=$("postSlug").value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const row={title:$("postTitle").value.trim(),slug,image_url:$("postImage").value.trim(),category:$("postCategory").value.trim(),excerpt:$("postExcerpt").value.trim(),content:$("postContent").value,published:$("postPublished").checked,updated_at:new Date().toISOString()};const result=editingPost?await supabase.from("posts").update(row).eq("id",editingPost).select().single():await supabase.from("posts").insert(row).select().single();if(result.error)return alert(result.error.message);const id=result.data.id;const {error:de}=await supabase.from("post_products").delete().eq("post_id",id);if(de)return alert(de.message);const links=[...document.querySelectorAll("#productChecks input:checked")].map(x=>({post_id:id,product_id:Number(x.value)}));if(links.length){const {error:ie}=await supabase.from("post_products").insert(links);if(ie)return alert(ie.message);}resetPost();await loadPosts();};
function resetPost(){$("postForm").reset();editingPost=null;$("postPublished").checked=true;}$("cancelPost").onclick=resetPost;
async function deletePost(id){if(!confirm("Delete this post?"))return;const {error}=await supabase.from("posts").delete().eq("id",id);if(error)alert(error.message);else await loadPosts();}

async function loadPages(){const {data,error}=await supabase.from("pages").select("*").order("updated_at",{ascending:false});if(error)throw error;$("adminPages").innerHTML=(data||[]).map(p=>`<div class="admin-card"><div><b>${esc(p.title)}</b><br><small>${esc(p.slug)} · ${p.published?"Published":"Draft"}</small></div><div class="admin-actions"><button data-edit-page="${p.id}">Edit</button><button class="danger" data-del-page="${p.id}">Delete</button></div></div>`).join("")||"<p>No pages.</p>";document.querySelectorAll("[data-edit-page]").forEach(b=>b.onclick=()=>editPage(+b.dataset.editPage));document.querySelectorAll("[data-del-page]").forEach(b=>b.onclick=()=>deletePage(+b.dataset.delPage));}
$("pageForm").onsubmit=async e=>{e.preventDefault();const row={title:$("pageTitle").value.trim(),slug:$("pageSlug").value.trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),content:$("pageContent").value,meta_title:$("pageMetaTitle").value.trim(),meta_description:$("pageMetaDescription").value.trim(),published:$("pagePublished").checked,updated_at:new Date().toISOString()};const q=editingPage?supabase.from("pages").update(row).eq("id",editingPage):supabase.from("pages").insert(row);const {error}=await q;if(error)return alert(error.message);resetPage();await loadPages();};
async function editPage(id){const {data:p,error}=await supabase.from("pages").select("*").eq("id",id).single();if(error)return alert(error.message);editingPage=id;[["pageTitle",p.title],["pageSlug",p.slug],["pageContent",p.content||""],["pageMetaTitle",p.meta_title||""],["pageMetaDescription",p.meta_description||""]].forEach(([a,v])=>$(a).value=v);$("pagePublished").checked=!!p.published;document.querySelector('[data-tab="pages"]').click();}
function resetPage(){$("pageForm").reset();editingPage=null;$("pagePublished").checked=true;}$("cancelPage").onclick=resetPage;
async function deletePage(id){if(!confirm("Delete this page?"))return;const {error}=await supabase.from("pages").delete().eq("id",id);if(error)alert(error.message);else await loadPages();}

async function loadNavigation(){const {data,error}=await supabase.from("navigation").select("*").order("sort_order",{ascending:true});if(error)throw error;$("adminNavigation").innerHTML=(data||[]).map(n=>`<div class="admin-card"><div><b>${esc(n.label)}</b><br><small>${esc(n.url)} · ${esc(n.location)} · ${n.visible?"Visible":"Hidden"} · order ${n.sort_order}</small></div><div class="admin-actions"><button data-edit-nav="${n.id}">Edit</button><button class="danger" data-del-nav="${n.id}">Delete</button></div></div>`).join("")||"<p>No navigation links.</p>";document.querySelectorAll("[data-edit-nav]").forEach(b=>b.onclick=()=>editNav(+b.dataset.editNav));document.querySelectorAll("[data-del-nav]").forEach(b=>b.onclick=()=>deleteNav(+b.dataset.delNav));}
$("navForm").onsubmit=async e=>{e.preventDefault();const row={label:$("navLabel").value.trim(),url:$("navUrl").value.trim(),location:$("navLocation").value,sort_order:Number($("navOrder").value||0),visible:$("navVisible").checked};const q=editingNav?supabase.from("navigation").update(row).eq("id",editingNav):supabase.from("navigation").insert(row);const {error}=await q;if(error)return alert(error.message);resetNav();await loadNavigation();};
async function editNav(id){const {data:n,error}=await supabase.from("navigation").select("*").eq("id",id).single();if(error)return alert(error.message);editingNav=id;[["navLabel",n.label],["navUrl",n.url],["navOrder",n.sort_order]].forEach(([a,v])=>$(a).value=v);$("navLocation").value=n.location||"header";$("navVisible").checked=!!n.visible;document.querySelector('[data-tab="navigation"]').click();}
function resetNav(){$("navForm").reset();editingNav=null;$("navVisible").checked=true;}$("cancelNav").onclick=resetNav;
async function deleteNav(id){if(!confirm("Delete this navigation link?"))return;const {error}=await supabase.from("navigation").delete().eq("id",id);if(error)alert(error.message);else await loadNavigation();}

async function loadAds(){const {data,error}=await supabase.from("adsense_settings").select("*").limit(1).maybeSingle();if(error)throw error;if(!data)return;$("adsEnabled").checked=!!data.enabled;$("publisherId").value=data.publisher_id||"";$("homeSlot").value=data.homepage_slot||"";$("postSlot").value=data.post_slot||"";$("productSlot").value=data.product_slot||"";$("showHomeAds").checked=!!data.show_homepage_ads;$("showPostAds").checked=!!data.show_post_ads;$("showProductAds").checked=!!data.show_product_ads;}
$("adsForm").onsubmit=async e=>{e.preventDefault();const row={enabled:$("adsEnabled").checked,publisher_id:$("publisherId").value.trim(),homepage_slot:$("homeSlot").value.trim(),post_slot:$("postSlot").value.trim(),product_slot:$("productSlot").value.trim(),show_homepage_ads:$("showHomeAds").checked,show_post_ads:$("showPostAds").checked,show_product_ads:$("showProductAds").checked,updated_at:new Date().toISOString()};const {data:old,error:re}=await supabase.from("adsense_settings").select("id").limit(1).maybeSingle();if(re)return alert(re.message);const {error}=old?await supabase.from("adsense_settings").update(row).eq("id",old.id):await supabase.from("adsense_settings").insert(row);if(error)alert(error.message);else alert("AdSense settings saved.");};

boot();
