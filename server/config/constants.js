const RESERVED = [
  "shorten",
  "admin",
  "login",
  "logout",
  "signup",
  "register",
  "dashboard",
  "stats",
  "analytics",
  "health",
  "status",
  "static",
  "assets",
  "public",
  "account",
  "profile",
  "settings",
  "support",
  "contact",
  "privacy",
  "terms",
];
const MAX_ATTEMPTS = 5;
const ALLOWED_PROTOCOLS = ["http:", "https:"];
const MAX_EXPIRY_MINUTES = 525600;

module.exports = {
  RESERVED,
  MAX_ATTEMPTS,
  ALLOWED_PROTOCOLS,
  MAX_EXPIRY_MINUTES,
};
