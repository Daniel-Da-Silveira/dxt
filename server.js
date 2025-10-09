if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(function (req, res, next) {
    if (req.session && req.session.cookie) {
      req.session.cookie.sameSite = "lax";
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
