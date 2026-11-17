/* Lis Studio page: shop, bag, checkout, designer commission.
   Data comes from js/studio-data.js, validation from js/validate.js.
   Plain DOM for rendering, jQuery for the effects. */

(function () {
  "use strict";

  const BAG_KEY = "lis-bag";
  const ORDERS_KEY = "lis-orders";
  const REQUESTS_KEY = "lis-requests";
  const LOOK_DISCOUNT_MIN = 3;
  const LOOK_DISCOUNT_RATE = 0.1;
  const RUSH_DAYS = 30;
  const RUSH_RATE = 1.25;
  const MIN_DAYS = 14;
  const MAX_PHOTOS = 3;
  const MAX_PHOTO_MB = 5;
  const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  /* ---------- helpers ---------- */

  function money(n) {
    return "$" + (Number.isInteger(n) ? n : n.toFixed(2));
  }

  function wardrobeLabel(id) {
    const w = WARDROBES.find((item) => item.id === id);
    return w ? w.label : id;
  }

  function findPiece(id) {
    return PIECES.find((p) => p.id === id);
  }

  function findDesigner(id) {
    return DESIGNERS.find((d) => d.id === id);
  }

  function makeCode(prefix) {
    let code = prefix + "-";
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return code;
  }

  // localStorage can throw in private mode; the page still works without it
  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage unavailable */ }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  /* ---------- jQuery banner + smooth scroll live in site.js ---------- */

  const notify = LisSite.notify;
  const smoothScrollTo = LisSite.scrollTo;
  const member = LisAuth.currentUser();

  // logged-in members get their details filled in
  function prefill() {
    if (!member) return;
    [["coName", member.name], ["coEmail", member.email], ["coPhone", member.phone],
     ["rqName", member.name], ["rqEmail", member.email], ["rqPhone", member.phone]].forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field && !field.value) field.value = value || "";
    });
  }

  /* ============================================================
     1. SHOP: filter, search, sort, render
     ============================================================ */

  const filters = { wardrobe: "all", query: "", sort: "featured" };
  const grid = document.getElementById("pieceGrid");
  const emptyBox = document.getElementById("shopEmpty");
  const countEl = document.getElementById("shopCount");
  const searchInput = document.getElementById("shopSearch");
  const sortSelect = document.getElementById("shopSort");
  let bag = load(BAG_KEY, []).filter((line) => findPiece(line.id));

  function renderWardrobeFilter() {
    const box = document.getElementById("wardrobeFilter");
    box.innerHTML = "";
    const options = [{ id: "all", label: "All" }].concat(WARDROBES);
    options.forEach((w) => {
      const count = w.id === "all" ? PIECES.length : PIECES.filter((p) => p.wardrobe === w.id).length;
      const input = el("input", "btn-check");
      input.type = "radio";
      input.name = "wardrobe";
      input.id = "wf-" + w.id;
      input.value = w.id;
      input.checked = filters.wardrobe === w.id;
      const label = el("label", "btn btn-lis-outline btn-sm", w.label + " (" + count + ")");
      label.htmlFor = input.id;
      box.append(input, label);
    });
  }

  function getVisiblePieces() {
    const q = filters.query.trim().toLowerCase();
    let list = PIECES.filter((p) => {
      const inWardrobe = filters.wardrobe === "all" || p.wardrobe === filters.wardrobe;
      const haystack = (p.name + " " + p.era + " " + p.tags + " " + wardrobeLabel(p.wardrobe)).toLowerCase();
      return inWardrobe && (q === "" || haystack.includes(q));
    });

    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "decade-asc": (a, b) => a.decade - b.decade,
      "decade-desc": (a, b) => b.decade - a.decade
    };
    if (sorters[filters.sort]) list = list.slice().sort(sorters[filters.sort]);
    return list;
  }

  function qtyInBag(id) {
    const line = bag.find((l) => l.id === id);
    return line ? line.qty : 0;
  }

  function buildPieceCard(piece) {
    const col = el("div", "col");
    const card = el("article", "piece piece--" + piece.wardrobe);

    const storyBtn = el("button", "piece__media");
    storyBtn.type = "button";
    storyBtn.dataset.story = piece.id;
    storyBtn.setAttribute("aria-label", "Read the story of the " + piece.name);
    const fig = el("figure", "arch arch--" + piece.wardrobe);
    const img = el("img");
    img.src = piece.image;
    img.alt = piece.alt;
    img.width = 220;
    img.height = 510;
    img.loading = "lazy";
    fig.append(img);
    storyBtn.append(fig, el("span", "piece__story-tag", "Read the story"));

    const body = el("div", "piece__body");
    const meta = el("p", "piece__meta");
    meta.append(el("span", "look__decade", piece.era), el("span", "tag tag--" + (piece.wardrobe === "kazakh" ? "qazaqstan" : piece.wardrobe), wardrobeLabel(piece.wardrobe)));
    const title = el("h3", "piece__title", piece.name);
    const foot = el("div", "piece__foot");
    const price = el("p", "piece__price", money(piece.price));
    const add = el("button", "btn btn-lis btn-sm piece__add");
    add.type = "button";
    add.dataset.add = piece.id;
    const inBag = qtyInBag(piece.id);
    add.textContent = inBag ? "Add another (" + inBag + ")" : "Add to bag";
    add.setAttribute("aria-label", "Add " + piece.name + " to bag");
    foot.append(price, add);
    body.append(meta, title, foot);

    card.append(storyBtn, body);
    col.append(card);
    return col;
  }

  function renderPieces() {
    const list = getVisiblePieces();
    grid.innerHTML = "";

    if (list.length === 0) {
      const where = filters.wardrobe === "all" ? "any wardrobe" : "the " + wardrobeLabel(filters.wardrobe) + " wardrobe";
      document.getElementById("shopEmptyText").textContent = filters.query
        ? "No piece in " + where + " matches “" + filters.query.trim() + "”. Try another word, like velvet or 1960s."
        : "There are no pieces in " + where + " right now.";
      emptyBox.hidden = false;
      countEl.textContent = "0 of " + PIECES.length + " pieces";
      return;
    }

    emptyBox.hidden = true;
    const frag = document.createDocumentFragment();
    list.forEach((piece) => frag.append(buildPieceCard(piece)));
    grid.append(frag);
    countEl.textContent = "Showing " + list.length + " of " + PIECES.length + " pieces";

    // jQuery: gentle staggered fade-in of the new cards
    $(grid).children().each(function (i) {
      $(this).stop(true).css("opacity", 0).delay(i * 40).animate({ opacity: 1 }, 220);
    });
  }

  $("#wardrobeFilter").on("change", "input", function () {
    filters.wardrobe = this.value;
    renderPieces();
  });

  searchInput.addEventListener("input", () => {
    filters.query = searchInput.value;
    renderPieces();
  });

  sortSelect.addEventListener("change", () => {
    filters.sort = sortSelect.value;
    renderPieces();
  });

  document.getElementById("shopReset").addEventListener("click", () => {
    filters.wardrobe = "all";
    filters.query = "";
    searchInput.value = "";
    renderWardrobeFilter();
    renderPieces();
    searchInput.focus();
  });

  grid.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add]");
    if (addBtn) {
      addToBag(addBtn.dataset.add);
      return;
    }
    const storyBtn = event.target.closest("[data-story]");
    if (storyBtn) openLightbox(storyBtn.dataset.story, storyBtn);
  });

  /* ============================================================
     2. BAG: add, change quantity, totals
     ============================================================ */

  const bagList = document.getElementById("bagList");
  const checkoutToggle = document.getElementById("checkoutToggle");
  const checkoutForm = document.getElementById("checkout");
  const citySelect = document.getElementById("coCity");

  function addToBag(id) {
    const piece = findPiece(id);
    const line = bag.find((l) => l.id === id);
    if (line) {
      line.qty += 1;
    } else {
      bag.push({ id: id, qty: 1 });
    }
    save(BAG_KEY, bag);
    renderBag();
    renderPieces();
    notify(piece.name + " added to your bag.");
    // keep focus on the same button after re-render (keyboard users)
    const again = grid.querySelector('[data-add="' + id + '"]');
    if (again) again.focus();
  }

  function changeQty(id, delta) {
    const line = bag.find((l) => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) bag = bag.filter((l) => l.id !== id);
    save(BAG_KEY, bag);
    renderBag();
    renderPieces();
  }

  function bagTotals() {
    let count = 0;
    let subtotal = 0;
    for (const line of bag) {
      const piece = findPiece(line.id);
      count += line.qty;
      subtotal += piece.price * line.qty;
    }
    const discount = count >= LOOK_DISCOUNT_MIN ? subtotal * LOOK_DISCOUNT_RATE : 0;
    const option = citySelect.options[citySelect.selectedIndex];
    const delivery = count > 0 && option && option.dataset.fee ? Number(option.dataset.fee) : 0;
    return { count, subtotal, discount, delivery, total: subtotal - discount + delivery };
  }

  function renderBag() {
    bagList.innerHTML = "";
    bag.forEach((line) => {
      const piece = findPiece(line.id);
      const li = el("li", "bag__item");
      const info = el("div", "bag__info");
      info.append(el("span", "bag__name", piece.name), el("span", "bag__price", money(piece.price * line.qty)));
      const qty = el("div", "qty");
      qty.setAttribute("role", "group");
      qty.setAttribute("aria-label", "Quantity of " + piece.name);
      const minus = el("button", "qty__btn", "−");
      minus.type = "button";
      minus.dataset.qty = "-1";
      minus.dataset.id = piece.id;
      minus.setAttribute("aria-label", line.qty === 1 ? "Remove " + piece.name : "One less " + piece.name);
      const plus = el("button", "qty__btn", "+");
      plus.type = "button";
      plus.dataset.qty = "1";
      plus.dataset.id = piece.id;
      plus.setAttribute("aria-label", "One more " + piece.name);
      qty.append(minus, el("span", "qty__num", String(line.qty)), plus);
      li.append(info, qty);
      bagList.append(li);
    });

    const t = bagTotals();
    document.getElementById("bagCount").textContent = t.count;
    document.getElementById("bagSubtotal").textContent = money(t.subtotal);
    document.getElementById("bagDiscount").textContent = "−" + money(t.discount);
    document.getElementById("bagDelivery").textContent = citySelect.value ? money(t.delivery) : "Choose a city";
    document.getElementById("bagTotal").textContent = money(t.total);
    document.getElementById("bagEmpty").hidden = t.count > 0;
    document.getElementById("bagSums").hidden = t.count === 0;

    const hint = document.getElementById("bagHint");
    if (t.count > 0 && t.count < LOOK_DISCOUNT_MIN) {
      const more = LOOK_DISCOUNT_MIN - t.count;
      hint.textContent = "Add " + more + " more piece" + (more > 1 ? "s" : "") + " to get 10% off the whole bag.";
    } else if (t.count >= LOOK_DISCOUNT_MIN) {
      hint.textContent = "A full look! You save " + money(t.discount) + ".";
    } else {
      hint.textContent = "";
    }

    document.getElementById("bagFab").hidden = t.count === 0;
    document.getElementById("bagFabCount").textContent = t.count;
    document.getElementById("bagFabTotal").textContent = money(t.total);

    checkoutToggle.disabled = t.count === 0;
    if (t.count === 0 && $(checkoutForm).is(":visible")) toggleCheckout(false);
  }

  bagList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-qty]");
    if (btn) changeQty(btn.dataset.id, Number(btn.dataset.qty));
  });

  /* ---------- checkout (jQuery slide panel + validation) ---------- */

  function toggleCheckout(open) {
    const $form = $(checkoutForm);
    const willOpen = typeof open === "boolean" ? open : !$form.is(":visible");
    checkoutToggle.setAttribute("aria-expanded", String(willOpen));
    checkoutToggle.textContent = willOpen ? "Hide delivery details" : "Place imagined order";
    if (willOpen) {
      $form.stop(true, true).slideDown(300, () => document.getElementById("coName").focus());
    } else {
      $form.stop(true, true).slideUp(250);
    }
  }

  checkoutToggle.addEventListener("click", () => toggleCheckout());
  citySelect.addEventListener("change", renderBag);

  const checkoutRules = {
    coName: (v) => LisValidate.name(v),
    coEmail: (v) => LisValidate.email(v),
    coPhone: (v) => LisValidate.phone(v),
    coCity: (v) => (v === "" ? "Please choose where we should deliver." : ""),
    coAddress: (v) => (citySelect.value === "almaty" && v.trim() === "" ? "" : LisValidate.minLength(v, 5, "Street address"))
  };

  wireLiveValidation(checkoutForm, checkoutRules);

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const firstBad = validateAll(checkoutRules);
    if (firstBad) {
      firstBad.focus();
      return;
    }
    const t = bagTotals();
    const order = {
      code: makeCode("LIS"),
      date: new Date().toISOString(),
      user: member ? member.email : null,
      name: document.getElementById("coName").value.trim(),
      city: citySelect.options[citySelect.selectedIndex].text,
      items: bag.map((l) => ({ id: l.id, name: findPiece(l.id).name, qty: l.qty })),
      total: t.total
    };
    const orders = load(ORDERS_KEY, []);
    orders.unshift(order);
    save(ORDERS_KEY, orders);

    showResult("orderResult", "Order placed", order.code, [
      "Thank you, " + order.name.split(" ")[0] + ".",
      order.items.length + " line" + (order.items.length > 1 ? "s" : "") + ", total " + money(order.total) + ", to " + order.city + "."
    ]);

    bag = [];
    save(BAG_KEY, bag);
    resetForm(checkoutForm, checkoutRules);
    toggleCheckout(false);
    renderBag();
    renderPieces();
    prefill();
    if (member) {
      notify("Order " + order.code + " is saved to your account.", { href: "account.html", text: "View orders" }, "Order confirmed");
    } else {
      notify("Order " + order.code + " is placed. Create an account to keep track of it.", { href: "account.html", text: "Sign up" }, "Order confirmed");
    }
  });

  /* ============================================================
     3. COMMISSION: designers, photos, estimate, validation
     ============================================================ */

  const requestForm = document.getElementById("requestForm");
  const designerGrid = document.getElementById("designerGrid");
  const garmentSelect = document.getElementById("rqGarment");
  const sizeSelect = document.getElementById("rqSize");
  const deadlineInput = document.getElementById("rqDeadline");
  const photoInput = document.getElementById("rqPhotos");
  const notesInput = document.getElementById("rqNotes");
  const measureWrap = document.getElementById("measureWrap");
  const budgetInput = document.getElementById("rqBudget");
  let designerFilter = "all";
  let selectedDesigner = "";
  let photos = []; // { file, url }

  deadlineInput.min = LisValidate.toIso(LisValidate.addDays(new Date(), MIN_DAYS));
  deadlineInput.max = LisValidate.toIso(LisValidate.addDays(new Date(), 365));

  GARMENTS.forEach((g, i) => {
    if (i === 0) garmentSelect.append(new Option("Choose a garment", ""));
    garmentSelect.append(new Option(g.label + " (from $" + g.base + ")", g.id));
  });

  function renderDesignerFilter() {
    const box = document.getElementById("designerFilter");
    box.innerHTML = "";
    [{ id: "all", label: "All designers" }].concat(WARDROBES).forEach((w) => {
      const b = el("button", "btn btn-lis-outline btn-sm" + (designerFilter === w.id ? " is-active" : ""), w.label);
      b.type = "button";
      b.dataset.filter = w.id;
      b.setAttribute("aria-pressed", String(designerFilter === w.id));
      box.append(b);
    });
  }

  function renderDesigners() {
    designerGrid.innerHTML = "";
    const list = DESIGNERS.filter((d) => designerFilter === "all" || d.wardrobe === designerFilter);
    list.forEach((d) => {
      const col = el("div", "col");
      const label = el("label", "designer designer--" + d.wardrobe);
      const input = el("input", "designer__input");
      input.type = "radio";
      input.name = "designer";
      input.value = d.id;
      input.checked = selectedDesigner === d.id;
      const card = el("span", "designer__card");
      const initials = d.name.split(" ").map((p) => p[0]).join("");
      const mono = el("span", "designer__mono arch arch--" + d.wardrobe, initials);
      mono.setAttribute("aria-hidden", "true");
      const text = el("span", "designer__text");
      text.append(
        el("span", "designer__name", d.name),
        el("span", "designer__spec", d.speciality),
        el("span", "designer__meta", wardrobeLabel(d.wardrobe) + " · " + d.era + " · fee $" + d.fee)
      );
      card.append(mono, text, el("span", "designer__check", "✓"));
      label.append(input, card);
      col.append(label);
      designerGrid.append(col);
    });
    $(designerGrid).children().hide().fadeIn(200);
  }

  $("#designerFilter").on("click", "button", function () {
    designerFilter = this.dataset.filter;
    renderDesignerFilter();
    renderDesigners();
  });

  designerGrid.addEventListener("change", (event) => {
    if (event.target.name !== "designer") return;
    selectedDesigner = event.target.value;
    document.getElementById("designer-error").textContent = "";
    designerGrid.classList.remove("is-invalid");
    updateEstimate();
    if (touched.has("rqBudget")) validateField("rqBudget", requestRules);
  });

  /* ---------- reference photos (upload idea) ---------- */

  function addPhotos(fileList) {
    const errorEl = document.getElementById("rqPhotos-error");
    const problems = [];
    Array.from(fileList).forEach((file) => {
      if (photos.length >= MAX_PHOTOS) {
        problems.push("Only " + MAX_PHOTOS + " photos fit in one request.");
      } else if (!PHOTO_TYPES.includes(file.type)) {
        problems.push("“" + file.name + "” is not a JPG, PNG or WEBP image.");
      } else if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
        problems.push("“" + file.name + "” is larger than " + MAX_PHOTO_MB + " MB.");
      } else {
        photos.push({ file: file, url: URL.createObjectURL(file) });
      }
    });
    photoInput.value = "";
    renderThumbs();
    touched.add("rqPhotos");
    // unique messages only
    const msg = Array.from(new Set(problems)).join(" ");
    if (msg) {
      errorEl.textContent = msg;
      photoInput.classList.add("is-invalid");
      document.getElementById("dropzone").classList.add("is-invalid");
    } else {
      validateField("rqPhotos", requestRules);
    }
    updateEstimate();
  }

  function renderThumbs() {
    const list = document.getElementById("thumbs");
    list.innerHTML = "";
    photos.forEach((p, i) => {
      const li = el("li", "thumbs__item");
      const img = el("img");
      img.src = p.url;
      img.alt = "Reference photo " + (i + 1) + ": " + p.file.name;
      const remove = el("button", "thumbs__remove", "×");
      remove.type = "button";
      remove.dataset.remove = String(i);
      remove.setAttribute("aria-label", "Remove " + p.file.name);
      li.append(img, remove);
      list.append(li);
    });
    $(list).children().last().hide().fadeIn(200);
  }

  photoInput.addEventListener("change", () => addPhotos(photoInput.files));

  document.getElementById("thumbs").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-remove]");
    if (!btn) return;
    const i = Number(btn.dataset.remove);
    URL.revokeObjectURL(photos[i].url);
    photos.splice(i, 1);
    renderThumbs();
    validateField("rqPhotos", requestRules);
    updateEstimate();
    photoInput.focus();
  });

  const dropzone = document.getElementById("dropzone");
  ["dragenter", "dragover"].forEach((type) => dropzone.addEventListener(type, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-over");
  }));
  ["dragleave", "drop"].forEach((type) => dropzone.addEventListener(type, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-over");
  }));
  dropzone.addEventListener("drop", (e) => addPhotos(e.dataTransfer.files));

  /* ---------- size and notes ---------- */

  sizeSelect.addEventListener("change", () => {
    const custom = sizeSelect.value === "custom";
    if (custom) {
      $(measureWrap).hide().prop("hidden", false).slideDown(250);
    } else {
      $(measureWrap).slideUp(200, () => { measureWrap.hidden = true; });
      ["rqBust", "rqWaist", "rqHip"].forEach((id) => LisValidate.clearField(document.getElementById(id)));
    }
    updateEstimate();
  });

  notesInput.addEventListener("input", () => {
    document.getElementById("rqNotes-count").textContent = notesInput.value.length + " / 500";
  });

  /* ---------- estimate (calculated value) ---------- */

  function estimate() {
    const designer = findDesigner(selectedDesigner);
    const garment = GARMENTS.find((g) => g.id === garmentSelect.value);
    const days = deadlineInput.value ? LisValidate.daysFromToday(deadlineInput.value) : null;
    const rush = days !== null && days >= MIN_DAYS && days < RUSH_DAYS;
    let total = (designer ? designer.fee : 0) + (garment ? garment.base : 0);
    if (rush) total = Math.round(total * RUSH_RATE);
    return { designer, garment, rush, total };
  }

  function updateEstimate() {
    const e = estimate();
    document.getElementById("esDesigner").textContent = e.designer ? e.designer.name : "Not chosen";
    document.getElementById("esGarment").textContent = e.garment ? e.garment.label : "Not chosen";
    document.getElementById("esSize").textContent = sizeSelect.value === "custom" ? "Custom" : (sizeSelect.value || "—");
    document.getElementById("esPhotos").textContent = photos.length + " of " + MAX_PHOTOS;
    document.getElementById("esRush").textContent = e.rush ? "Yes, +25%" : "No";
    document.getElementById("esTotal").textContent = "$" + e.total;
    budgetInput.min = e.total;
  }

  [garmentSelect, deadlineInput].forEach((f) => f.addEventListener("change", () => {
    updateEstimate();
    if (touched.has("rqBudget")) validateField("rqBudget", requestRules);
  }));

  /* ---------- validation rules ---------- */

  const isCustom = () => sizeSelect.value === "custom";

  const requestRules = {
    rqName: (v) => LisValidate.name(v),
    rqEmail: (v) => LisValidate.email(v),
    rqPhone: (v) => LisValidate.phone(v),
    rqDeadline: (v) => LisValidate.dateWindow(v, MIN_DAYS, 365, "a date"),
    rqGarment: (v) => (v === "" ? "Please choose what we should make." : ""),
    rqSize: (v) => (v === "" ? "Please choose a size, or enter custom measurements." : ""),
    rqBust: (v) => (isCustom() ? LisValidate.numberInRange(v, 60, 160, "Bust") : ""),
    rqWaist: (v) => (isCustom() ? LisValidate.numberInRange(v, 45, 150, "Waist") : ""),
    rqHip: (v) => (isCustom() ? LisValidate.numberInRange(v, 60, 170, "Hip") : ""),
    rqBudget: (v) => {
      const need = estimate().total;
      if (String(v).trim() === "") return "Please tell us your budget.";
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return "Budget must be a positive number.";
      if (need > 0 && n < need) return "Your estimate is $" + need + ". Raise the budget or pick another designer or garment.";
      if (n > 10000) return "For budgets over $10,000 please book a session instead.";
      return "";
    },
    rqPhotos: () => {
      if (photos.length === 0) return "Add at least one reference photo so your designer can see the idea.";
      return "";
    },
    rqNotes: (v) => LisValidate.minLength(v, 20, "Your description"),
    rqConsent: () => (document.getElementById("rqConsent").checked ? "" : "Please confirm you have read how the sketch works.")
  };

  const touched = new Set();

  function validateField(id, rules) {
    const field = document.getElementById(id);
    const message = rules[id](field.type === "checkbox" ? field.checked : field.value);
    LisValidate.showFieldError(field, message);
    if (id === "rqPhotos") dropzone.classList.toggle("is-invalid", message !== "");
    return message === "";
  }

  // returns the first invalid element, or null when the form is valid
  function validateAll(rules) {
    let first = null;
    Object.keys(rules).forEach((id) => {
      touched.add(id);
      const ok = validateField(id, rules);
      if (!ok && !first) first = document.getElementById(id);
    });
    return first;
  }

  function wireLiveValidation(form, rules) {
    Object.keys(rules).forEach((id) => {
      const field = document.getElementById(id);
      if (id === "rqPhotos") return; // handled by addPhotos
      const run = () => { if (touched.has(id)) validateField(id, rules); };
      field.addEventListener("input", run);
      field.addEventListener("change", () => { touched.add(id); validateField(id, rules); });
      field.addEventListener("blur", () => {
        if (field.value !== "" || touched.has(id)) {
          touched.add(id);
          validateField(id, rules);
        }
      });
    });
  }

  function resetForm(form, rules) {
    form.reset();
    Object.keys(rules).forEach((id) => {
      touched.delete(id);
      LisValidate.clearField(document.getElementById(id));
    });
  }

  wireLiveValidation(requestForm, requestRules);

  function showResult(targetId, title, code, lines) {
    const box = document.getElementById(targetId);
    box.innerHTML = "";
    const ticket = el("div", "ticket ticket--success");
    ticket.append(el("h3", "ticket__title", title), el("p", "ticket__code", code));
    lines.forEach((line) => ticket.append(el("p", "mb-1", line)));
    box.append(ticket);
    $(ticket).hide().fadeIn(400);
  }

  requestForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const summary = document.getElementById("requestSummary");
    let first = validateAll(requestRules);

    if (!selectedDesigner) {
      document.getElementById("designer-error").textContent = "Please choose the designer who will draw your piece.";
      designerGrid.classList.add("is-invalid");
      if (!first) first = designerGrid.querySelector("input") || designerGrid;
    }

    const errorCount = Object.keys(requestRules)
      .filter((id) => document.getElementById(id).classList.contains("is-invalid")).length
      + (selectedDesigner ? 0 : 1);
    if (first) {
      summary.textContent = "Almost there: please fix " + errorCount + " highlighted field" + (errorCount > 1 ? "s" : "") + ".";
      summary.classList.add("is-visible");
      first.focus();
      return;
    }
    summary.classList.remove("is-visible");

    const e = estimate();
    const request = {
      code: makeCode("ATL"),
      date: new Date().toISOString(),
      user: member ? member.email : null,
      name: document.getElementById("rqName").value.trim(),
      designer: e.designer.name,
      garment: e.garment.label,
      size: isCustom()
        ? "Custom " + ["rqBust", "rqWaist", "rqHip"].map((id) => document.getElementById(id).value).join("/") + " cm"
        : sizeSelect.value,
      deadline: deadlineInput.value,
      photos: photos.map((p) => p.file.name),
      notes: notesInput.value.trim(),
      estimate: e.total
    };
    const requests = load(REQUESTS_KEY, []);
    requests.unshift(request);
    save(REQUESTS_KEY, requests);

    showResult("requestResult", "Request sent", request.code, [
      request.designer + " will send a first sketch of your " + request.garment.toLowerCase() + " within five days.",
      "Estimate $" + request.estimate + ", needed by " + new Date(request.deadline + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" }) + "."
    ]);

    // clear everything
    resetForm(requestForm, requestRules);
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    photos = [];
    selectedDesigner = "";
    renderThumbs();
    renderDesigners();
    dropzone.classList.remove("is-invalid");
    measureWrap.hidden = true;
    document.getElementById("rqNotes-count").textContent = "0 / 500";
    updateEstimate();
    prefill();
    notify("Request " + request.code + " is with " + request.designer + ".", member ? { href: "account.html", text: "See it in your account" } : null, "Design request sent");
    smoothScrollTo("#requestResult");
  });

  /* ============================================================
     4. jQuery lightbox: the story behind a piece
     ============================================================ */

  const $lightbox = $("#lightbox");
  let lightboxReturn = null;
  let lightboxPiece = null;

  function openLightbox(id, trigger) {
    const p = findPiece(id);
    lightboxPiece = p;
    lightboxReturn = trigger;
    $("#lbImg").attr({ src: p.image, alt: p.alt });
    $("#lbArch").attr("class", "arch arch--" + p.wardrobe);
    $("#lbEra").text(p.era + " · " + wardrobeLabel(p.wardrobe));
    $("#lbTitle").text(p.name);
    $("#lbStory").text(p.story);
    $("#lbPrice").text(money(p.price));
    $lightbox.prop("hidden", false).stop(true, true).hide().fadeIn(250);
    $("body").addClass("no-scroll");
    $("#lbClose").trigger("focus");
  }

  function closeLightbox() {
    $lightbox.stop(true, true).fadeOut(200, () => $lightbox.prop("hidden", true));
    $("body").removeClass("no-scroll");
    if (lightboxReturn && document.body.contains(lightboxReturn)) lightboxReturn.focus();
  }

  $("#lbClose").on("click", closeLightbox);
  $lightbox.on("click", (e) => { if (e.target === $lightbox[0]) closeLightbox(); });
  $("#lbAdd").on("click", () => {
    addToBag(lightboxPiece.id);
    lightboxReturn = grid.querySelector('[data-add="' + lightboxPiece.id + '"]');
    closeLightbox();
  });

  $(document).on("keydown", (e) => {
    if ($lightbox.is(":hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "Tab") {
      // keep keyboard focus inside the dialog
      const focusables = $lightbox.find("button").toArray();
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ============================================================
     5. jQuery accordion (FAQ)
     ============================================================ */

  $(".lis-faq__q button").on("click", function () {
    const $btn = $(this);
    const open = $btn.attr("aria-expanded") === "true";
    $btn.attr("aria-expanded", String(!open)).closest(".lis-faq__item").toggleClass("is-open", !open);
    $("#" + $btn.attr("aria-controls")).stop(true, true).slideToggle(250);
  });

  /* ---------- start ---------- */

  document.getElementById("factPieces").textContent = PIECES.length;
  document.getElementById("factDesigners").textContent = DESIGNERS.length;
  renderWardrobeFilter();
  renderPieces();
  renderBag();
  renderDesignerFilter();
  renderDesigners();
  updateEstimate();
  prefill();
})();
