const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Configuration
const config = {
  inputDir: path.join(__dirname, "../app/views/titan-mvp-1/form-overview"),
  prefixMappings: {
    // Route path mappings
    "/form-editor/": "/titan-mvp-1/form-editor/",
    "/form-overview/": "/titan-mvp-1/form-overview/",
    "/create-new-form/": "/titan-mvp-1/create-new-form/",
    "/conditions/": "/titan-mvp-1/conditions/",
    "/page-overview": "/titan-mvp-1/page-overview",
    "/question-configuration": "/titan-mvp-1/question-configuration",
    "/question-number": "/titan-mvp-1/question-number",
    "/information-type-answer-nf": "/titan-mvp-1/information-type-answer-nf",
    "/test-form": "/titan-mvp-1/test-form",
    "/configure-checkbox-nf": "/titan-mvp-1/configure-checkbox-nf",
    "/configure-radio-nf": "/titan-mvp-1/configure-radio-nf",
    "/update-radio-label": "/titan-mvp-1/update-radio-label",
    "/edit-page/": "/titan-mvp-1/edit-page/",
    "/edit-question": "/titan-mvp-1/edit-question",
    "/delete-page": "/titan-mvp-1/delete-page",
    "/library": "/titan-mvp-1/library",
    "/form-designer-mvp2/": "/titan-mvp-1/",
    "/form-designer-mvp2/onboarding/": "/titan-mvp-1/onboarding/",
    "/form-designer-mvp2/library": "/titan-mvp-1/library",
    "/form-editor/new-list": "/titan-mvp-1/form-editor/new-list",
    "/form-editor/list-manager": "/titan-mvp-1/form-editor/list-manager",
    "/form-editor/edit-list/": "/titan-mvp-1/form-editor/edit-list/",
    "/form-editor/update-list/": "/titan-mvp-1/form-editor/update-list/",
    "/form-editor/delete-list/": "/titan-mvp-1/form-editor/delete-list/",
    "/form-editor/api/lists": "/titan-mvp-1/form-editor/api/lists",
    "/form-editor/api/list/": "/titan-mvp-1/form-editor/api/list/",
    "/form-editor/sections": "/titan-mvp-1/form-editor/sections",
    "/form-editor/view-list/": "/titan-mvp-1/form-editor/view-list/",
    "/form-editor/listing": "/titan-mvp-1/form-editor/listing",
    "/form-editor/page-type.html": "/titan-mvp-1/form-editor/page-type.html",
    "/form-editor/information-type-nf.html":
      "/titan-mvp-1/form-editor/information-type-nf.html",
    "/form-editor/question-type/": "/titan-mvp-1/form-editor/question-type/",
    "/form-editor/reorder/": "/titan-mvp-1/form-editor/reorder/",
    "/form-editor/delete/": "/titan-mvp-1/form-editor/delete/",
    "/form-editor/guidance/": "/titan-mvp-1/form-editor/guidance/",
    "/form-editor/preview": "/titan-mvp-1/form-editor/preview",
    "/form-editor/conditions/": "/titan-mvp-1/form-editor/conditions/",
    "/form-editor/conditions-manager/":
      "/titan-mvp-1/form-editor/conditions-manager/",
    "/form-editor/edit-guidance": "/titan-mvp-1/form-editor/edit-guidance",
    "/form-overview/index/support/":
      "/titan-mvp-1/form-overview/index/support/",
    "/form-overview/manage-form/": "/titan-mvp-1/form-overview/manage-form/",
    "/form-overview/live-draft": "/titan-mvp-1/form-overview/live-draft",
    "/form-overview/live/": "/titan-mvp-1/form-overview/live/",
    "/form-overview/make-draft-live":
      "/titan-mvp-1/form-overview/make-draft-live",
    "/form-overview/manage-form/make-draft-live/":
      "/titan-mvp-1/form-overview/manage-form/make-draft-live/",
    "/form-overview/manage-form/delete-draft":
      "/titan-mvp-1/form-overview/manage-form/delete-draft",
    "/form-overview/manage-form/delete-draft/confirm":
      "/titan-mvp-1/form-overview/manage-form/delete-draft/confirm",
    // Template path mappings
    "form-overview/": "titan-mvp-1/form-overview/",
    "form-editor/": "titan-mvp-1/form-editor/",
    "create-new-form/": "titan-mvp-1/create-new-form/",
    "conditions/": "titan-mvp-1/conditions/",
    "page-overview": "titan-mvp-1/page-overview",
    "question-configuration": "titan-mvp-1/question-configuration",
    "question-number": "titan-mvp-1/question-number",
    "information-type-answer-nf": "titan-mvp-1/information-type-answer-nf",
    "test-form": "titan-mvp-1/test-form",
    "configure-checkbox-nf": "titan-mvp-1/configure-checkbox-nf",
    "configure-radio-nf": "titan-mvp-1/configure-radio-nf",
    "update-radio-label": "titan-mvp-1/update-radio-label",
    "edit-page/": "titan-mvp-1/edit-page/",
    "edit-question": "titan-mvp-1/edit-question",
    "delete-page": "titan-mvp-1/delete-page",
    library: "titan-mvp-1/library",
    "form-designer-mvp2/": "titan-mvp-1/",
    "form-designer-mvp2/onboarding/": "titan-mvp-1/onboarding/",
    "form-designer-mvp2/library": "titan-mvp-1/library",
  },
};

function changeUrlPrefixes() {
  try {
    // Find all HTML files in the form-overview directory and its subdirectories
    const files = glob.sync("**/*.html", { cwd: config.inputDir });

    files.forEach((file) => {
      const filePath = path.join(config.inputDir, file);

      // Create a backup of the original file
      const backupPath = filePath + ".backup";
      fs.copyFileSync(filePath, backupPath);
      console.log(`Created backup file: ${backupPath}`);

      // Read the file content
      let content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;

      // Replace each prefix
      for (const [oldPrefix, newPrefix] of Object.entries(
        config.prefixMappings
      )) {
        // Create regex pattern that matches the prefix in various contexts
        // This will match both URL paths and template paths
        const pattern = new RegExp(
          `(["']|\\()${oldPrefix}|{%\\s*extends\\s*["']${oldPrefix}`,
          "g"
        );
        modifiedContent = modifiedContent.replace(pattern, (match) => {
          if (match.startsWith("{%")) {
            return `{% extends "${newPrefix}`;
          }
          return match.startsWith('"') ||
            match.startsWith("'") ||
            match.startsWith("(")
            ? match[0] + newPrefix
            : newPrefix;
        });
      }

      // Write the modified content back to the file
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      console.log(`Modified file: ${file}`);

      console.log(`URL prefixes have been successfully changed in ${file}!`);
      console.log("Changes made:");
      for (const [oldPrefix, newPrefix] of Object.entries(
        config.prefixMappings
      )) {
        if (content.includes(oldPrefix)) {
          console.log(`${oldPrefix} -> ${newPrefix}`);
        }
      }
    });
  } catch (error) {
    console.error("Error changing URL prefixes:", error);
  }
}

// Run the script
changeUrlPrefixes();
