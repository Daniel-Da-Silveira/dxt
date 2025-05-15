const marked = require("./app/config/markdown");

// Access the Nunjucks environment and add the filter
const env = app.get("nunjucksEnv");
env.addFilter("govukMarkdown", function (str) {
  return marked(str || "");
});
