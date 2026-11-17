/* Lis shared site script (all pages). Needs jQuery.
   - LisStore: safe localStorage
   - LisAuth: simulated account (browser only)
   - LisSite: notification banner, smooth scroll, back-to-top, nav account label */

const LisStore = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
};

const LisAuth = (function () {
  const USERS_KEY = "lis-users";
  const SESSION_KEY = "lis-session";

  // Demo-only hash so the password is not stored as plain text.
  // This is NOT real security: everything lives in this browser.
  function hash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    }
    return "h" + (h >>> 0).toString(16);
  }

  function users() {
    return LisStore.get(USERS_KEY, []);
  }

  function findUser(email) {
    const key = String(email).trim().toLowerCase();
    return users().find((u) => u.email === key) || null;
  }

  function currentUser() {
    const email = LisStore.get(SESSION_KEY, null);
    return email ? findUser(email) : null;
  }

  function saveUser(user) {
    const list = users();
    const i = list.findIndex((u) => u.email === user.email);
    if (i === -1) list.push(user); else list[i] = user;
    LisStore.set(USERS_KEY, list);
    return user;
  }

  function register(data) {
    const user = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      birth: data.birth,
      wardrobe: data.wardrobe,
      pass: hash(data.password),
      created: new Date().toISOString(),
      saved: [],
      bestScore: 0,
      quizMatch: null
    };
    saveUser(user);
    LisStore.set(SESSION_KEY, user.email);
    return user;
  }

  function checkPassword(user, password) {
    return user.pass === hash(password);
  }

  function login(email) {
    LisStore.set(SESSION_KEY, String(email).trim().toLowerCase());
  }

  function logout() {
    LisStore.remove(SESSION_KEY);
  }

  function update(changes) {
    const user = currentUser();
    if (!user) return null;
    Object.assign(user, changes);
    return saveUser(user);
  }

  // returns true (saved), false (removed) or null (not logged in)
  function toggleSavedLook(id) {
    const user = currentUser();
    if (!user) return null;
    const i = user.saved.indexOf(id);
    if (i === -1) user.saved.push(id); else user.saved.splice(i, 1);
    saveUser(user);
    return i === -1;
  }

  function isSaved(id) {
    const user = currentUser();
    return !!user && user.saved.includes(id);
  }

  return { findUser, currentUser, register, checkPassword, login, logout, update, toggleSavedLook, isSaved };
})();

const LisSite = (function () {
  let noticeTimer = null;

  function ensureNotice() {
    if (!document.getElementById("notice")) {
      $("body").append(
        '<div id="notice" class="notice" role="status" aria-live="polite">' +
        '<div class="notice__inner"><div class="notice__body"><p id="noticeTitle" class="notice__title"></p>' +
        '<p id="noticeText" class="notice__text"></p></div>' +
        '<button type="button" class="notice__close" id="noticeClose" aria-label="Close notification">&times;</button></div></div>'
      );
    }
    if (!document.getElementById("noticeTitle")) {
      $("#noticeText").before('<p id="noticeTitle" class="notice__title"></p>').parent().addClass("notice__body");
    }
    $("#noticeClose").off("click").on("click", hideNotice);
  }

  function notify(message, link, title) {
    ensureNotice();
    $("#noticeTitle").text(title || "").toggle(!!title);
    const $text = $("#noticeText").text(message);
    if (link) {
      $text.append(" ", $("<a>", { href: link.href, text: link.text, class: "notice__link" }));
    }
    const delay = link ? 7000 : 5000;
    const $notice = $("#notice");
    $notice.removeClass("is-running").css("--notice-time", delay + "ms");
    clearTimeout(noticeTimer);
    $notice.stop(true, true).css({ display: "block", opacity: 0, marginTop: "-0.8rem" })
      .animate({ opacity: 1, marginTop: 0 }, 300);
    void $notice[0].offsetWidth;
    $notice.addClass("is-running");
    noticeTimer = setTimeout(hideNotice, delay);
  }

  function hideNotice() {
    $("#notice").stop(true, true).fadeOut(220).removeClass("is-running");
  }

  function scrollTo(target) {
    const $target = $(target);
    if (!$target.length) return;
    const offset = $(".site-header").outerHeight() || 0;
    $("html, body").stop().animate({ scrollTop: $target.offset().top - offset - 12 }, 600);
  }

  function firstName(full) {
    return String(full).trim().split(/\s+/)[0];
  }

  function updateAccountLink() {
    const user = LisAuth.currentUser();
    $(".nav-link--account").each(function () {
      $(this).text(user ? firstName(user.name) : "Account")
        .attr("title", user ? "Your account" : "Sign up or log in")
        .toggleClass("is-member", !!user);
    });
  }

  function backToTop() {
    const $btn = $('<button type="button" class="to-top" aria-label="Back to top">&uarr;</button>').hide();
    $("body").append($btn);
    $(window).on("scroll", function () {
      if ($(this).scrollTop() > 700) $btn.stop(true, true).fadeIn(200);
      else $btn.stop(true, true).fadeOut(200);
    });
    $btn.on("click", function () {
      $("html, body").stop().animate({ scrollTop: 0 }, 500);
      $("#main").attr("tabindex", "-1").trigger("focus");
    });
  }

  $(function () {
    updateAccountLink();
    backToTop();
    ensureNotice();
    // smooth scroll for any link marked .js-scroll
    $(document).on("click", ".js-scroll", function (event) {
      const href = $(this).attr("href");
      if (href && href.charAt(0) === "#" && $(href).length) {
        event.preventDefault();
        scrollTo(href);
      }
    });
  });

  return { notify, hideNotice, scrollTo, firstName, updateAccountLink };
})();
