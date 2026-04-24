const validator = require("validator");
const xss = require("xss");

function sanitizeUser(data) {
  return {
    username: validator.escape(data.username.trim()),
    email: validator.normalizeEmail(data.email),
    bio: xss(data.bio),
    profilePic: validator.isURL(data.profilePic) ? data.profilePic : ""
  };
}
