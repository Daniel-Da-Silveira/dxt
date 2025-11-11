const { marked } = require("marked");

// Create a custom renderer
const renderer = new marked.Renderer();

// Override the image renderer to use GOV.UK image component
renderer.image = function (href, title, text) {
  // Clean up the title by replacing newlines with spaces and trimming
  const cleanTitle = title ? title.replace(/\n/g, " ").trim() : text;

  return `<figure class="govuk-image">
                <img src="${href}" alt="${text}" class="govuk-!-width-full">
                <figcaption class="govuk-body-s">${cleanTitle}</figcaption>
            </figure>`;
};

// Configure marked with the custom renderer
marked.use({
  renderer: renderer,
});

module.exports = marked;
