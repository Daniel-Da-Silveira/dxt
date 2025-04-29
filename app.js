const express = require("express");
const path = require("path");
const nunjucks = require("nunjucks");
const marked = require("marked");

const app = express();

// Configure Nunjucks
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

// Set up static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Import routes
const routes = require("./routes");
app.use("/", routes);

module.exports = app;
