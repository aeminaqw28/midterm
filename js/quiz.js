/* Lis style quiz: validates the answers, scores every look in LOOKS
   and shows the best match inline (no page reload). */

(function () {
  "use strict";

  const form = document.getElementById("quizForm");
  const resultBox = document.getElementById("quizResult");
  const summary = document.getElementById("quizSummary");
  const bold = document.getElementById("bold");
  const note = document.getElementById("note");
  const BOLD_WORDS = ["", "very quiet", "quiet", "balanced", "bold", "very loud"];
  const MAX_POINTS = 11; // place 3 + decade 4 + occasion 2 + boldness 2

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function checkedValues(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map((i) => i.value);
  }

  // live hints
  bold.addEventListener("input", () => {
    document.getElementById("boldValue").textContent = "Level " + bold.value + " of 5: " + BOLD_WORDS[bold.value];
  });
  note.addEventListener("input", () => {
    document.getElementById("note-count").textContent = note.value.length + " / 300";
  });

  /* ---------- validation ---------- */

  const rules = {
    name: () => LisValidate.name(document.getElementById("name").value),
    email: () => LisValidate.email(document.getElementById("email").value),
    place: () => (checkedValues("place").length ? "" : "Pick the place that speaks to you."),
    decade: () => (document.getElementById("decade").value ? "" : "Choose the decade you want to wear."),
    occasion: () => (checkedValues("occasion").length ? "" : "Tick at least one occasion so we can match the look."),
    note: () => (note.value.length > 300 ? "Please keep your note under 300 characters." : "")
  };

  const touched = new Set();

  function showError(key, message) {
    const errorEl = document.getElementById(key + "-error");
    errorEl.textContent = message;
    const field = document.getElementById(key);
    if (field) {
      LisValidate.showFieldError(field, message, errorEl);
    } else {
      // radio and checkbox groups: mark every input in the group
      const name = key;
      form.querySelectorAll('input[name="' + name + '"]').forEach((input) => {
        input.classList.toggle("is-invalid", message !== "");
        input.setAttribute("aria-invalid", message !== "" ? "true" : "false");
      });
    }
    return message === "";
  }

  function check(key) {
    return showError(key, rules[key]());
  }

  ["name", "email"].forEach((key) => {
    const field = document.getElementById(key);
    field.addEventListener("input", () => { if (touched.has(key)) check(key); });
    field.addEventListener("blur", () => { if (field.value || touched.has(key)) { touched.add(key); check(key); } });
  });
  document.getElementById("decade").addEventListener("change", () => { touched.add("decade"); check("decade"); });
  form.addEventListener("change", (e) => {
    if (e.target.name === "place" && touched.has("place")) check("place");
    if (e.target.name === "occasion" && touched.has("occasion")) check("occasion");
  });

  /* ---------- scoring (loops + conditions + calculated value) ---------- */

  function scoreLook(look, answers) {
    let points = 0;
    if (look.wardrobe === answers.place) points += 3;
    if (look.era === answers.decade) points += 4;
    let shared = 0;
    for (const occasion of answers.occasions) {
      if (look.occasions.includes(occasion)) shared += 1;
    }
    points += answers.occasions.length ? (shared / answers.occasions.length) * 2 : 0;
    points += Math.max(0, 2 - Math.abs(look.boldness - answers.bold) * 0.5);
    return Math.round((points / MAX_POINTS) * 100);
  }

  function rankLooks(answers) {
    return LOOKS
      .map((look) => ({ look, percent: scoreLook(look, answers) }))
      .sort((a, b) => b.percent - a.percent);
  }

  /* ---------- result card ---------- */

  function renderResult(name, ranked) {
    const best = ranked[0];
    const look = best.look;
    resultBox.innerHTML = "";

    const card = el("article", "match");
    const fig = el("figure", "arch arch--" + look.wardrobe + " match__fig");
    const img = el("img");
    img.src = look.image;
    img.alt = look.alt;
    img.width = 220;
    img.height = 510;
    fig.append(img);

    const body = el("div", "match__body");
    const heading = el("h2", "match__title");
    heading.id = "match-title";
    heading.tabIndex = -1;
    heading.append(LisSite.firstName(name) + ", you are ", el("em", "", look.name));
    const meter = el("div", "match__meter");
    const bar = el("span", "match__bar");
    meter.append(bar);
    const percent = el("p", "match__percent", best.percent + "% match · " + WARDROBE_LABELS[look.wardrobe] + ", " + look.era);

    const pieces = el("ul", "pieces");
    look.pieces.forEach((p) => pieces.append(el("li", "", p)));

    const alt = el("p", "match__alt");
    alt.textContent = "Also close: " + ranked.slice(1, 3).map((r) => r.look.name + " (" + r.percent + "%)").join(", ") + ".";

    const actions = el("div", "match__actions");
    const save = el("button", "btn btn-lis", LisAuth.isSaved(look.id) ? "Saved to my board" : "Save this look");
    save.type = "button";
    save.id = "saveMatch";
    const shop = el("a", "btn btn-lis-outline", "Shop the pieces");
    shop.href = "studio.html#shop";
    const again = el("button", "link-btn", "Take the quiz again");
    again.type = "button";
    again.id = "quizAgain";
    actions.append(save, shop, again);

    body.append(
      el("p", "eyebrow", "Your Lis match"), heading, meter, percent,
      el("p", "match__tip", "How to wear it today: " + look.tip),
      el("h3", "look__sub", "Key pieces"), pieces, alt, actions
    );
    card.append(fig, body);
    resultBox.append(card);

    // jQuery: reveal the card, then grow the match bar to the percentage
    $(card).hide().fadeIn(400, () => {
      $(bar).css("width", 0).animate({ width: best.percent + "%" }, 700);
    });
    LisSite.scrollTo("#quizResult");
    heading.focus({ preventScroll: true });

    save.addEventListener("click", () => {
      if (LisAuth.isSaved(look.id)) {
        LisSite.notify(look.name + " is already on your board.", { href: "account.html", text: "Open my board" });
        return;
      }
      const result = LisAuth.toggleSavedLook(look.id);
      if (result === null) {
        LisSite.notify("Create a free account to save your match.", { href: "account.html#signup", text: "Sign up" });
        return;
      }
      save.textContent = "Saved to my board";
      LisSite.notify(look.name + " saved to your board.", { href: "account.html", text: "Open my board" });
    });

    again.addEventListener("click", () => {
      $(resultBox).children().fadeOut(250, () => { resultBox.innerHTML = ""; });
      LisSite.scrollTo("#quizForm");
      document.getElementById("name").focus({ preventScroll: true });
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let first = null;
    let errors = 0;
    Object.keys(rules).forEach((key) => {
      touched.add(key);
      if (!check(key)) {
        errors += 1;
        if (!first) first = document.getElementById(key) || form.querySelector('input[name="' + key + '"]');
      }
    });
    if (first) {
      summary.textContent = "Almost there: " + errors + " answer" + (errors > 1 ? "s need" : " needs") + " your attention.";
      summary.classList.add("is-visible");
      first.focus();
      return;
    }
    summary.classList.remove("is-visible");

    const answers = {
      place: checkedValues("place")[0],
      decade: document.getElementById("decade").value,
      occasions: checkedValues("occasion"),
      bold: Number(bold.value)
    };
    const name = document.getElementById("name").value.trim();
    const ranked = rankLooks(answers);

    if (LisAuth.currentUser()) {
      LisAuth.update({ quizMatch: { id: ranked[0].look.id, percent: ranked[0].percent } });
    }

    renderResult(name, ranked);

    // clear the form after a successful submit
    form.reset();
    touched.clear();
    ["name", "email"].forEach((k) => LisValidate.clearField(document.getElementById(k)));
    form.querySelectorAll(".is-invalid").forEach((n) => n.classList.remove("is-invalid"));
    document.getElementById("boldValue").textContent = "Level 3 of 5: " + BOLD_WORDS[3];
    document.getElementById("note-count").textContent = "0 / 300";
    prefill();
  });

  function prefill() {
    const member = LisAuth.currentUser();
    if (member) {
      document.getElementById("name").value = member.name;
      document.getElementById("email").value = member.email;
    }
  }

  // members get their name and email filled in
  prefill();
})();
