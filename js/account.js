/* Lis account page: simulated sign up / log in with localStorage,
   member dashboard with saved looks, orders, requests and profile. */

(function () {
  "use strict";

  const MIN_AGE = 14;
  const MAX_AGE = 110;

  const guestView = document.getElementById("guestView");
  const memberView = document.getElementById("memberView");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function money(n) {
    return "$" + Number(n).toFixed(2);
  }

  function niceDate(iso) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  /* ---------- generic live validation (errors under each field) ---------- */

  function wire(rules) {
    const touched = new Set();
    function check(id) {
      const field = document.getElementById(id);
      const msg = rules[id](field.type === "checkbox" ? field.checked : field.value);
      LisValidate.showFieldError(field, msg);
      return msg === "";
    }
    Object.keys(rules).forEach((id) => {
      const field = document.getElementById(id);
      field.addEventListener("input", () => { if (touched.has(id)) check(id); });
      field.addEventListener("change", () => { touched.add(id); check(id); });
      field.addEventListener("blur", () => {
        if (field.value !== "" || touched.has(id)) { touched.add(id); check(id); }
      });
    });
    return {
      check,
      all() {
        let first = null;
        Object.keys(rules).forEach((id) => {
          touched.add(id);
          if (!check(id) && !first) first = document.getElementById(id);
        });
        return first;
      },
      reset(form) {
        form.reset();
        touched.clear();
        Object.keys(rules).forEach((id) => LisValidate.clearField(document.getElementById(id)));
      },
      count() {
        return Object.keys(rules).filter((id) => document.getElementById(id).classList.contains("is-invalid")).length;
      }
    };
  }

  function ageOn(iso) {
    const birth = new Date(iso + "T00:00:00");
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  /* ============================================================
     GUEST: tabs (jQuery fade), sign up, log in
     ============================================================ */

  const tabs = { signup: document.getElementById("tab-signup"), login: document.getElementById("tab-login") };
  const panels = { signup: document.getElementById("signupPanel"), login: document.getElementById("loginPanel") };

  function showTab(name, focusField) {
    Object.keys(tabs).forEach((key) => {
      const active = key === name;
      tabs[key].classList.toggle("is-active", active);
      tabs[key].setAttribute("aria-selected", String(active));
      tabs[key].tabIndex = active ? 0 : -1;
    });
    const hide = name === "signup" ? panels.login : panels.signup;
    const show = panels[name];
    hide.hidden = true;
    $(show).stop(true, true).hide().prop("hidden", false).fadeIn(250);
    if (focusField) document.getElementById(name === "signup" ? "suName" : "liEmail").focus();
  }

  tabs.signup.addEventListener("click", () => showTab("signup"));
  tabs.login.addEventListener("click", () => showTab("login"));
  document.getElementById("toSignup").addEventListener("click", () => showTab("signup", true));

  // arrow keys move between tabs (WAI-ARIA tab pattern)
  $(".auth__tabs").on("keydown", ".auth__tab", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const next = this.id === "tab-signup" ? "login" : "signup";
      showTab(next);
      tabs[next].focus();
    }
  });

  // show / hide password
  $(document).on("click", "[data-toggle-pw]", function () {
    const input = document.getElementById(this.dataset.togglePw);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    this.textContent = show ? "Hide" : "Show";
    this.setAttribute("aria-pressed", String(show));
  });

  // password strength meter (calculated score 0-4)
  const pwInput = document.getElementById("suPassword");
  const meter = document.getElementById("pwMeter");
  const meterText = document.getElementById("pwMeterText");
  const STRENGTH = [
    { label: "Use 8+ characters with a capital letter, a number and a symbol.", cls: "" },
    { label: "Weak password", cls: "is-weak" },
    { label: "Fair, add more variety", cls: "is-fair" },
    { label: "Good, almost there", cls: "is-good" },
    { label: "Strong password", cls: "is-strong" }
  ];

  function strength(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.max(score, 1);
  }

  pwInput.addEventListener("input", () => {
    const s = strength(pwInput.value);
    meter.className = "meter__bar " + STRENGTH[s].cls;
    meter.style.width = (s * 25) + "%";
    meterText.textContent = STRENGTH[s].label;
  });

  const maxBirth = LisValidate.toIso(LisValidate.addDays(new Date(), 0));
  document.getElementById("suBirth").max = maxBirth;

  const signup = wire({
    suName: (v) => LisValidate.name(v),
    suEmail: (v) => {
      const msg = LisValidate.email(v);
      if (msg) return msg;
      return LisAuth.findUser(v) ? "An account with this email already exists. Log in instead." : "";
    },
    suPhone: (v) => LisValidate.phone(v),
    suBirth: (v) => {
      if (!v) return "Please enter your date of birth.";
      const age = ageOn(v);
      if (Number.isNaN(age) || age > MAX_AGE) return "Please enter a real date of birth.";
      if (age < MIN_AGE) return "Members must be at least " + MIN_AGE + " years old.";
      return "";
    },
    suWardrobe: (v) => (v ? "" : "Pick the wardrobe you love most. You can change it later."),
    suPassword: (v) => LisValidate.password(v),
    suConfirm: (v) => {
      if (!v) return "Please repeat your password.";
      return v === pwInput.value ? "" : "The two passwords do not match.";
    },
    suTerms: (checked) => (checked ? "" : "Please tick to confirm you read this.")
  });

  // re-check "repeat password" when the first password changes
  pwInput.addEventListener("input", () => {
    const confirm = document.getElementById("suConfirm");
    if (confirm.value) signup.check("suConfirm");
  });

  document.getElementById("signupForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const summary = document.getElementById("signupSummary");
    const first = signup.all();
    if (first) {
      const n = signup.count();
      summary.textContent = "Please fix " + n + " field" + (n > 1 ? "s" : "") + " to create your account.";
      summary.classList.add("is-visible");
      first.focus();
      return;
    }
    summary.classList.remove("is-visible");
    const user = LisAuth.register({
      name: document.getElementById("suName").value,
      email: document.getElementById("suEmail").value,
      phone: document.getElementById("suPhone").value,
      birth: document.getElementById("suBirth").value,
      wardrobe: document.getElementById("suWardrobe").value,
      password: pwInput.value
    });
    signup.reset(document.getElementById("signupForm"));
    meter.style.width = "0";
    meterText.textContent = STRENGTH[0].label;
    claimGuestRecords(user);
    showMember(true);
    LisSite.notify("Welcome to Lis, " + LisSite.firstName(user.name) + "! Your account is ready.");
  });

  const login = wire({
    liEmail: (v) => LisValidate.email(v),
    liPassword: (v) => (v ? "" : "Please enter your password.")
  });

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const first = login.all();
    if (first) { first.focus(); return; }
    const emailField = document.getElementById("liEmail");
    const pwField = document.getElementById("liPassword");
    const user = LisAuth.findUser(emailField.value);
    if (!user) {
      LisValidate.showFieldError(emailField, "No account uses this email. Check the spelling or create an account.");
      emailField.focus();
      return;
    }
    if (!LisAuth.checkPassword(user, pwField.value)) {
      LisValidate.showFieldError(pwField, "Wrong password. Try again.");
      pwField.select();
      return;
    }
    LisAuth.login(user.email);
    login.reset(document.getElementById("loginForm"));
    showMember(true);
    LisSite.notify("Welcome back, " + LisSite.firstName(user.name) + ".");
  });

  // orders and requests made as a guest on this device move into the new account
  function claimGuestRecords(user) {
    ["lis-orders", "lis-requests"].forEach((key) => {
      const list = LisStore.get(key, []);
      list.forEach((item) => { if (!item.user) item.user = user.email; });
      LisStore.set(key, list);
    });
  }

  /* ============================================================
     MEMBER: dashboard
     ============================================================ */

  function renderStats(user, orders, requests) {
    const spent = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const quiz = user.quizMatch ? findLook(user.quizMatch.id) : null;
    const items = [
      { value: user.saved.length, label: "Saved looks" },
      { value: orders.length, label: "Orders" },
      { value: money(spent), label: "Spent in the Studio" },
      { value: requests.length, label: "Design requests" },
      { value: user.bestScore || 0, label: "Best game score" },
      { value: quiz ? user.quizMatch.percent + "%" : "—", label: quiz ? "Quiz match: " + quiz.name : "Quiz not taken" }
    ];
    const ul = document.getElementById("stats");
    ul.innerHTML = "";
    items.forEach((s) => {
      const li = el("li", "stats__item");
      li.append(el("strong", "stats__value", String(s.value)), el("span", "stats__label", s.label));
      ul.append(li);
    });
  }

  function renderSaved(user) {
    const grid = document.getElementById("savedGrid");
    grid.innerHTML = "";
    const looks = user.saved.map(findLook).filter(Boolean);
    document.getElementById("savedEmpty").hidden = looks.length > 0;
    looks.forEach((look) => {
      const col = el("div", "col");
      const card = el("article", "saved-card");
      const fig = el("figure", "arch arch--" + look.wardrobe);
      const img = el("img");
      img.src = look.image;
      img.alt = look.alt;
      img.width = 220;
      img.height = 510;
      fig.append(img);
      const body = el("div", "saved-card__body");
      body.append(
        el("p", "look__decade", look.era),
        el("h3", "saved-card__title", look.name),
        el("p", "saved-card__meta", WARDROBE_LABELS[look.wardrobe] + " · " + look.signature)
      );
      const remove = el("button", "btn btn-lis-outline btn-sm", "Remove");
      remove.type = "button";
      remove.dataset.unsave = look.id;
      remove.setAttribute("aria-label", "Remove " + look.name + " from saved looks");
      body.append(remove);
      card.append(fig, body);
      col.append(card);
      grid.append(col);
    });
  }

  document.getElementById("savedGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-unsave]");
    if (!btn) return;
    const look = findLook(btn.dataset.unsave);
    // jQuery: fade the card out, then re-render
    $(btn).closest(".col").fadeOut(250, () => {
      LisAuth.toggleSavedLook(look.id);
      renderMember();
      LisSite.notify(look.name + " removed from your board.");
      const next = document.querySelector("[data-unsave]");
      (next || document.querySelector("#savedEmpty a")).focus();
    });
  });

  function renderRecords(listId, emptyId, countId, records, build) {
    const list = document.getElementById(listId);
    list.innerHTML = "";
    records.forEach((r) => list.append(build(r)));
    document.getElementById(emptyId).hidden = records.length > 0;
    document.getElementById(countId).textContent = records.length;
  }

  function orderItem(o) {
    const li = el("li", "record");
    const head = el("div", "record__head");
    head.append(el("span", "record__code", o.code), el("span", "record__total", money(o.total)));
    const items = o.items.map((i) => i.name + (i.qty > 1 ? " ×" + i.qty : "")).join(", ");
    li.append(head, el("p", "record__text", items), el("p", "record__meta", niceDate(o.date) + " · " + o.city));
    return li;
  }

  function requestItem(r) {
    const li = el("li", "record");
    const head = el("div", "record__head");
    head.append(el("span", "record__code", r.code), el("span", "record__total", "est. $" + r.estimate));
    li.append(
      head,
      el("p", "record__text", r.garment + " by " + r.designer + ", size " + r.size),
      el("p", "record__meta", "Sent " + niceDate(r.date) + " · needed by " + niceDate(r.deadline + "T00:00:00") + " · " + r.photos.length + " photo" + (r.photos.length === 1 ? "" : "s"))
    );
    return li;
  }

  function renderMember() {
    const user = LisAuth.currentUser();
    if (!user) return;
    const orders = LisStore.get("lis-orders", []).filter((o) => o.user === user.email);
    const requests = LisStore.get("lis-requests", []).filter((r) => r.user === user.email);

    document.getElementById("memberName").textContent = LisSite.firstName(user.name);
    document.getElementById("memberSince").textContent = "Member since " + niceDate(user.created);
    document.getElementById("memberLead").textContent = "Your favourite wardrobe is " + WARDROBE_LABELS[user.wardrobe] + ". Here is everything you have saved, ordered and played.";

    renderStats(user, orders, requests);
    renderSaved(user);
    renderRecords("ordersList", "ordersEmpty", "ordersCount", orders, orderItem);
    renderRecords("requestsList", "requestsEmpty", "requestsCount", requests, requestItem);

    document.getElementById("pfName").value = user.name;
    document.getElementById("pfEmail").value = user.email;
    document.getElementById("pfPhone").value = user.phone;
    document.getElementById("pfWardrobe").value = user.wardrobe;
  }

  const profile = wire({
    pfName: (v) => LisValidate.name(v),
    pfPhone: (v) => LisValidate.phone(v),
    pfWardrobe: (v) => (v ? "" : "Please choose a wardrobe.")
  });

  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const saved = document.getElementById("profileSaved");
    saved.textContent = "";
    const first = profile.all();
    if (first) { first.focus(); return; }
    LisAuth.update({
      name: document.getElementById("pfName").value.trim(),
      phone: document.getElementById("pfPhone").value.trim(),
      wardrobe: document.getElementById("pfWardrobe").value
    });
    renderMember();
    LisSite.updateAccountLink();
    ["pfName", "pfPhone", "pfWardrobe"].forEach((id) => LisValidate.clearField(document.getElementById(id)));
    saved.textContent = "Saved. Your details are up to date.";
    $(saved).stop(true, true).hide().fadeIn(300);
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    const user = LisAuth.currentUser();
    LisAuth.logout();
    showGuest();
    LisSite.updateAccountLink();
    LisSite.notify("You are logged out. See you soon" + (user ? ", " + LisSite.firstName(user.name) : "") + ".");
  });

  /* ---------- switch views ---------- */

  function showMember(animate) {
    guestView.hidden = true;
    renderMember();
    LisSite.updateAccountLink();
    if (animate) {
      $(memberView).hide().prop("hidden", false).fadeIn(350);
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("memberName").closest("h1").setAttribute("tabindex", "-1");
      document.getElementById("memberName").closest("h1").focus();
    } else {
      memberView.hidden = false;
    }
  }

  function showGuest() {
    memberView.hidden = true;
    $(guestView).hide().prop("hidden", false).fadeIn(300);
    showTab(location.hash === "#signup" ? "signup" : "login");
  }

  if (LisAuth.currentUser()) {
    showMember(false);
  } else {
    guestView.hidden = false;
    showTab(location.hash === "#login" ? "login" : "signup");
  }
})();
