/* Juntu African Market — demo storefront (Dalal Technologies).
   Demo-only commerce state lives in the browser (localStorage). In production every commerce
   function (cart, checkout, payment, taxes, shipping rates, orders) is handled by Shopify. */
{
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const CATS = window.JUNTU_CATS, ALL = window.JUNTU_PRODUCTS;
const CFG = window.JUNTU_CONFIG || { demo: true, store: {}, shipping: { enabled: true } };
const DEMO = !!CFG.demo;
const C = CFG.store;
const STORE = {
  addr: C.street, city: `${C.city}, ${C.regionCode} ${C.zip}`.trim(), cityLong: `${C.city}, ${C.region}`,
  tel1: C.phone, tel1d: C.phoneDisplay, tel2: C.phone2, tel2d: C.phone2Display,
  wa: C.whatsappConfirmed ? C.whatsapp : "", hours: C.hours || "",
  map: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(`${C.street}, ${C.city}, ${C.regionCode} ${C.zip}`)
};
const SHIP_ON = CFG.shipping?.enabled !== false;
const PHOTOS = [
  { src: "assets/store/juntu-exterior-1122.webp", sm: "assets/store/juntu-exterior-480.webp", md: "assets/store/juntu-exterior-800.webp", cap: "Our Memphis Storefront",
    alt: "Juntu African Market storefront at 3826 E Shelby Drive, Memphis: the Juntu African Market sign with the Juntu Market LLC logo and phone number 901-691-2274 above the entrance, building number 3826, and window posters for halal meat, fresh vegetables and African and Caribbean groceries, set in a red brick wall" },
  { src: "assets/store/juntu-interior-1122.webp", sm: "assets/store/juntu-interior-480.webp", md: "assets/store/juntu-interior-800.webp", cap: "Explore Our Market Inside",
    alt: "Inside Juntu African Market: a long aisle with fully stocked shelves of rice sacks, grains, flours, beans, spreads, cooking oils and packaged African and Caribbean groceries on both sides of a checkered floor" }
];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "$" + (Math.round(n * 100) / 100).toFixed(2);

/* ---------- icons ---------- */
const I = {
  truck: '<path d="M2 6h11v10H2zM13 9h4.5l3.5 3.5V16h-8z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  store: '<path d="M3 9.5 4.5 4h15L21 9.5M3 9.5h18M3 9.5c0 1.4 1.1 2.5 2.5 2.5S8 10.9 8 9.5c0 1.4 1.1 2.5 2.5 2.5S13 10.9 13 9.5c0 1.4 1.1 2.5 2.5 2.5S18 10.9 18 9.5M5 12v8h14v-8M10 20v-5h4v5"/>',
  leaf: '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19 13 11"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  phone: '<path d="M5 3.5h3.5l1.7 4.3-2.3 1.4a11 11 0 0 0 5 5l1.4-2.3 4.3 1.7V17a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
  chat: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8.4 19.4z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  bag: '<path d="M5 8h14l-1 12H6zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
  zoom: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4M11 8.5v5M8.5 11h5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>'
};
const ic = (n, s = 22, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

/* ---------- state ---------- */
const KEY = "juntu-demo-v1";
const S = { cart: [], mode: "pickup", zip: "", rate: "ground", recent: [], orders: [], nl: false };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
let Q = "";            // current search query
let F = { brands: [], min: "", max: "", sort: "featured" };
let co = { step: 1, d: {} };

/* ---------- catalog visibility ---------- */
const imgS = p => p.src === "juntu" ? `assets/products/${p.img}-480.webp` : `assets/products/list/${p.file}`;
const imgL = p => p.src === "juntu" ? `assets/products/${p.img}-900.webp` : `assets/products/list/${p.file}`;
const okList = new Set();
let P = [];
const rebuild = () => { P = ALL.slice(); };
rebuild();
const byId = id => P.find(p => p.id === id);
const catName = id => (CATS.find(c => c.id === id) || {}).name || "";
const inCat = (c) => P.filter(p => p.cats.includes(c));
const liveCats = () => CATS.filter(c => inCat(c.id).length);

const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const STOP = new Set(["de", "the", "and", "of", "ou", "a", "for", "du", "la", "le"]);
ALL.forEach(p => {
  const txt = [p.name, p.brand, p.size, ...(p.tags || []), ...p.cats.map(catName)].join(" ");
  p._text = norm(txt);
  p._tok = [...new Set(p._text.split(" ").filter(Boolean))];
});
function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const m = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = m[0]; m[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = m[j];
      m[j] = Math.min(m[j] + 1, m[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = t;
    }
  }
  return m[b.length];
}
function search(q) {
  const nq = norm(q);
  const qt = nq.split(" ").filter(t => t && !STOP.has(t));
  if (!qt.length) return [];
  return P.map(p => {
    let score = p._text.includes(nq) ? 5 : 0;
    for (const t of qt) {
      let best = 0;
      for (const w of p._tok) {
        if (w === t) best = Math.max(best, 4);
        else if (t.length >= 2 && w.startsWith(t)) best = Math.max(best, 3);
        else if (t.length >= 4 && w.includes(t)) best = Math.max(best, 2);
        else if (t.length >= 4 && lev(w, t) <= (t.length >= 7 ? 2 : 1)) best = Math.max(best, 1.5);
      }
      if (!best) return null;
      score += best;
    }
    if (p.src === "juntu") score += .2;
    return { p, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(x => x.p);
}

/* ---------- cart ---------- */
const qty = id => (S.cart.find(l => l.id === id) || {}).qty || 0;
const lines = () => S.cart.map(l => ({ ...l, p: byId(l.id) })).filter(l => l.p);
const count = () => lines().reduce((a, l) => a + l.qty, 0);
const subtotal = () => lines().reduce((a, l) => a + l.qty * l.p.price, 0);
const weight = () => lines().reduce((a, l) => a + l.qty * (l.p.wt || 1), 0);
if (!SHIP_ON) S.mode = "pickup";
const conflicts = () => S.mode === "ship" ? lines().filter(l => !l.p.ship) : [];
function setQty(id, n) {
  const i = S.cart.findIndex(l => l.id === id);
  if (n <= 0) { if (i > -1) S.cart.splice(i, 1); }
  else if (i > -1) S.cart[i].qty = Math.min(n, 99);
  else S.cart.push({ id, qty: Math.min(n, 99) });
  save(); refresh(id);
}
function add(id, n = 1, quiet) {
  const p = byId(id); if (!p) return;
  setQty(id, qty(id) + n);
  if (S.mode === "ship" && !p.ship) { pickupOnlyNotice(p); return; }
  if (!quiet) { toast(`Added ${p.name} · ${count()} in cart`, "View cart", openCart); bump(); }
}
function bump() { $$(".cnt").forEach(b => { b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }); }
function pickupOnlyNotice(p) {
  modal(`<h2 id="mtitle">${esc(p.name)} is pickup-only</h2>
  <p>${esc(CFG.shipping?.pickupOnlyNote || "Some items can only be collected from our Memphis store.")}</p>
  <p>Your cart is set to <b>shipping</b>. Choose how you’d like to continue:</p>
  <div class="btns"><button class="btn" data-act="set-mode" data-m="pickup">Switch to store pickup</button>
  <button class="btn ghost" data-act="rm" data-id="${p.id}">Remove this item</button></div>`);
}

/* shipping estimate — ILLUSTRATIVE ONLY, not a carrier quote */
function zone(zip) {
  if (!/^\d{5}$/.test(zip) || zip === "00000") return 0;
  const p = +zip.slice(0, 3);
  if (p >= 995 || (p >= 967 && p <= 969)) return 8;
  if (p >= 370 && p <= 385) return 2;
  return { 3: 3, 2: 4, 4: 4, 7: 4, 1: 5, 5: 5, 6: 5, 0: 6, 8: 6, 9: 7 }[zip[0]] || 0;
}
function rates() {
  const z = zone(S.zip); if (!z || !count()) return null;
  const lb = Math.max(1, Math.ceil(weight() + 1));
  const g = 9.5 + z * 1.35 + lb * (0.55 + z * 0.12);
  return [
    { id: "ground", name: "Standard ground", eta: "Estimated 2–6 business days", cost: g },
    { id: "express", name: "Express", eta: "Estimated 1–2 business days", cost: g * 2.3 + 8 }
  ];
}
const shipCost = () => { if (S.mode !== "ship") return 0; const r = rates(); if (!r) return null; return (r.find(x => x.id === S.rate) || r[0]).cost; };

/* ---------- small UI ---------- */
let toastT;
function toast(msg, act, fn) {
  const t = $("#toast");
  t.innerHTML = `<span>${esc(msg)}</span>${act ? `<button type="button">${esc(act)}</button>` : ""}`;
  if (act) t.querySelector("button").onclick = () => { t.classList.remove("on"); fn(); };
  t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 3200);
}
let lastFocus;
function modal(html, cls = "") {
  lastFocus = document.activeElement;
  $("#mbox").className = "box " + cls;
  $("#mbox").innerHTML = `<button class="ibtn x" type="button" data-act="close" aria-label="Close">${ic("x")}</button>` + html;
  $("#modal").classList.add("on"); $("#scrim").classList.add("on");
  setTimeout(() => ($("#mbox .btn, #mbox input, #mbox button") || {}).focus?.(), 30);
}
function closeAll() {
  lbClose(true);
  $("#modal").classList.remove("on"); $("#drawer").classList.remove("on");
  $("#drawer").setAttribute("aria-hidden", "true"); $("#scrim").classList.remove("on");
  $("#mega").classList.remove("on"); $(".filters")?.classList.remove("on");
  lastFocus?.focus?.();
}
function openCart() {
  lastFocus = document.activeElement;
  $("#toast").classList.remove("on"); renderDrawer(); $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on");
  setTimeout(() => $("#drawer .ibtn").focus(), 30);
}

/* ---------- shared fragments ---------- */
const chip = p => p.ship ? `<span class="fx">${ic("truck", 14, 2)}Ships · Pickup</span>` : `<span class="fx pk">${ic("store", 14, 2)}Pickup only</span>`;
function addCtl(p, sm) {
  const q = qty(p.id);
  if (!q) return `<button class="btn" type="button" data-act="add" data-id="${p.id}" aria-label="Add ${esc(p.name)} to cart">${ic("bag", 16, 2)} Add</button>`;
  return `<div class="step${sm ? " sm" : ""}" role="group" aria-label="Quantity of ${esc(p.name)} in cart"><button type="button" data-act="dec" data-id="${p.id}" aria-label="Decrease quantity">−</button><output aria-live="polite">${q}<span class="sr"> in cart</span></output><button type="button" data-act="inc" data-id="${p.id}" aria-label="Increase quantity">+</button></div>`;
}
const alt = p => `${p.name}${p.size ? ", " + p.size : ""} — product photo`;
const card = p => `<article class="card">
  <a class="im" href="#p-${p.id}" tabindex="-1" aria-hidden="true"><img src="${imgS(p)}" alt="${esc(alt(p))}" width="480" height="480" loading="lazy"></a>
  ${p.src === "juntu" && p.brand === "Juntu" ? '<span class="tagj">Juntu</span>' : ""}
  <div class="bd"><span class="br">${esc(p.brand)}</span>
  <h3><a href="#p-${p.id}">${esc(p.name)}</a></h3>${p.size ? `<span class="sz">${esc(p.size)}</span>` : ""}
  <div class="row"><span class="price">${money(p.price)}</span>${chip(p)}</div>
  <div class="add" data-add="${p.id}">${addCtl(p)}</div></div></article>`;
const hcard = p => `<article class="hc"><a class="im" href="#p-${p.id}" tabindex="-1" aria-hidden="true"><img src="${imgS(p)}" alt="${esc(alt(p))}" width="160" height="160" loading="lazy"></a>
  <div><span class="br">${esc(p.brand)}${p.size ? " · " + esc(p.size) : ""}</span><h3><a href="#p-${p.id}">${esc(p.name)}</a></h3>
  <div class="pr"><span class="price">${money(p.price)}</span><div class="add" data-add="${p.id}" data-sm="1">${addCtl(p, 1)}</div></div></div></article>`;
const grid = (list, cls = "") => `<div class="grid ${cls}">${list.map(card).join("")}</div>`;
const sh = (title, sub, link) => `<div class="sh"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${link || ""}</div>`;
const waBtn = () => STORE.wa ? `<a class="btn ghost" href="${STORE.wa}" target="_blank" rel="noopener">${ic("chat", 18)} WhatsApp</a>` : "";
const storeBtns = () => `<div class="btns">
  <a class="btn" href="tel:${STORE.tel1}">${ic("phone", 18)} Call ${STORE.tel1d}</a>${waBtn()}
  <a class="btn ghost" href="${STORE.map}" target="_blank" rel="noopener">${ic("pin", 18)} Get directions</a></div>`;
const callLine = () => `call${STORE.wa ? " or WhatsApp" : ""} <a href="tel:${STORE.tel1}">${STORE.tel1d}</a>`;

function syncCount() {
  const n = count();
  $$(".cnt").forEach(b => { b.textContent = n > 99 ? "99+" : n; b.dataset.n = n; });
  $$("[data-act=open-cart]").forEach(b => b.setAttribute("aria-label", `Cart, ${n} item${n === 1 ? "" : "s"}`));
}
function refresh(id) {
  syncCount();
  $$(`[data-add="${id}"]`).forEach(el => { const p = byId(id); if (!p) return;
    el.innerHTML = el.dataset.pdp ? (qty(id) ? `${ic("check", 16, 2.4)} ${qty(id)} in your cart · <button class="link" type="button" data-act="open-cart">View cart</button>` : "") : addCtl(p, el.dataset.sm); });
  if ($("#drawer").classList.contains("on")) renderDrawer();
  if (route === "cart") render();
  if (route === "checkout") render();
}

/* ---------- header ---------- */
const DEPTS = [
  { name: "Juntu Signature", href: "#juntu-collection", img: "assets/products/juntu-baobab-powder-cut.webp", pk: 1, cat: "juntu" },
  { name: "Rice, Grains & Flours", href: "#shop-rice-grains", img: "assets/dept/rice.webp", cat: "rice-grains" },
  { name: "Oils & Seasonings", href: "#shop-oils-seasonings", img: "assets/dept/spices.webp", cat: "oils-seasonings" },
  { name: "African Pantry", href: "#shop-pantry", img: "assets/dept/beans.webp", cat: "pantry" },
  { name: "Caribbean Favorites", href: "#shop-caribbean", img: "assets/dept/redbeans.webp", cat: "caribbean" },
  { name: "Beverages", href: "#shop-drinks", img: "assets/dept/hibiscus.webp", cat: "drinks" },
  { name: "Health & Wellness", href: "#shop-wellness", img: "assets/products/herb-to-body-super-sea-moss-bitter-cut.webp", pk: 1, cat: "wellness" }
];
/* Only departments backed by real catalog products are shown — every tile opens a filtered collection. */
const deptLive = () => DEPTS.filter(d => inCat(d.cat).length);
const visitLinks = () => `<li><span>${STORE.addr}<br>${STORE.cityLong}</span></li>
  <li><a href="tel:${STORE.tel1}">${STORE.tel1d}</a></li>
  <li><a href="${STORE.map}" target="_blank" rel="noopener">Get Directions</a></li>
  <li><a href="#visit">Our Memphis Market</a></li>`;
function renderHeader() {
  const f = $("#fulbtn");
  const pk = S.mode === "pickup";
  f.innerHTML = pk
    ? `${ic("store", 21)}<span><small>Store pickup</small><b>Memphis, TN</b></span><em aria-hidden="true">Pickup</em>`
    : `${ic("truck", 21)}<span><small>Shipping to</small><b>${S.zip ? "ZIP " + esc(S.zip) : "Add ZIP code"}</b></span><em aria-hidden="true">Ship</em>`;
  f.setAttribute("aria-label", pk ? "How you get your order: free store pickup in Memphis. Change" : "How you get your order: shipping" + (S.zip ? " to ZIP " + S.zip : "") + ". Change");
  const dl = deptLive();
  $("#navlinks").innerHTML = dl.map(d => `<a href="${d.href}" data-r="${d.href.slice(1)}">${esc(d.name)}</a>`).join("") + `<a href="#shop-african" data-r="shop-african">African Favorites</a><a href="#visit" data-r="visit">Our Memphis Market</a>`;
  $("#megain").innerHTML = `<div><h3>Departments</h3>${dl.slice(0, 4).map(d => `<a href="${d.href}"><img src="${d.img}" alt="" width="36" height="36" loading="lazy">${esc(d.name)}</a>`).join("")}</div>
   <div><h3>&nbsp;</h3>${dl.slice(4).map(d => `<a href="${d.href}"><img src="${d.img}" alt="" width="36" height="36" loading="lazy">${esc(d.name)}</a>`).join("")}<a href="#shop-african"><img src="assets/dept/millet.webp" alt="" width="36" height="36" loading="lazy">African Favorites</a></div>
   <div><h3>Our Memphis market</h3><a href="#visit">Visit the store<span>${STORE.addr}</span></a><a href="#pickup">Free store pickup<span>Order online, collect in Memphis</span></a></div>
   <div><h3>Help</h3><a href="#shop">Shop all ${P.length} products</a><a href="#shipping-info">Shipping &amp; pickup</a><a href="#faq">FAQ</a><a href="#contact">Contact us</a></div>`;
  $("#fvisit").innerHTML = visitLinks();
  syncCount();
  $$("#navlinks a").forEach(a => a.classList.toggle("cur", a.dataset.r === route));
  const bn = route === "cart" || route === "checkout" ? "cart" : route === "search" ? "search" : route.startsWith("shop") || route.startsWith("p-") || route === "juntu-collection" ? "shop" : route;
  $$(".bnav [data-b]").forEach(a => { const on = a.dataset.b === bn; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
}
const modeToggle = () => SHIP_ON ? `<div class="mode" role="group" aria-label="How you get your order"><button type="button" class="${S.mode === "pickup" ? "on" : ""}" data-act="set-mode" data-m="pickup" aria-pressed="${S.mode === "pickup"}">${ic("store", 17)} Store pickup</button><button type="button" class="${S.mode === "ship" ? "on" : ""}" data-act="set-mode" data-m="ship" aria-pressed="${S.mode === "ship"}">${ic("truck", 17)} Ship to me</button></div>` : "";
function fulfilModal() {
  modal(`<h2 id="mtitle">How would you like to get your order?</h2>
  ${modeToggle()}
  ${S.mode === "pickup"
    ? `<div class="addr">${ic("store")}<div>Juntu African Market<span>${STORE.addr}, ${STORE.city}</span><span>No shipping fee. We’ll let you know when your order is ready.</span></div></div>`
    : `<form class="zipf" data-form="zip"><label class="sr" for="mzip">Delivery ZIP code</label><input id="mzip" inputmode="numeric" maxlength="5" placeholder="Delivery ZIP code" value="${esc(S.zip)}"><button type="submit">Save</button></form><p class="err" id="mziperr" role="alert"></p><p class="note">Eligible shelf-stable groceries ship within the United States. ${esc(CFG.shipping?.pickupOnlyNote || "")}</p>`}
  <button class="btn block" type="button" data-act="close" style="margin-top:14px">Continue shopping</button>`);
}

/* ---------- drawer ---------- */
function rateBlock(ctx) {
  if (S.mode !== "ship") return `<div class="addr" style="border:0;padding:6px 0">${ic("store")}<div>Pickup at ${STORE.addr}<span>Free · we’ll notify you when it’s ready</span></div></div>`;
  const r = rates();
  return `<form class="zipf" data-form="zip"><label class="sr" for="z-${ctx}">Delivery ZIP code</label><input id="z-${ctx}" inputmode="numeric" maxlength="5" placeholder="Delivery ZIP code" value="${esc(S.zip)}"><button type="submit">Estimate</button></form>
  <p class="err" role="alert" data-err="zip"></p>
  ${r ? `<div class="rates" role="radiogroup" aria-label="Shipping options">${r.map(x => `<label><input type="radio" name="rate-${ctx}" value="${x.id}" data-act="rate" ${S.rate === x.id ? "checked" : ""}><span>${x.name}<br><small class="note">${x.eta}</small></span><span class="rp">${money(x.cost)}</span></label>`).join("")}</div>
  <p class="note">${DEMO ? "Illustrative estimate for this preview — not a carrier quote. " : ""}Final shipping cost is calculated at checkout.</p>` : `<p class="note">Enter a ZIP code to preview shipping options.</p>`}`;
}
function conflictBlock() {
  const c = conflicts(); if (!c.length) return "";
  return `<div class="warn" role="alert"><b>Some items can’t be shipped</b>${c.map(l => esc(l.p.name)).join(", ")} ${c.length > 1 ? "are" : "is"} available for store pickup only.
  <div class="btns"><button class="btn" type="button" data-act="set-mode" data-m="pickup">Switch to pickup</button><button class="btn ghost" type="button" data-act="rm-conflicts">Remove pickup-only items</button></div></div>`;
}
const lineHtml = l => `<div class="li"><a href="#p-${l.p.id}" data-act="close-nav"><img src="${imgS(l.p)}" alt="${esc(l.p.name)}" width="72" height="72" loading="lazy"></a>
  <div><a class="n" href="#p-${l.p.id}" data-act="close-nav">${esc(l.p.name)}</a><div class="m">${esc(l.p.brand)}${l.p.size ? " · " + esc(l.p.size) : ""} · ${money(l.p.price)} each</div>
  ${!l.p.ship ? `<div style="margin-top:4px">${chip(l.p)}</div>` : ""}
  <div class="ctl"><div class="step sm" role="group" aria-label="Quantity"><button type="button" data-act="dec" data-id="${l.p.id}" aria-label="Decrease quantity of ${esc(l.p.name)}">−</button><output>${l.qty}</output><button type="button" data-act="inc" data-id="${l.p.id}" aria-label="Increase quantity of ${esc(l.p.name)}">+</button></div>
  <button class="rm" type="button" data-act="rm" data-id="${l.p.id}">Remove</button></div></div>
  <div class="t">${money(l.qty * l.p.price)}</div></div>`;
function totals() {
  const sc = shipCost(), st = subtotal();
  return `<div class="tot"><span>Subtotal (${count()} item${count() === 1 ? "" : "s"})</span><span>${money(st)}</span></div>
  <div class="tot"><span>${S.mode === "pickup" ? "Store pickup" : "Shipping (estimate)"}</span><span>${S.mode === "pickup" ? "Free" : sc == null ? "Enter ZIP" : money(sc)}</span></div>
  <div class="tot"><span>Taxes</span><span>Calculated at checkout</span></div>
  <div class="tot big"><span>Estimated total</span><span>${money(st + (sc || 0))}</span></div>`;
}
function renderDrawer() {
  const L = lines();
  if (!L.length) {
    $("#dbody").innerHTML = `<div class="empty" style="margin-top:20px">${ic("bag", 36)}<h3>Your cart is empty</h3><p>Start with our Juntu Signature Collection.</p><a class="btn" href="#juntu-collection" data-act="close-nav">Shop Juntu products</a></div>`;
    $("#dfoot").innerHTML = ""; return;
  }
  $("#dbody").innerHTML = L.map(lineHtml).join("");
  const blocked = conflicts().length || (S.mode === "ship" && shipCost() == null);
  $("#dfoot").innerHTML = `${modeToggle()}
  ${rateBlock("d")}${conflictBlock()}${totals()}
  <a class="btn block" href="#checkout" data-act="close-nav" style="margin-top:12px" ${blocked ? 'aria-disabled="true" data-blocked="1"' : ""}>Checkout · ${money(subtotal() + (shipCost() || 0))}</a>
  <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:14.5px"><a href="#cart" data-act="close-nav">View full cart</a><button class="link" type="button" data-act="close">Continue shopping</button></div>`;
}

/* ---------- pages ---------- */
const sig = () => inCat("juntu");
let featTab = "all";
const FEAT = ["juntu-thiakry", "afrigrid-ijebu-garri", "maggi-chicken-cubes", "milo-tin-1-5kg", "tropical-sun-fragrant-rice", "juntu-baobab-powder", "peak-evaporated-milk", "tropiway-cocoyam-fufu", "sunquick-mandarin", "honey-beans-oloyin"];
const featList = () => (featTab === "all" ? FEAT.map(byId).filter(Boolean) : inCat(featTab)).slice(0, 10);
const featTabs = [["all", "Featured"], ["juntu", "Juntu"], ["rice-grains", "Grains & Flours"], ["pantry", "Pantry"], ["drinks", "Beverages"]];

/* Store photos: shown whole (never cropped) at their natural 1122×1402 ratio; tap/click opens full screen. */
const photo = (i, eager) => { const ph = PHOTOS[i]; return `<figure class="sphoto">
  <button type="button" class="sp-btn" data-act="lb-open" data-i="${i}" aria-label="View full screen: ${esc(ph.cap)}">
    <img src="${ph.md}" srcset="${ph.sm} 480w, ${ph.md} 800w, ${ph.src} 1122w" sizes="(max-width:760px) 46vw, (max-width:1180px) 30vw, 340px" alt="${esc(ph.alt)}" width="1122" height="1402" ${eager ? "" : 'loading="lazy"'} decoding="async">
    <span class="sp-zoom" aria-hidden="true">${ic("zoom", 16)}</span>
  </button><figcaption>${esc(ph.cap)}</figcaption></figure>`; };
function storeInfo(h) {
  const H = h || "h3";
  return `<div class="sinfo">
    <${H} class="sinfo-n">Juntu African Market</${H}>
    <p class="sinfo-a">${ic("pin", 20)}<span>${STORE.addr}<br>${STORE.cityLong}</span></p>
    <p class="sinfo-a">${ic("phone", 20)}<span>Phone: <a href="tel:${STORE.tel1}">${STORE.tel1d}</a></span></p>
    ${STORE.hours ? `<p class="sinfo-a">${ic("store", 20)}<span>${esc(STORE.hours)}</span></p>` : ""}
    <div class="btns sinfo-b">
      <a class="btn" href="${STORE.map}" target="_blank" rel="noopener">${ic("pin", 18)} Get Directions</a>
      <a class="btn ghost" href="tel:${STORE.tel1}">${ic("phone", 18)} Call Our Store</a>
      <a class="btn ghost" href="#shop">${ic("bag", 18)} Shop Online</a>${waBtn()}
    </div></div>`;
}
function storeSection(h1) {
  const T = h1 ? "h1" : "h2";
  return `<section class="market" aria-labelledby="mkh"><div class="wrap">
    <div class="mk-head">
      <span class="eyebrow"><span class="ring" aria-hidden="true"></span>OUR MEMPHIS MARKET</span>
      <${T} id="mkh" class="disp">More Than an Online Market.<span> A Taste of Home in Memphis.</span></${T}>
      <p>Step inside Juntu African Market and discover authentic African and Caribbean groceries, traditional ingredients, familiar brands and our exclusive Juntu Signature Collection. Shop with us in Memphis or order eligible products online from wherever you call home.</p>
    </div>
    <div class="mk-body">
      <div class="mk-gal">${photo(0, h1)}${photo(1, h1)}</div>
      ${storeInfo(h1 ? "h2" : "h3")}
    </div>
  </div></section>`;
}
const trust = () => `<ul class="trust" aria-label="Why shop with Juntu">
  <li>${ic("store", 20)}<span><b>A real Memphis market</b>Visit us at ${STORE.addr}</span></li>
  <li>${ic("leaf", 20)}<span><b>Authentic groceries</b>African &amp; Caribbean staples</span></li>
  <li>${ic("check", 20)}<span><b>Our own Juntu label</b>Exclusive Signature products</span></li>
  <li>${ic("bag", 20)}<span><b>Free local pickup</b>Order online, collect in store</span></li>
  ${SHIP_ON ? `<li>${ic("truck", 20)}<span><b>Shipping on eligible items</b>Shelf-stable groceries, U.S.</span></li>` : ""}
  <li>${ic("phone", 20)}<span><b>Talk to the store</b><a href="tel:${STORE.tel1}">${STORE.tel1d}</a></span></li>
</ul>`;
const sigCard = p => `<article class="scard">
  <a class="sc-im" href="#p-${p.id}" tabindex="-1" aria-hidden="true"><img src="assets/products/${p.img}-480.webp" alt="" width="480" height="480" loading="lazy"></a>
  <div class="sc-bd"><h3><a href="#p-${p.id}">${esc(p.name.replace(/^Juntu /, ""))}</a></h3>
  <span class="sc-k">Juntu Signature${p.size ? " · " + esc(p.size) : ""}</span>
  <div class="sc-row"><span class="price">${money(p.price)}</span><div class="add" data-add="${p.id}" data-sm="1">${addCtl(p, 1)}</div></div></div></article>`;
function fulfilSection() {
  return `<section class="sec ffx-s" aria-labelledby="sph"><div class="wrap">
    ${sh('<span id="sph">Two easy ways to shop</span>', "Choose at checkout. Every product page shows whether it can ship.")}
    <div class="ways">
      <div class="way"><span class="wi">${ic("store", 26, 1.7)}</span><div><h3>Free Store Pickup</h3><p>Order online and collect your groceries at our Memphis location once your order is ready.</p>
        <p class="wx">${STORE.addr}, ${STORE.cityLong}</p><button class="btn ghost" type="button" data-act="shop-pickup">Shop for pickup</button></div></div>
      ${SHIP_ON ? `<div class="way"><span class="wi">${ic("truck", 26, 1.7)}</span><div><h3>Shipping</h3><p>Shop eligible African and Caribbean groceries and have them shipped to your address.</p>
        <p class="wx">Shipping cost is calculated at checkout from your address. ${esc(CFG.shipping?.pickupOnlyNote || "")}</p><a class="btn ghost" href="#shipping-info">Shipping details</a></div></div>` : ""}
    </div>
  </div></section>`;
}
function pHome() {
  const s = sig();
  const afr = ["afrigrid-ijebu-garri", "tropiway-cocoyam-fufu", "honey-beans-oloyin", "maggi-chicken-cubes", "titus-sardines", "indomie-onion-chicken", "milo-tin-1-5kg", "birds-custard"].map(byId).filter(Boolean);
  const car = inCat("caribbean");
  const pan = ["nido-fortificada", "rosa-margarine-450g", "peak-evaporated-milk", "titus-sardines", "indomie-onion-chicken", "birds-custard"].map(byId).filter(Boolean);
  const heroP = ["juntu-baobab-powder", "juntu-thiakry", "juntu-red-palm-oil"].map(byId).filter(Boolean);
  const rv = S.recent.map(byId).filter(Boolean).slice(0, 5);
  return `
  <section class="hero">
    <div class="hero-img"><picture><source media="(max-width:760px)" srcset="assets/brand/hero-m.webp" width="900" height="398"><img src="assets/brand/hero-1600.webp" alt="Wooden bowls of rice, black-eyed peas, millet, spices and dried hibiscus with plantain and cassava" width="1600" height="1067" fetchpriority="high"></picture></div>
    <div class="wrap hero-in">
      <div class="hero-copy">
        <span class="eyebrow"><span class="ring" aria-hidden="true"></span>African &amp; Caribbean grocery · Shop online</span>
        <h1 class="disp">The Taste of Home. <span>Delivered to Your Door.</span></h1>
        <p class="lead">Authentic African and Caribbean groceries. Your favorite ingredients, wherever you call home.</p>
        <div class="ctas"><a class="btn lg" href="#shop">${ic("bag", 18, 2)} Shop Now</a><a class="btn ghost lg" href="#juntu-collection">Discover Juntu Products</a></div>
        <div class="facts"><span>${ic("store", 18)} Free pickup in Memphis</span>${SHIP_ON ? `<span>${ic("truck", 18)} Shipping on eligible items</span>` : ""}<span>${ic("check", 18)} ${P.length} products online</span></div>
      </div>
      <div class="hero-prods"><div class="hp-h"><span>Proudly Juntu</span><a class="more" href="#juntu-collection">Shop the collection →</a></div>
        <div class="hp">${heroP.map(p => `<a href="#p-${p.id}"><span><img src="assets/products/${p.img}-cut.webp" alt="${esc(alt(p))}" width="200" height="240"></span>${esc(p.name.replace(/^Juntu /, ""))}<b>${money(p.price)}</b></a>`).join("")}</div></div>
    </div>
  </section>

  <section class="sec dsec" aria-labelledby="dh"><div class="wrap">
    ${sh('<span id="dh">Shop by department</span>', "", '<a class="more" href="#shop">Shop all →</a>')}
    <div class="depts" role="list">${deptLive().map(d => `<a class="dep" role="listitem" href="${d.href}"><span class="c${d.pk ? " pk" : ""}"><img src="${d.img}" alt="" width="160" height="160" loading="lazy"></span>${esc(d.name)}<small>${inCat(d.cat).length} product${inCat(d.cat).length === 1 ? "" : "s"}</small></a>`).join("")}</div>
  </div></section>

  <section class="sec" style="padding-top:0" aria-labelledby="fh"><div class="wrap">
    ${sh('<span id="fh">Shop our shelves</span>', "Everyday staples and our own Juntu products.", '<a class="more" href="#shop">See all ' + P.length + ' →</a>')}
    <div class="tabs" role="tablist" aria-label="Product groups">${featTabs.map(([k, t]) => `<button type="button" role="tab" data-act="tab" data-k="${k}" aria-selected="${featTab === k}">${t}</button>`).join("")}</div>
    <div id="featgrid">${grid(featList())}</div>
  </div></section>

  <section class="sig" aria-labelledby="sgh"><div class="wrap">
    <div class="sig-panel">
      <div class="sig-brand">
        <img class="sig-logo" src="assets/brand/juntu-logo-160.webp" alt="Juntu Market LLC logo" width="120" height="120" loading="lazy">
        <span class="sig-k">The Juntu Signature Collection</span>
        <h2 id="sgh" class="disp">Rooted in Tradition.<span> Proudly Juntu.</span></h2>
        <p>Traditional West African ingredients packed under our own name — red palm oil, baobab, thiakry, noflaye and arraw, each carrying the Juntu Market label from our Memphis store.</p>
        <a class="btn gold" href="#juntu-collection">Shop the Juntu Collection</a>
      </div>
      <div class="sig-grid">${s.map(sigCard).join("")}</div>
    </div>
  </div></section>

  <section class="sec" aria-labelledby="ah"><div class="wrap feat">
    <a class="feat-img afr" href="#shop-african"><img src="assets/brand/pantry-wide.webp" alt="Kente cloth beneath bowls of hibiscus, rice, beans, millet, flour and spices with cassava, plantain and palm oil" width="1000" height="667" loading="lazy">
      <div><span class="fi-k">African Favorites</span><h2 id="ah">The flavors of a West African kitchen.</h2><p>Garri, fufu, honey beans, Maggi, Milo and the staples you grew up cooking with.</p><b>Shop African Favorites →</b></div></a>
    <div class="grid g4 rail">${afr.map(card).join("")}</div>
  </div></section>

  <section class="sec" style="padding-top:0" aria-labelledby="ch"><div class="wrap"><div class="carib">
    <div class="carib-img"><img src="assets/brand/caribbean-wide.webp" alt="Red kidney beans for rice and peas beside scotch bonnet peppers and whole cloves" width="640" height="320" loading="lazy"></div>
    <div class="carib-body"><span class="eyebrow carib-k"><span class="ring" aria-hidden="true"></span>Caribbean Favorites</span>
      <h2 id="ch">A taste of the islands, too.</h2><p>Fragrant rice for rice and peas, sea moss and pantry essentials from across the Caribbean.</p>
      <div class="hcards">${car.map(hcard).join("")}</div>
      <p class="ask">${ic("chat", 18)}<span>Looking for a Caribbean staple you don’t see online? Our store carries more — ${callLine()}.</span></p>
      <a class="more" href="#shop-caribbean">Shop Caribbean Favorites →</a>
    </div></div></div></section>

  <section class="sec" style="padding-top:0" aria-labelledby="ph"><div class="wrap">
    ${sh('<span id="ph">Pantry essentials</span>', "Milk, margarine, tinned fish, noodles and custard — the cupboard basics.", '<a class="more" href="#shop-pantry">Shop pantry →</a>')}
    <div class="plist">${pan.map(hcard).join("")}</div>
  </div></section>

  ${fulfilSection()}

  ${storeSection()}

  <section class="sec"><div class="wrap">${trust()}</div></section>

  ${rv.length ? `<section class="sec" style="padding-top:0"><div class="wrap">${sh("Recently viewed")}${grid(rv)}</div></section>` : ""}`;
}

function filtered(base) {
  let L = base.slice();
  if (F.brands.length) L = L.filter(p => F.brands.includes(p.brand));
  const mn = parseFloat(F.min), mx = parseFloat(F.max);
  if (!isNaN(mn)) L = L.filter(p => p.price >= mn);
  if (!isNaN(mx)) L = L.filter(p => p.price <= mx);
  const by = { "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price, "az": (a, b) => a.name.localeCompare(b.name), "za": (a, b) => b.name.localeCompare(a.name) }[F.sort];
  if (by) L.sort(by);
  return L;
}
function pShop(cat, isSearch) {
  const base = isSearch ? search(Q) : cat ? inCat(cat) : P;
  const L = filtered(base);
  const brands = [...new Set(base.map(p => p.brand))].sort();
  const title = isSearch ? `Results for “${esc(Q)}”` : cat ? esc(catName(cat)) : "Shop all products";
  const sub = isSearch ? `${base.length} product${base.length === 1 ? "" : "s"} match your search.` : cat === "caribbean" ? "Caribbean pantry favorites. Our Memphis store carries more in store — call to ask." : cat === "african" ? "Traditional grains, cooking oils, seasonings, beverages and pantry ingredients." : "African and Caribbean groceries, Juntu-label products and familiar brands.";
  const active = [...F.brands.map(b => `<button type="button" data-act="unbrand" data-b="${esc(b)}">${esc(b)} ✕</button>`), F.min || F.max ? `<button type="button" data-act="unprice">${F.min ? "$" + esc(F.min) : "$0"}–${F.max ? "$" + esc(F.max) : "any"} ✕</button>` : ""].join("");
  const empty = isSearch && !base.length;
  return `<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<a href="#shop">Shop</a>${cat ? `›<span aria-current="page">${esc(catName(cat))}</span>` : ""}${isSearch ? "›<span>Search</span>" : ""}</nav>
  <h1 class="ptitle">${title}</h1><p class="psub">${sub}</p>
  ${empty ? emptySearch() : `<div class="shop">
    <aside class="filters" id="filters" aria-label="Filters">
      <div style="display:flex;justify-content:space-between;align-items:center" class="fbtn-close-row"><h2 style="font-size:18px;margin:0 0 12px">Filters</h2><button class="ibtn fbtn" type="button" data-act="close" aria-label="Close filters">${ic("x")}</button></div>
      <div class="fgroup"><h3>Category</h3>
        <label><input type="radio" name="fc" data-act="fcat" value="" ${!cat ? "checked" : ""}>All products<span class="ct">${P.length}</span></label>
        ${liveCats().map(c => `<label><input type="radio" name="fc" data-act="fcat" value="${c.id}" ${cat === c.id ? "checked" : ""}>${esc(c.short)}<span class="ct">${inCat(c.id).length}</span></label>`).join("")}</div>
      <div class="fgroup"><h3>Brand</h3>${brands.map(b => `<label><input type="checkbox" data-act="fbrand" value="${esc(b)}" ${F.brands.includes(b) ? "checked" : ""}>${esc(b)}<span class="ct">${base.filter(p => p.brand === b).length}</span></label>`).join("")}</div>
      <div class="fgroup"><h3>Price</h3><form class="prange" data-form="price"><label class="sr" for="pmin">Minimum price</label><input id="pmin" inputmode="decimal" placeholder="$ min" value="${esc(F.min)}"><span>–</span><label class="sr" for="pmax">Maximum price</label><input id="pmax" inputmode="decimal" placeholder="$ max" value="${esc(F.max)}"><button class="btn ghost" style="min-height:42px;padding:0 14px" type="submit">Go</button></form></div>
      <div class="fgroup"><button class="btn ghost block" type="button" data-act="clear-f">Clear all filters</button><button class="btn block fbtn" style="margin-top:10px" type="button" data-act="close">Show ${L.length} product${L.length === 1 ? "" : "s"}</button></div>
    </aside>
    <div>
      <div class="toolbar"><span class="cnt" role="status">${L.length} product${L.length === 1 ? "" : "s"}</span>
        <div style="display:flex;gap:10px;align-items:center"><button class="btn ghost fbtn" type="button" data-act="open-f" style="min-height:44px">Filters${F.brands.length || F.min || F.max ? " •" : ""}</button>
        <label class="sr" for="sort">Sort by</label><select id="sort" data-act="sort">
          ${[["featured", "Featured"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["az", "Name: A–Z"], ["za", "Name: Z–A"]].map(([v, t]) => `<option value="${v}" ${F.sort === v ? "selected" : ""}>${t}</option>`).join("")}</select></div></div>
      ${active ? `<div class="chips">${active}<button type="button" data-act="clear-f">Clear all</button></div>` : ""}
      ${L.length ? grid(L) : `<div class="empty"><h3>No products match these filters</h3><p>Try removing a filter or widening the price range.</p><button class="btn" type="button" data-act="clear-f">Clear all filters</button></div>`}
    </div></div>`}</div>`;
}
function emptySearch() {
  return `<div class="empty" style="margin-bottom:28px"><h3>We couldn’t find “${esc(Q)}” online</h3><p>Check the spelling or try another name — for example “thiakry”, “dégué”, “bouye” or “noflaye”. Our Memphis store may also have it on the shelf — ${callLine()}.</p><div class="popq">${POPULAR.map(t => `<button type="button" data-act="q" data-q="${esc(t)}">${esc(t)}</button>`).join("")}</div></div>
  ${sh("Popular from our own label")}${grid(sig())}<div style="height:48px"></div>`;
}
function pCollection() {
  return `<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<a href="#shop">Shop</a>›<span aria-current="page">Juntu Signature Collection</span></nav>
  <div class="colhead"><img src="assets/brand/juntu-logo-160.webp" alt="Juntu Market LLC logo" width="96" height="96">
    <div><span class="sig-k">The Juntu Signature Collection</span><h1 class="disp">Rooted in Tradition.<span> Proudly Juntu.</span></h1>
    <p>Traditional ingredients and familiar flavors brought together under our own brand. Every pack carries the Juntu Market label from our Memphis store${SHIP_ON ? ", and every Juntu product is eligible for U.S. shipping" : ""}.</p></div></div>
  <div class="sig-grid col">${sig().map(sigCard).join("")}</div>
  <div class="card-box" style="margin:28px 0 56px"><b>Know it by another name?</b> Search works with the names you grew up with: thiakry or dégué, baobab or bouye, peanut powder or noflaye, arraw or millet granules.</div></div>`;
}
function pProduct(id) {
  const p = byId(id);
  if (!p) return notFound();
  S.recent = [id, ...S.recent.filter(x => x !== id)].slice(0, 8); save();
  const rel = P.filter(x => x.id !== id && x.cats.some(c => c === p.cats[0])).slice(0, 4);
  const more = rel.length < 4 ? P.filter(x => x.id !== id && !rel.includes(x)).slice(0, 4 - rel.length) : [];
  const c0 = p.cats[0];
  setLD({ "@context": "https://schema.org", "@type": "Product", name: p.name, brand: { "@type": "Brand", name: p.brand }, image: imgL(p), description: p.desc });
  return `<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<a href="#${c0 === "juntu" ? "juntu-collection" : "shop-" + c0}">${esc(catName(c0))}</a>›<span aria-current="page">${esc(p.name)}</span></nav>
  <div class="pdp">
    <div class="pdp-im"><button class="zoom" type="button" data-act="zoom" aria-label="Zoom product photo"><img src="${imgL(p)}" alt="${esc(alt(p))}" width="900" height="900"><span class="zh">${ic("zoom", 16)} Tap to zoom</span></button></div>
    <div class="pinfo"><span class="br">${esc(p.brand)}</span><h1>${esc(p.name)}</h1>
      ${p.size ? `<div class="sz">${esc(p.size)}</div>` : `<div class="sz">Size: see package</div>`}
      <div class="price">${money(p.price)}</div>${DEMO ? `<p class="pnote">Preview price — to be confirmed by the store</p>` : `<div style="height:14px"></div>`}
      <div class="buy"><div class="step" role="group" aria-label="Quantity"><button type="button" data-act="pq-" aria-label="Decrease quantity">−</button><output id="pq">1</output><button type="button" data-act="pq+" aria-label="Increase quantity">+</button></div>
      <button class="btn" type="button" data-act="add-n" data-id="${p.id}">${ic("bag", 18, 2)} Add to cart</button></div>
      <div class="incart" data-add="${p.id}" data-pdp="1">${qty(p.id) ? `${ic("check", 16, 2.4)} ${qty(p.id)} in your cart · <button class="link" type="button" data-act="open-cart">View cart</button>` : ""}</div>
      <button class="btn ghost block" type="button" data-act="buy-now" data-id="${p.id}">Buy now</button>
      <div class="elig">
        ${!SHIP_ON ? "" : p.ship ? `<div>${ic("truck")}<span><b>Eligible for U.S. shipping</b><span>Shipping is calculated at checkout from your address.</span></span></div>` : `<div>${ic("truck")}<span><b>Not available for shipping</b><span>Fresh and temperature-sensitive items are pickup-only.</span></span></div>`}
        <div>${ic("store")}<span><b>Free store pickup</b><span>${STORE.addr}, Memphis — we’ll notify you when it’s ready.</span></span></div>
      </div>
      <details class="acc" open><summary>Product information</summary><p>${esc(p.desc)}</p>${p.label ? `<p style="color:var(--mut)">${esc(p.label)}</p>` : ""}</details>
      <details class="acc"><summary>Ingredients &amp; allergens</summary><p>Please read the ingredient list and allergen information printed on the package before use. Questions? Call <a href="tel:${STORE.tel1}">${STORE.tel1d}</a>.</p></details>
      <details class="acc"><summary>Shipping &amp; pickup</summary><p>${p.ship ? "Shelf-stable item: available for U.S. shipping or free pickup in Memphis." : "Pickup-only item: collect from our Memphis store."} <a href="#shipping-info">Shipping information</a></p></details>
    </div>
  </div>
  <section style="padding-bottom:56px">${sh("You may also like")}${grid([...rel, ...more])}</section></div>`;
}
function pCart() {
  const L = lines();
  if (!L.length) return `<div class="wrap" style="padding:40px 0 64px"><div class="empty">${ic("bag", 40)}<h3>Your cart is empty</h3><p>Browse our departments or start with the Juntu Signature Collection.</p><div class="btns" style="justify-content:center"><a class="btn" href="#shop">Shop all products</a><a class="btn ghost" href="#juntu-collection">Juntu products</a></div></div></div>`;
  const blocked = conflicts().length || (S.mode === "ship" && shipCost() == null);
  return `<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<span>Cart</span></nav><h1 class="ptitle">Your cart</h1><p class="psub">${count()} item${count() === 1 ? "" : "s"}</p>
  <div class="two"><div>${L.map(lineHtml).join("")}<div style="margin-top:16px"><a href="#shop">← Continue shopping</a></div></div>
  <aside class="sum" aria-label="Order summary"><h2>Order summary</h2>
    ${modeToggle()}
    ${rateBlock("c")}${conflictBlock()}${totals()}
    <a class="btn block" href="#checkout" style="margin-top:14px" ${blocked ? 'aria-disabled="true" data-blocked="1"' : ""}>Proceed to checkout</a>
    <p class="note" style="text-align:center">${ic("lock", 14)} Guest checkout — no account needed</p></aside></div></div>`;
}

/* checkout */
const TEST = { email: "test.customer@example.com", phone: "(901) 555-0142", first: "Aminata", last: "Test", a1: "1200 Example Ave", a2: "", city: "Atlanta", st: "GA", zip: "30303" };
function field(k, label, type = "text", ac = "", w = false, opt = false) {
  const v = co.d[k] ?? "";
  return `<div class="f${w ? " w" : ""}"><label for="co-${k}">${label}${opt ? ' <span style="color:var(--mut);font-weight:500">(optional)</span>' : ""}</label><input id="co-${k}" name="${k}" type="${type}" autocomplete="${ac}" value="${esc(v)}" ${opt ? "" : "required"} aria-describedby="e-${k}"><span class="err" id="e-${k}"></span></div>`;
}
function summaryBox() {
  return `<aside class="sum" aria-label="Order summary"><h2>Order summary</h2>${lines().map(l => `<div class="li" style="grid-template-columns:56px minmax(0,1fr) auto"><img src="${imgS(l.p)}" alt="" width="56" height="56" style="width:56px;height:56px"><div><span class="n">${esc(l.p.name)}</span><div class="m">Qty ${l.qty}</div></div><div class="t">${money(l.qty * l.p.price)}</div></div>`).join("")}<div style="height:10px"></div>${totals()}</aside>`;
}
function pCheckout() {
  if (!lines().length) return pCart();
  if (conflicts().length) { co.step = 1; }
  const st = co.step;
  const steps = `<ol class="steps" aria-label="Checkout steps"><li class="on"><i>1</i>Cart</li><li class="${st >= 1 ? "on" : ""}"><i>2</i>Contact &amp; fulfillment</li><li class="${st >= 2 ? "on" : ""}"><i>3</i>Payment</li><li><i>4</i>Confirmation</li></ol>`;
  let body;
  if (st === 1) {
    body = `<form id="coform" novalidate>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px"><span class="testtag">Demo checkout — test data only</span><button class="link" type="button" data-act="testdata">Fill in test customer</button></div>
    <fieldset><legend>Contact</legend><div class="fl">${field("email", "Email", "email", "email", true)}${field("phone", "Mobile phone", "tel", "tel", true)}${field("first", "First name", "text", "given-name")}${field("last", "Last name", "text", "family-name")}</div></fieldset>
    <fieldset><legend>Fulfillment</legend>
      ${modeToggle()}
      ${conflictBlock()}
      ${S.mode === "pickup" ? `<div class="addr" style="border:0">${ic("store")}<div>Juntu African Market<span>${STORE.addr}, ${STORE.city}</span><span>Free. We’ll text and email you when your order is ready for pickup.</span></div></div>`
      : `<div class="fl">${field("a1", "Street address", "text", "address-line1", true)}${field("a2", "Apartment, suite, etc.", "text", "address-line2", true, true)}${field("city", "City", "text", "address-level2")}<div class="f"><label for="co-st">State</label><input id="co-st" name="st" maxlength="2" autocomplete="address-level1" value="${esc(co.d.st || "")}" required aria-describedby="e-st" style="text-transform:uppercase"><span class="err" id="e-st"></span></div>
      <div class="f w"><label for="co-zip">ZIP code</label><input id="co-zip" name="zip" inputmode="numeric" maxlength="5" autocomplete="postal-code" value="${esc(co.d.zip || S.zip)}" required aria-describedby="e-zip" data-act="cozip"><span class="err" id="e-zip"></span></div></div>
      ${rates() ? `<div class="rates" role="radiogroup" aria-label="Shipping options" style="margin-top:10px">${rates().map(x => `<label><input type="radio" name="rate-co" value="${x.id}" data-act="rate" ${S.rate === x.id ? "checked" : ""}><span>${x.name}<br><small class="note">${x.eta}</small></span><span class="rp">${money(x.cost)}</span></label>`).join("")}</div>${DEMO ? `<p class="note">Illustrative estimate — not a carrier quote.</p>` : ""}` : ""}`}
    </fieldset>
    <button class="btn block" type="submit" ${conflicts().length ? "disabled" : ""}>Continue to payment</button></form>`;
  } else {
    const d = co.d;
    body = `<div class="card-box" style="margin-top:0"><div style="display:flex;justify-content:space-between;gap:10px"><b>Contact</b><button class="link" type="button" data-act="co-back">Change</button></div><p style="margin:6px 0 0">${esc(d.first)} ${esc(d.last)} · ${esc(d.email)} · ${esc(d.phone)}</p></div>
    <div class="card-box"><div style="display:flex;justify-content:space-between;gap:10px"><b>${S.mode === "pickup" ? "Store pickup" : "Ship to"}</b><button class="link" type="button" data-act="co-back">Change</button></div><p style="margin:6px 0 0">${S.mode === "pickup" ? `Juntu African Market, ${STORE.addr}, ${STORE.city}` : `${esc(d.a1)}${d.a2 ? ", " + esc(d.a2) : ""}, ${esc(d.city)}, ${esc((d.st || "").toUpperCase())} ${esc(d.zip)} · ${esc((rates() || []).find(x => x.id === S.rate)?.name || "")}`}</p></div>
    <fieldset><legend>Payment</legend><div class="paybox">
      <label><input type="radio" name="pay" checked><span><b>Simulated test payment</b><small>Demo only — no card details are collected and no money is charged.</small></span></label>
      <label class="dis"><input type="radio" name="pay" disabled><span><b>Shop Pay · Apple Pay · Google Pay · Credit &amp; debit cards</b><small>Provided by Shopify’s secure checkout when the store goes live.</small></span></label>
    </div></fieldset>
    <button class="btn block" type="button" data-act="place">Place test order · ${money(subtotal() + (shipCost() || 0))}</button>
    <p class="note" style="text-align:center">Taxes are calculated by Shopify at checkout in the live store.</p>`;
  }
  return `<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<a href="#cart">Cart</a>›<span>Checkout</span></nav><h1 class="ptitle">Checkout</h1>${steps}
  <div class="two"><div>${body}</div>${summaryBox()}</div></div>`;
}
function placeOrder() {
  const L = lines();
  const n = "JM-T" + (1001 + S.orders.length);
  const o = { n, date: new Date().toISOString(), mode: S.mode, rate: S.mode === "ship" ? ((rates() || []).find(x => x.id === S.rate) || {}).name : "", ship: shipCost() || 0,
    sub: subtotal(), items: L.map(l => ({ id: l.p.id, name: l.p.name, qty: l.qty, price: l.p.price })), first: co.d.first, email: co.d.email,
    to: S.mode === "ship" ? `${co.d.city}, ${(co.d.st || "").toUpperCase()} ${co.d.zip}` : "" };
  S.orders.unshift(o); S.cart = []; save(); co = { step: 1, d: co.d };
  location.hash = "order-" + n;
}
function statusList(o) {
  const st = o.mode === "pickup" ? ["Order received", "Being prepared", "Ready for pickup", "Picked up"] : ["Order received", "Packed", "Shipped", "Delivered"];
  return `<ol class="status">${st.map((s, i) => `<li class="${i === 0 ? "on" : ""}">${i === 0 ? ic("check", 14, 2.4) + " " : ""}${s}</li>`).join("")}</ol>`;
}
function pOrder(n) {
  const o = S.orders.find(x => x.n === n);
  if (!o) return notFound();
  return `<div class="wrap"><div class="conf">
    <div class="tick">${ic("check", 32, 2.4)}</div><span class="testtag">Test order — no payment was taken</span>
    <h1 class="ptitle">Thank you${o.first ? ", " + esc(o.first) : ""}.</h1>
    <p class="psub">Order <b>${esc(o.n)}</b> has been received. ${o.mode === "pickup" ? "We’ll notify you by text and email when it’s ready — please wait for that message before coming to the store." : "You’ll receive tracking details by email once your package ships."}</p>
    ${statusList(o)}
    <div class="card-box">${o.items.map(i => `<div class="tot"><span>${esc(i.name)} × ${i.qty}</span><span>${money(i.qty * i.price)}</span></div>`).join("")}
      <div class="tot" style="border-top:1px solid var(--line);margin-top:8px;padding-top:10px"><span>Subtotal</span><span>${money(o.sub)}</span></div>
      <div class="tot"><span>${o.mode === "pickup" ? "Store pickup" : esc(o.rate) + " (estimate)"}</span><span>${o.mode === "pickup" ? "Free" : money(o.ship)}</span></div>
      <div class="tot big"><span>Total before tax</span><span>${money(o.sub + o.ship)}</span></div></div>
    <div class="card-box"><b>${o.mode === "pickup" ? "Pickup location" : "Shipping to"}</b><p style="margin:6px 0 0">${o.mode === "pickup" ? `Juntu African Market · ${STORE.addr}, ${STORE.city} · <a href="${STORE.map}" target="_blank" rel="noopener">Get directions</a>` : esc(o.to)}</p></div>
    <div class="btns"><a class="btn" href="#shop">Continue shopping</a><a class="btn ghost" href="#account">View my orders</a></div>
  </div></div>`;
}
function pAccount() {
  const rv = S.recent.map(byId).filter(Boolean).slice(0, 4);
  return `<div class="wrap prose" style="max-width:980px"><nav class="crumbs"><a href="#home">Home</a>›<span>Account</span></nav><h1 class="ptitle">My account</h1>
  <p class="psub">Accounts are optional — you can always check out as a guest. With an account you can see past orders, save addresses and reorder your usual groceries in one tap.</p>
  <div class="card-box"><b>Sign in or create an account</b><p style="margin:6px 0 12px;color:var(--mut)">Customer sign-in uses a one-time code sent to your email.</p><button class="btn" type="button" data-act="signin">Sign in with email</button></div>
  <h2>Your orders</h2>
  ${S.orders.length ? S.orders.map(o => `<div class="card-box"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>${esc(o.n)} <span class="testtag" style="margin:0 0 0 6px">Test</span></b><span style="color:var(--mut)">${new Date(o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${o.mode === "pickup" ? "Store pickup" : "Shipping"}</span></div>
    <p style="margin:6px 0 12px">${o.items.map(i => `${esc(i.name)} × ${i.qty}`).join(", ")}</p><div class="btns"><button class="btn" type="button" data-act="reorder" data-n="${esc(o.n)}">Buy again</button><a class="btn ghost" href="#order-${esc(o.n)}">View order</a></div></div>`).join("")
  : `<p style="color:var(--mut)">No orders yet. Orders you place will appear here with a <b>Buy again</b> button.</p>`}
  ${rv.length ? `<h2>Recently viewed</h2>${grid(rv)}` : ""}</div>`;
}
function pTrack() {
  return `<div class="wrap prose"><nav class="crumbs"><a href="#home">Home</a>›<span>Order tracking</span></nav><h1 class="ptitle">Track your order</h1>
  <p class="psub">Enter the order number from your confirmation email and the email you used at checkout.</p>
  <form id="trackform" class="card-box fl" novalidate><div class="f"><label for="tn">Order number</label><input id="tn" placeholder="e.g. JM-T1001" required></div><div class="f"><label for="te">Email</label><input id="te" type="email" autocomplete="email" required></div><div class="f w"><button class="btn" type="submit">Find my order</button></div></form><div id="trackres" role="status"></div></div>`;
}
function infoPage(t, html) { return `<div class="wrap prose"><nav class="crumbs"><a href="#home">Home</a>›<span>${t}</span></nav><h1 class="ptitle">${t}</h1>${html}</div>`; }
function pVisit() {
  return `<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<span aria-current="page">Our Memphis Market</span></nav></div>
  ${storeSection(true)}
  <section class="sec" style="padding-top:0"><div class="wrap"><div class="about">
    <div><h2>A Memphis market with Africa and the Caribbean on its shelves.</h2>
      <p>Juntu African Market is the grocery store of Juntu Market LLC — <i>Your Taste of Africa &amp; the Caribbean</i>. Alongside familiar brands, we offer traditional ingredients under our own Juntu label.</p>
      <p>Our shelves are now online too: order from anywhere, collect for free in Memphis, or have eligible groceries shipped.</p></div>
    <ul>
      <li>${ic("check", 17, 2.4)}Halal meat: beef, lamb, goat &amp; chicken (in store)</li>
      <li>${ic("check", 17, 2.4)}Meat &amp; fish market (in store)</li>
      <li>${ic("check", 17, 2.4)}Fresh vegetables (in store)</li>
      <li>${ic("check", 17, 2.4)}Rice, grains, flour &amp; legumes</li>
      <li>${ic("check", 17, 2.4)}Cooking oils, seasonings &amp; beverages</li>
      <li>${ic("check", 17, 2.4)}The Juntu Signature Collection</li>
    </ul>
  </div></div></section>`;
}
function pPickup() {
  return `<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>›<span aria-current="page">Free store pickup</span></nav></div>
  <section class="sec" style="padding-top:14px"><div class="wrap store">
    <div class="store-ph">${photo(0, true)}</div>
    <div><h1 class="ptitle">Free Store Pickup in Memphis</h1><p>Order online and collect your groceries at our Memphis location once your order is ready. Pickup is always free.</p>
      <ol class="how"><li><b>Shop online</b><span>Add groceries to your cart and choose <i>Store pickup</i>.</span></li><li><b>Place your order</b><span>Check out with your contact details.</span></li><li><b>Wait for our message</b><span>We let you know when your order is ready.</span></li><li><b>Collect in store</b><span>Bring your order number to ${STORE.addr}.</span></li></ol>
      ${storeInfo("h2")}</div>
  </div></section>`;
}
function pFresh() {
  return infoPage("Halal meat, fish &amp; fresh produce", `<p class="psub">Our Memphis store has a halal meat and fish market and fresh vegetables. These items are sold in store and are not shipped.</p>
  <div class="dept" style="margin-top:0"><div><b>Halal meat</b><span>Beef, lamb, goat and chicken</span></div><div><b>Fish</b><span>From our meat &amp; fish market</span></div><div><b>Fresh vegetables</b><span>Seasonal selection in store</span></div></div>
  <div class="card-box"><b>Ask about today’s selection</b><p style="margin:6px 0 12px">Call us to check what’s available.</p>${storeBtns()}</div>`);
}
const DRAFT = `<div class="draft" role="note"><b>Draft for owner review.</b> This policy has not yet been approved by Juntu Market LLC and must be reviewed before publication. Questions in the meantime: <a href="tel:${STORE.tel1}">${STORE.tel1d}</a>.</div>`;
const pages = {
  "shipping-info": () => infoPage("Shipping &amp; Pickup", `<p class="psub">Two ways to get your groceries: free pickup at our Memphis store${SHIP_ON ? ", or shipping on eligible products within the United States" : ""}.</p>
    <h2>Free Store Pickup</h2><p>Order online and collect your groceries at ${STORE.addr}, ${STORE.cityLong} once your order is ready. Please wait for our message before coming to the store.</p>
    ${SHIP_ON ? `<h2>What can ship</h2><p>Sealed, shelf-stable pantry goods such as grains, millet, flours, sealed cooking oils, seasonings and shelf-stable drinks. Each product page shows whether it can ship.</p>
    <h2>What is pickup only</h2><p>${esc(CFG.shipping?.pickupOnlyNote || "")}</p>
    <h2>Shipping costs and timing</h2><p>Shipping is calculated at checkout from your address and the weight of your order. You see the cost before you place your order. Delivery areas, fees and timelines will be published here once confirmed by the store.</p>` : ""}
    <p class="note" style="margin-top:20px">${DEMO ? "Preview note: shipping rules, fees and timelines are configurable and require owner confirmation before launch." : ""}</p>`),
  faq: () => infoPage("Frequently Asked Questions", `<p class="psub">Quick answers about shopping with Juntu African Market.</p>
    ${[["Where is the store?", `Juntu African Market is at ${STORE.addr}, ${STORE.cityLong}. <a href="${STORE.map}" target="_blank" rel="noopener">Get directions</a>.`],
       ["Is store pickup free?", "Yes. Choose <i>Store pickup</i> at checkout and we’ll let you know when your order is ready to collect."],
       ["Do you ship outside Memphis?", SHIP_ON ? "Eligible shelf-stable products can be shipped within the United States. Each product page shows whether it can ship, and the cost is calculated at checkout." : "Online orders are currently available for store pickup."],
       ["Can fresh meat, frozen food or produce be shipped?", "No. Fresh meat, fish, frozen foods and produce are available for store pickup only."],
       ["What is the Juntu Signature Collection?", "Traditional ingredients packed under Juntu Market’s own label, such as red palm oil, baobab powder, thiakry, noflaye and arraw. <a href=\"#juntu-collection\">Shop the collection</a>."],
       ["I can’t find a product online.", `Our store carries more than is listed online — ${callLine()} and we’ll check for you.`],
       ["What are your store hours?", STORE.hours ? esc(STORE.hours) : `Please ${callLine()} for current store hours.`]
      ].map(([q, a]) => `<details class="acc"><summary>${q}</summary><p>${a}</p></details>`).join("")}`),
  returns: () => infoPage("Returns &amp; Refunds", `${DRAFT}<p class="psub">Juntu Market will publish its approved returns and refunds policy here before the online store opens.</p><div class="card-box"><b>Problem with an order?</b><p style="margin:6px 0 12px">Contact us with your order number and we’ll help.</p>${storeBtns()}</div>`),
  privacy: () => infoPage("Privacy Policy", `${DRAFT}<p class="psub">Juntu Market will publish its approved privacy policy here before the online store opens.</p><p>Draft summary: contact details are used only to process orders and send order updates.</p>`),
  terms: () => infoPage("Terms &amp; Conditions", `${DRAFT}<p class="psub">Juntu Market will publish its approved terms and conditions here before the online store opens.</p>`),
  contact: () => infoPage("Contact Us", `<p class="psub">We’re happy to help with orders, products and pickup.</p>
    <div class="addr">${ic("pin")}<div>Juntu African Market<span>${STORE.addr}, ${STORE.cityLong}</span></div></div>
    <div class="addr">${ic("phone")}<div>Phone<span><a href="tel:${STORE.tel1}">${STORE.tel1d}</a>${STORE.tel2 ? ` · <a href="tel:${STORE.tel2}">${STORE.tel2d}</a>` : ""}</span></div></div>
    <div class="addr">${ic("store")}<div>Store hours<span>${STORE.hours ? esc(STORE.hours) : "Please call for current store hours."}</span></div></div>${storeBtns()}<div style="height:40px"></div>`)
};
function notFound() { return infoPage("Page not found", `<p class="psub">This page isn’t available.</p><a class="btn" href="#shop">Continue shopping</a>`); }

/* ---------- router ---------- */
let route = "home";
function setLD(o) { let s = $("#ldp"); if (!s) { s = document.createElement("script"); s.type = "application/ld+json"; s.id = "ldp"; document.head.appendChild(s); } s.textContent = o ? JSON.stringify(o) : ""; }
function render() {
  let h = (location.hash || "#home").slice(1) || "home";
  if (h === "main") h = route || "home";
  const prev = route; route = h; setLD(null);
  let html, title = "Juntu Market | African & Caribbean Groceries Online | Memphis, TN";
  if (h === "home") html = pHome();
  else if (h === "shop") { html = pShop(); title = "Shop all | Juntu African Market"; }
  else if (h === "search" && !Q) { html = pShop(); }
  else if (h === "search") { html = pShop(null, true); title = `Search: ${Q} | Juntu African Market`; }
  else if (h === "juntu-collection") { html = pCollection(); title = "Juntu Signature Collection | Juntu African Market"; }
  else if (h.startsWith("shop-") && CATS.some(c => c.id === h.slice(5))) { html = pShop(h.slice(5)); title = `${catName(h.slice(5))} | Juntu African Market`; }
  else if (h.startsWith("p-")) { const p = byId(h.slice(2)); html = pProduct(h.slice(2)); if (p) title = `${p.name} | Juntu African Market`; }
  else if (h === "cart") { html = pCart(); title = "Cart | Juntu African Market"; }
  else if (h === "checkout") { html = pCheckout(); title = "Checkout | Juntu African Market"; }
  else if (h.startsWith("order-")) { html = pOrder(h.slice(6)); title = "Order confirmation | Juntu African Market"; }
  else if (h === "account") html = pAccount();
  else if (h === "track") html = pTrack();
  else if (h === "pickup") { html = pPickup(); title = "Free Store Pickup | Juntu African Market"; }
  else if (h === "visit" || h === "about") { html = pVisit(); title = "Our Memphis Market | Juntu African Market, 3826 E Shelby Dr"; }
  else if (h === "fresh-halal") html = pFresh();
  else if (pages[h]) html = pages[h]();
  else html = notFound();
  document.title = title;
  $("#main").innerHTML = html;
  renderHeader();
  if (prev !== h) {
    if (backNav && pos[h] != null) { const y = pos[h]; requestAnimationFrame(() => scrollTo(0, y)); }
    else window.scrollTo(0, 0);
    backNav = false;
    $("#main").focus({ preventScroll: true });
  }
}

/* ---------- search box ---------- */
const POPULAR = ["palm oil", "thiakry", "baobab", "garri", "fufu", "Maggi", "rice", "sea moss"];
function runSearch(v) { Q = v; qi.value = v; F = { brands: [], min: "", max: "", sort: "featured" }; sg.classList.remove("on"); qi.blur(); if (location.hash === "#search") render(); else location.hash = "search"; }
const qi = $("#q"), sg = $("#sugg");
let sIdx = -1;
function suggest() {
  const v = qi.value.trim();
  if (v.length < 2) {
    sIdx = -1;
    sg.innerHTML = `<div class="sg-h">Popular searches</div><div class="popq">${POPULAR.map(t => `<button type="button" data-act="q" data-q="${esc(t)}">${esc(t)}</button>`).join("")}</div>
      <div class="sg-h">Departments</div>${deptLive().slice(0, 4).map((d, i) => `<a href="${d.href}" role="option" id="sgd${i}"><img src="${d.img}" alt="" width="46" height="46" style="border-radius:50%;object-fit:cover"><span><span class="sn">${esc(d.name)}</span><span class="sc">${inCat(d.cat).length} products</span></span></a>`).join("")}`;
    sg.classList.add("on"); qi.setAttribute("aria-expanded", "true"); return;
  }
  const r = search(v).slice(0, 6);
  sIdx = -1;
  sg.innerHTML = r.length ? r.map((p, i) => `<a href="#p-${p.id}" role="option" id="sg${i}"><img src="${imgS(p)}" alt="" width="46" height="46"><span><span class="sn">${esc(p.name)}</span><span class="sc">${esc(catName(p.cats[0]))}${p.size ? " · " + esc(p.size) : ""}</span></span><span class="sp">${money(p.price)}</span></a>`).join("") + `<a class="all" href="#search" data-act="see-all">See all results for “${esc(v)}”</a>`
    : `<div class="none">No matches for “${esc(v)}”. Try another spelling or a local name:</div><div class="popq">${POPULAR.map(t => `<button type="button" data-act="q" data-q="${esc(t)}">${esc(t)}</button>`).join("")}</div>`;
  sg.classList.add("on"); qi.setAttribute("aria-expanded", "true");
}
qi.addEventListener("input", suggest);
qi.addEventListener("focus", suggest);
qi.addEventListener("keydown", e => {
  const a = $$("a", sg);
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (!a.length) return; e.preventDefault();
    sIdx = (sIdx + (e.key === "ArrowDown" ? 1 : -1) + a.length) % a.length;
    a.forEach((x, i) => x.classList.toggle("act", i === sIdx)); qi.setAttribute("aria-activedescendant", a[sIdx].id || "");
  } else if (e.key === "Enter" && sIdx > -1 && a[sIdx]) { e.preventDefault(); a[sIdx].click(); }
  else if (e.key === "Escape") { sg.classList.remove("on"); }
});
$("#sform").addEventListener("submit", e => {
  e.preventDefault(); const v = qi.value.trim(); if (!v) return; runSearch(v);
});
document.addEventListener("click", e => { if (!e.target.closest(".search")) sg.classList.remove("on"); });
sg.addEventListener("click", e => {
  const a = e.target.closest("a"); if (!a) return;
  if (a.dataset.act === "see-all") { e.preventDefault(); Q = qi.value.trim(); F = { brands: [], min: "", max: "", sort: "featured" }; if (location.hash === "#search") render(); else location.hash = "search"; }
  sg.classList.remove("on");
});

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const a = t.dataset.act, id = t.dataset.id;
  if (t.dataset.blocked) { e.preventDefault(); toast(conflicts().length ? "Resolve the pickup-only items first" : "Enter a ZIP code to estimate shipping"); return; }
  switch (a) {
    case "add": add(id); break;
    case "q": e.preventDefault(); runSearch(t.dataset.q); break;
    case "lb-open": lbOpen(+t.dataset.i); break;
    case "lb-close": lbClose(); break;
    case "lb-prev": lbGo(-1); break;
    case "lb-next": lbGo(1); break;
    case "tab": featTab = t.dataset.k; $$(".tabs [data-act=tab]").forEach(b => b.setAttribute("aria-selected", b.dataset.k === featTab)); $("#featgrid").innerHTML = grid(featList()); break;
    case "inc": setQty(id, qty(id) + 1); break;
    case "dec": setQty(id, qty(id) - 1); break;
    case "rm": { const p = byId(id); setQty(id, 0); if ($("#modal").classList.contains("on")) closeAll(); if (p) toast(`Removed ${p.name}`, "Undo", () => add(id, 1, true)); break; }
    case "rm-conflicts": conflicts().forEach(l => setQty(l.id, 0)); break;
    case "open-cart": openCart(); break;
    case "close": closeAll(); break;
    case "close-nav": closeAll(); break;
    case "fulfil": fulfilModal(); break;
    case "set-mode": S.mode = t.dataset.m; save(); renderHeader(); if ($("#modal").classList.contains("on")) { if (conflicts().length === 0 && $("#mbox h2")?.textContent.includes("pickup-only")) closeAll(); else fulfilModal(); } if ($("#drawer").classList.contains("on")) renderDrawer(); if (["cart", "checkout"].includes(route)) render(); break;
    case "shop-pickup": S.mode = "pickup"; save(); location.hash = "shop"; renderHeader(); toast("Store pickup selected — free at our Memphis store"); break;
    case "rate": S.rate = t.value; save(); if ($("#drawer").classList.contains("on")) renderDrawer(); if (["cart", "checkout"].includes(route)) { const y = scrollY; render(); scrollTo(0, y); } break;
    case "mega": { const m = $("#mega"); const on = !m.classList.contains("on"); m.classList.toggle("on", on); t.setAttribute("aria-expanded", on); break; }
    case "demo-info": modal(`<h2 id="mtitle">About this preview</h2><p>This is a private demonstration of the Juntu African Market online store, prepared by Dalal Technologies.</p><ul><li>Prices shown are provisional and for preview only.</li><li>Shipping amounts are illustrative estimates, not carrier quotes. Shipping rules, fees and delivery areas await the owner’s confirmation.</li><li>Checkout is simulated: no payment is taken and no card details are collected.</li><li>Stock levels are not yet connected.</li><li>Store photos are of the real Juntu African Market at 3826 E Shelby Dr.</li></ul><p>When the store launches, products, payments, taxes, shipping rates and orders run on Shopify.</p>`); break;
    case "focus-search": window.scrollTo(0, 0); qi.focus(); suggest(); break;
    case "fcat": { const v = t.value; F.brands = []; location.hash = v ? (v === "juntu" ? "juntu-collection" : "shop-" + v) : "shop"; break; }
    case "fbrand": F.brands = t.checked ? [...F.brands, t.value] : F.brands.filter(b => b !== t.value); keepFilters(); break;
    case "unbrand": F.brands = F.brands.filter(b => b !== t.dataset.b); render(); break;
    case "unprice": F.min = F.max = ""; render(); break;
    case "clear-f": F = { brands: [], min: "", max: "", sort: "featured" }; keepFilters(); break;
    case "open-f": $("#filters").classList.add("on"); break;
    case "zoom": { const r = t.getBoundingClientRect(); const img = t.querySelector("img"); img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; t.classList.toggle("z"); t.setAttribute("aria-label", t.classList.contains("z") ? "Zoom out" : "Zoom product photo"); break; }
    case "pq-": case "pq+": { const o = $("#pq"); o.textContent = Math.max(1, Math.min(99, +o.textContent + (a === "pq+" ? 1 : -1))); break; }
    case "add-n": add(id, +$("#pq").textContent); break;
    case "buy-now": { const p = byId(id); setQty(id, Math.max(qty(id), +$("#pq").textContent)); if (S.mode === "ship" && !p.ship) { pickupOnlyNotice(p); break; } co.step = 1; location.hash = "checkout"; break; }
    case "testdata": co.d = { ...TEST, zip: S.mode === "ship" ? (S.zip || TEST.zip) : TEST.zip }; if (S.mode === "ship") { S.zip = co.d.zip; save(); } render(); break;
    case "co-back": co.step = 1; render(); break;
    case "place": placeOrder(); break;
    case "reorder": { const o = S.orders.find(x => x.n === t.dataset.n); if (o) { o.items.forEach(i => byId(i.id) && setQty(i.id, qty(i.id) + i.qty)); toast("Added your previous order to the cart", "View cart", openCart); } break; }
    case "signin": modal(`<h2 id="mtitle">Customer accounts</h2><p>Sign-in opens when the store goes live on Shopify. Customers will receive a one-time code by email — no password to remember.</p><p>In this preview, your test orders are kept on this device so you can try <b>Buy again</b>.</p>`); break;
  }
});
function keepFilters() { const y = scrollY; const open = $("#filters")?.classList.contains("on"); render(); if (open) $("#filters").classList.add("on"); scrollTo(0, y); }
document.addEventListener("change", e => {
  if (e.target.dataset.act === "sort") { F.sort = e.target.value; keepFilters(); }
});
document.addEventListener("input", e => {
  if (e.target.dataset.act === "cozip") { const v = e.target.value.replace(/\D/g, "").slice(0, 5); e.target.value = v; co.d.zip = v; if (v.length === 5 && zone(v)) { S.zip = v; save(); syncForm(); const y = scrollY; render(); scrollTo(0, y); $("#co-zip")?.focus(); } }
});
function syncForm() { const f = $("#coform"); if (f) $$("input[name]", f).forEach(i => { if (!i.name.startsWith("rate") && i.name !== "pay") co.d[i.name] = i.value.trim(); }); }
document.addEventListener("submit", e => {
  const f = e.target;
  if (f.dataset.form === "zip") {
    e.preventDefault(); const v = $("input", f).value.trim(); const er = f.nextElementSibling;
    if (!zone(v)) { if (er) er.textContent = "Enter a valid 5-digit U.S. ZIP code."; $("input", f).setAttribute("aria-invalid", "true"); return; }
    S.zip = v; S.mode = "ship"; save(); renderHeader();
    if ($("#modal").classList.contains("on")) { closeAll(); toast(`Shipping to ZIP ${v}`); }
    if ($("#drawer").classList.contains("on")) renderDrawer();
    if (["cart", "checkout"].includes(route)) render();
  } else if (f.dataset.form === "price") {
    e.preventDefault(); F.min = $("#pmin").value.replace(/[^\d.]/g, ""); F.max = $("#pmax").value.replace(/[^\d.]/g, ""); keepFilters();
  } else if (f.id === "coform") {
    e.preventDefault(); syncForm();
    const d = co.d, need = ["email", "phone", "first", "last"].concat(S.mode === "ship" ? ["a1", "city", "st", "zip"] : []);
    let bad = null;
    $$(".err", f).forEach(x => { if (x.id?.startsWith("e-")) x.textContent = ""; });
    $$("input", f).forEach(i => i.removeAttribute("aria-invalid"));
    const msg = { email: "Enter a valid email address.", phone: "Enter a phone number so we can send order updates.", first: "Enter your first name.", last: "Enter your last name.", a1: "Enter your street address.", city: "Enter your city.", st: "Enter a 2-letter state code.", zip: "Enter a valid 5-digit ZIP code." };
    for (const k of need) {
      const v = d[k] || ""; let ok = !!v;
      if (k === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      if (k === "phone") ok = v.replace(/\D/g, "").length >= 10;
      if (k === "st") ok = /^[A-Za-z]{2}$/.test(v);
      if (k === "zip") ok = !!zone(v);
      if (!ok) { $("#e-" + k).textContent = msg[k]; $("#co-" + k).setAttribute("aria-invalid", "true"); bad = bad || k; }
    }
    if (bad) { $("#co-" + bad).focus(); return; }
    if (S.mode === "ship") { S.zip = d.zip; save(); if (shipCost() == null) return; }
    if (conflicts().length) return;
    co.step = 2; render(); window.scrollTo(0, 0);
  } else if (f.id === "trackform") {
    e.preventDefault(); const n = $("#tn").value.trim().toUpperCase(), em = $("#te").value.trim().toLowerCase();
    const o = S.orders.find(x => x.n === n && (x.email || "").toLowerCase() === em);
    $("#trackres").innerHTML = o ? `<div class="card-box"><b>${esc(o.n)}</b> <span class="testtag" style="margin-left:6px">Test</span><p style="margin:6px 0 0">${o.mode === "pickup" ? "Store pickup" : "Shipping to " + esc(o.to)}</p>${statusList(o)}<p class="note">${o.mode === "pickup" ? "We’ll message you as soon as the store marks your order ready." : "Tracking appears here once your package ships."}</p></div>`
      : `<p class="err">We couldn’t find an order with that number and email. Check your confirmation email, or call <a href="tel:${STORE.tel1}">${STORE.tel1d}</a>.</p>`;
  }
});
document.addEventListener("keydown", e => {
  if (!$("#lb").hidden) { if (e.key === "ArrowLeft") lbGo(-1); else if (e.key === "ArrowRight") lbGo(1); else if (e.key === "Tab") { const f = $$("#lb button"); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); } }
  if (e.key === "Escape") closeAll();
});
$("#scrim").addEventListener("click", closeAll);
document.addEventListener("mousemove", e => { const z = e.target.closest?.(".zoom.z"); if (!z) return; const r = z.getBoundingClientRect(); z.querySelector("img").style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; });
document.addEventListener("click", e => { if (!e.target.closest("#mega,[data-act=mega]")) { $("#mega").classList.remove("on"); $("[data-act=mega]")?.setAttribute("aria-expanded", "false"); } });
/* ---------- photo lightbox ---------- */
let lbI = 0, lbFrom = null;
function lbShow() { const ph = PHOTOS[lbI]; $("#lbimg").src = ph.src; $("#lbimg").alt = ph.alt; $("#lbcap").textContent = `${ph.cap} · ${lbI + 1} of ${PHOTOS.length}`; }
function lbOpen(i) { lbFrom = document.activeElement; lbI = i || 0; lbShow(); $("#lb").hidden = false; document.documentElement.classList.add("lock"); setTimeout(() => $(".lb-x").focus(), 20); }
function lbClose(silent) { const lb = $("#lb"); if (!lb || lb.hidden) return; lb.hidden = true; document.documentElement.classList.remove("lock"); if (!silent) lbFrom?.focus?.(); }
function lbGo(d) { lbI = (lbI + d + PHOTOS.length) % PHOTOS.length; lbShow(); }
$("#lb").addEventListener("click", e => { if (e.target.id === "lb" || e.target.tagName === "FIGURE") lbClose(); });
let tx = null;
$("#lb").addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
$("#lb").addEventListener("touchend", e => { if (tx == null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbGo(dx < 0 ? 1 : -1); tx = null; });

/* ---------- history: restore scroll when returning to a shopping screen ---------- */
const hist = [], pos = {};
let backNav = false;
window.addEventListener("hashchange", e => {
  const from = (new URL(e.oldURL).hash || "#home").slice(1) || "home", to = (location.hash || "#home").slice(1) || "home";
  pos[from] = scrollY;
  backNav = hist.length > 1 && hist[hist.length - 2] === to;
  if (backNav) hist.pop(); else hist.push(to);
  closeAll(); render();
});
window.addEventListener("storage", e => { if (e.key === KEY) { try { Object.assign(S, JSON.parse(e.newValue || "{}")); } catch (x) {} render(); } });
$(".skip").addEventListener("click", e => { e.preventDefault(); $("#main").focus(); $("#main").scrollIntoView(); });
$("#yr").textContent = new Date().getFullYear();
hist.push((location.hash || "#home").slice(1) || "home");
if (DEMO) $(".demo-pill").hidden = false;
/* Keep anchor jumps clear of the sticky header, and use a shorter search placeholder on phones. */
const mqS = matchMedia("(max-width:760px)");
function syncLayout() {
  document.documentElement.style.setProperty("--hdr", $("#hdr").offsetHeight + "px");
  qi.placeholder = mqS.matches ? qi.dataset.phShort : qi.dataset.phLong;
}
syncLayout(); addEventListener("resize", syncLayout);
const hdr = $("#hdr");
window.addEventListener("scroll", () => hdr.classList.toggle("sm", scrollY > 90), { passive: true });
let wide;
function syncFooter() { const w = innerWidth > 760; if (w !== wide) { wide = w; $$(".fd").forEach(d => d.open = w); } }
syncFooter(); window.addEventListener("resize", syncFooter);
$$(".fd summary").forEach(su => su.addEventListener("click", e => { if (innerWidth > 760) e.preventDefault(); }));

render();

window.__juntu = { S, ALL, get P() { return P; }, search, rates, zone, okList, rebuild, render };
}
