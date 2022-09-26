const { SECRET_KEY } = require("../config");
const expressJwt = require("express-jwt");
const userService = require("../collections/users/user.service");

module.exports = jwt;

function jwt() {
  return expressJwt({
    secret: SECRET_KEY,
    algorithms: ["HS256"],
    isRevoked,
  }).unless({
    path: [
      // public routes that don't require authentication
      "/api/users/authenticate",
      "/api/users/register",
      "/api/users/forgotPasswordRequest",
      "/api/users/forgotPasswordTokenOnly",
      "/api/users/forgotPasswordUpdate",
      "/api/users/verifyEmail",
      "/api/users/resendVerify",
    ],
  });
}

async function isRevoked(req, payload, done) {
  const user = await userService.getById(payload.sub);

  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }

  done();
}
