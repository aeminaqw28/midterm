/* Lis lookbook: data-driven fashion timeline.
   Renders LOOKS (js/looks-data.js) with filter, sort, save and "read more". */

(function () {
  "use strict";

  const PERIODS = {
    all: () => true,
    early: (l) => l.decade >= 1910 && l.decade < 1960,
    swinging: (l) => l.decade >= 1960 && l.decade < 1980,
    late: (l) => l.decade >= 1980 && l.decade < 2000,
    heritage: (l) => l.wardrobe === "kazakh"
  };

  const state = { wardrobe: "all", period: "all", sort: "asc", savedOnly: false };
  const list = document.getElementById("timelineList");
  const empty = document.getElementById("tlEmpty");
  const count = document.getElementById("tlCount");
  const periodSelect = document.getElementById("tlPeriod");
  const sortSelect = document.getElementById("tlSort");
  const savedBox = document.getElementById("tlSaved");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderWardrobePills() {
    const box = document.getElementById("tlWardrobe");
    box.innerHTML = "";
    const options = [["all", "All"]].concat(Object.entries(WARDROBE_LABELS));
    options.forEach(([id, label]) => {
      const input = el("input", "btn-check");
      input.type = "radio";
      input.name = "tlWardrobe";
      input.id = "tlw-" + id;
      input.value = id;
      input.checked = state.wardrobe === id;
      const lab = el("label", "btn btn-lis-outline btn-sm", label);
      lab.htmlFor = input.id;
      box.append(input, lab);
    });
  }

  function visibleLooks() {
    const out = LOOKS.filter((l) =>
      (state.wardrobe === "all" || l.wardrobe === state.wardrobe) &&
      PERIODS[state.period](l) &&
      (!state.savedOnly || LisAuth.isSaved(l.id))
    );
    out.sort((a, b) => (state.sort === "asc" ? a.decade - b.decade : b.decade - a.decade));
    return out;
  }

  function splitStory(text) {
    // first sentence is always visible, the rest opens with "Read the full story"
    const cut = text.indexOf(". ") + 1;
    return cut > 0 ? [text.slice(0, cut), text.slice(cut + 1)] : [text, ""];
  }

  function buildItem(look) {
    const li = el("li", "tl-item tl-item--" + look.wardrobe);
    const dot = el("span", "tl-item__dot", look.era);
    dot.setAttribute("aria-hidden", "true");

    const card = el("article", "tl-card");
    card.setAttribute("aria-labelledby", "tl-title-" + look.id);

    const fig = el("figure", "arch arch--" + look.wardrobe + " tl-card__fig");
    const img = el("img");
    img.src = look.image;
    img.alt = look.alt;
    img.width = 220;
    img.height = 510;
    img.loading = "lazy";
    fig.append(img);

    const body = el("div", "tl-card__body");
    const meta = el("p", "piece__meta");
    meta.append(
      el("span", "look__decade", look.era),
      el("span", "tag tag--" + (look.wardrobe === "kazakh" ? "qazaqstan" : look.wardrobe), WARDROBE_LABELS[look.wardrobe])
    );
    const title = el("h3", "tl-card__title", look.name);
    title.id = "tl-title-" + look.id;
    const moment = el("p", "tl-card__moment", look.keyMoment);

    const [lead, rest] = splitStory(look.history);
    const story = el("p", "tl-card__story", lead);
    const more = el("p", "tl-card__more", rest);
    more.id = "tl-more-" + look.id;

    const facts = el("dl", "tl-facts");
    [["Silhouette", look.silhouette], ["Signature", look.signature], ["Wear it now", look.tip]].forEach(([k, v]) => {
      const row = el("div");
      row.append(el("dt", "", k), el("dd", "", v));
      facts.append(row);
    });
    const factsWrap = el("div", "tl-card__extra");
    factsWrap.id = "tl-extra-" + look.id;
    factsWrap.hidden = true;
    factsWrap.append(more, facts);

    const actions = el("div", "tl-card__actions");
    const readBtn = el("button", "btn btn-lis-outline btn-sm", "Read the full story");
    readBtn.type = "button";
    readBtn.dataset.read = look.id;
    readBtn.setAttribute("aria-expanded", "false");
    readBtn.setAttribute("aria-controls", factsWrap.id);

    const saved = LisAuth.isSaved(look.id);
    const saveBtn = el("button", "save-btn" + (saved ? " is-saved" : ""));
    saveBtn.type = "button";
    saveBtn.dataset.save = look.id;
    saveBtn.setAttribute("aria-pressed", String(saved));
    saveBtn.setAttribute("aria-label", (saved ? "Remove " : "Save ") + look.name + (saved ? " from" : " to") + " your account");
    saveBtn.append(el("span", "save-btn__icon", saved ? "♥" : "♡"), el("span", "save-btn__text", saved ? "Saved" : "Save look"));

    actions.append(readBtn, saveBtn);
    body.append(meta, title, moment, story, factsWrap, actions);
    card.append(fig, body);
    li.append(dot, card);
    return li;
  }

  function render() {
    const looks = visibleLooks();
    list.innerHTML = "";

    if (looks.length === 0) {
      empty.hidden = false;
      const user = LisAuth.currentUser();
      document.getElementById("tlEmptyText").textContent = state.savedOnly && !user
        ? "Log in to see your saved looks, or turn off “Only my saved looks”."
        : state.savedOnly
          ? "You have not saved a look that matches these filters yet."
          : "No look matches this wardrobe and period. Try another combination.";
      count.textContent = "0 of " + LOOKS.length + " looks";
      return;
    }

    empty.hidden = true;
    looks.forEach((l) => list.append(buildItem(l)));

    // calculated value: how many years the visible looks cover
    const decades = looks.map((l) => l.decade);
    const span = Math.max(...decades) - Math.min(...decades);
    count.textContent = "Showing " + looks.length + " of " + LOOKS.length + " looks" +
      (looks.length > 1 ? " · " + span + " years of style" : "");

    // jQuery: cards slide in one after another
    $(list).children().each(function (i) {
      $(this).stop(true).css({ opacity: 0, marginTop: "1.2rem" })
        .delay(i * 60).animate({ opacity: 1, marginTop: 0 }, 300);
    });
  }

  $("#tlWardrobe").on("change", "input", function () {
    state.wardrobe = this.value;
    render();
  });
  periodSelect.addEventListener("change", () => { state.period = periodSelect.value; render(); });
  sortSelect.addEventListener("change", () => { state.sort = sortSelect.value; render(); });
  savedBox.addEventListener("change", () => { state.savedOnly = savedBox.checked; render(); });

  document.getElementById("tlReset").addEventListener("click", () => {
    Object.assign(state, { wardrobe: "all", period: "all", savedOnly: false });
    periodSelect.value = "all";
    savedBox.checked = false;
    renderWardrobePills();
    render();
    document.getElementById("tlw-all").focus();
  });

  list.addEventListener("click", (e) => {
    const read = e.target.closest("[data-read]");
    if (read) {
      const open = read.getAttribute("aria-expanded") === "true";
      const $extra = $("#tl-extra-" + read.dataset.read);
      read.setAttribute("aria-expanded", String(!open));
      read.textContent = open ? "Read the full story" : "Show less";
      // jQuery slide with stop() so fast double clicks never break it
      if (open) {
        $extra.stop(true, true).slideUp(250, () => { $extra.prop("hidden", true); });
      } else {
        $extra.stop(true, true).hide().prop("hidden", false).slideDown(300);
      }
      return;
    }

    const save = e.target.closest("[data-save]");
    if (save) {
      const look = findLook(save.dataset.save);
      const result = LisAuth.toggleSavedLook(look.id);
      if (result === null) {
        LisSite.notify("Create a free account to save " + look.name + ".", { href: "account.html#signup", text: "Sign up" });
        return;
      }
      save.classList.toggle("is-saved", result);
      save.setAttribute("aria-pressed", String(result));
      save.setAttribute("aria-label", (result ? "Remove " : "Save ") + look.name + (result ? " from" : " to") + " your account");
      save.querySelector(".save-btn__icon").textContent = result ? "♥" : "♡";
      save.querySelector(".save-btn__text").textContent = result ? "Saved" : "Save look";
      // restart the heart "pop" animation even on fast repeated clicks
      save.classList.remove("is-popping");
      void save.offsetWidth;
      save.classList.add("is-popping");
      LisSite.notify(result ? look.name + " saved to your board." : look.name + " removed from your board.",
        result ? { href: "account.html", text: "Open my board" } : null);
      if (state.savedOnly && !result) render();
    }
  });

  renderWardrobePills();
  render();
})();
