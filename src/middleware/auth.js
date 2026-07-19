// blocks pages that need a logged-in user
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

module.exports = { requireLogin };
