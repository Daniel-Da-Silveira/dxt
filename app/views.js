const marked = require("marked");
const nunjucks = require("nunjucks");
const path = require("path");

module.exports = function (app) {
  // Get the Nunjucks environment
  const env = nunjucks.configure(
    [path.join(__dirname, "views"), "node_modules/govuk-frontend/"],
    {
      autoescape: true,
      express: app,
    }
  );

  // Add markdown filter
  env.addFilter("markdown", function (content) {
    if (!content) return "";
    return marked.parse(content);
  });

  return env;
};
