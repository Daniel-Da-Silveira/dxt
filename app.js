require("dotenv").config();
const express = require("express");
const path = require("path");
const nunjucks = require("nunjucks");
const marked = require("marked");

const app = express();

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
