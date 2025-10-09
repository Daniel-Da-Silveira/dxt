// Server-side temporary store for form data that survives cross-site redirects
const tempStore = new Map();

// Clean up expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tempStore.entries()) {
    if (value.expires < now) {
      tempStore.delete(key);
    }
  }
}, 30 * 60 * 1000);

// Make tempStore available to routes
app.locals.tempStore = tempStore;

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(function (req, res, next) {
    if (req.session && req.session.cookie) {
      req.session.cookie.sameSite = "none"; // allow cross-site POST redirects
      req.session.cookie.secure = true;
    }
    next();
  });
}

const marked = require("./app/config/markdown");

// Access the Nunjucks environment and add the filter
const env = app.get("nunjucksEnv");
env.addFilter("govukMarkdown", function (str) {
  return marked(str || "");
});
