/* Lis shared form validation.
   Each rule returns an error message, or "" when the value is fine.
   showFieldError() writes the message under the field (no alert popups). */

const LisValidate = (function () {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  // Kazakhstan numbers: +7 or 8, then 10 digits, spaces/dashes/brackets allowed
  const PHONE_RE = /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
  const NAME_RE = /^[A-Za-zÀ-ɏЀ-ӿ' -]+$/;

  function required(value, label) {
    return String(value).trim() === "" ? label + " is required." : "";
  }

  function name(value) {
    const v = value.trim();
    if (v === "") return "Please enter your full name.";
    if (v.length < 2) return "Your name needs at least 2 letters.";
    if (v.length > 40) return "Please keep your name under 40 characters.";
    if (!NAME_RE.test(v)) return "Use letters, spaces, hyphens or apostrophes only.";
    return "";
  }

  function email(value) {
    const v = value.trim();
    if (v === "") return "Please enter your email address.";
    if (!EMAIL_RE.test(v)) return "This email looks incomplete. Example: aruzhan@mail.kz";
    return "";
  }

  function phone(value) {
    const v = value.trim();
    if (v === "") return "Please enter a phone number.";
    if (!PHONE_RE.test(v)) return "Use a Kazakhstan number, for example +7 701 234 5678.";
    return "";
  }

  function minLength(value, min, label) {
    const v = value.trim();
    if (v === "") return label + " is required.";
    if (v.length < min) return label + " needs at least " + min + " characters (" + (min - v.length) + " more).";
    return "";
  }

  function numberInRange(value, min, max, label) {
    if (String(value).trim() === "") return label + " is required.";
    const n = Number(value);
    if (!Number.isFinite(n)) return label + " must be a number.";
    if (n < min || n > max) return label + " must be between " + min + " and " + max + ".";
    return "";
  }

  function toIso(date) {
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + m + "-" + d;
  }

  function daysFromToday(iso) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(iso + "T00:00:00");
    return Math.round((target - today) / 86400000);
  }

  function dateWindow(value, minDays, maxDays, label) {
    if (value === "") return "Please choose " + label + ".";
    const days = daysFromToday(value);
    if (Number.isNaN(days)) return "Please choose a valid date.";
    if (days < minDays) return "We need at least " + minDays + " days. Pick a date on or after " + toIso(addDays(new Date(), minDays)) + ".";
    if (days > maxDays) return "Please choose a date within the next year.";
    return "";
  }

  function addDays(date, days) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  // Password strength: used by the account page
  function password(value) {
    if (value === "") return "Please create a password.";
    const missing = [];
    if (value.length < 8) missing.push("at least 8 characters");
    if (!/[A-Z]/.test(value)) missing.push("a capital letter");
    if (!/[0-9]/.test(value)) missing.push("a number");
    if (!/[^A-Za-z0-9]/.test(value)) missing.push("a symbol like ! or #");
    if (!missing.length) return "";
    const last = missing.pop();
    return "Your password still needs " + (missing.length ? missing.join(", ") + " and " : "") + last + ".";
  }

  /* Write or clear the message under a field.
     field: the input element; errorEl: the <p class="field-error"> under it */
  function showFieldError(field, message, errorEl) {
    const target = errorEl || document.getElementById(field.id + "-error");
    if (target) target.textContent = message;
    field.classList.toggle("is-invalid", message !== "");
    field.classList.toggle("is-valid", message === "");
    field.setAttribute("aria-invalid", message !== "" ? "true" : "false");
  }

  function clearField(field) {
    const target = document.getElementById(field.id + "-error");
    if (target) target.textContent = "";
    field.classList.remove("is-invalid", "is-valid");
    field.removeAttribute("aria-invalid");
  }

  return { required, name, email, phone, minLength, numberInRange, dateWindow, password, showFieldError, clearField, toIso, addDays, daysFromToday };
})();
