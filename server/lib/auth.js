var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Users = require('../db/users');

var isAuthenticatedMiddleware = function(req, res, next) {
  
  if (req.headers.host === '127.0.0.1:3000')
      return next();
  
  if (req.user && req.user.username)
      return next();

  res.status(401).end();
}

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  isAuthenticatedMiddleware: isAuthenticatedMiddleware
}

passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());