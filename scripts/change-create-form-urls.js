const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Configuration
const config = {
  inputDir: path.join(__dirname, "../app/views/create-new-form"),
  outputDir: path.join(__dirname, "../app/views/create-new-form"),
  prefixMappings: {
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
  },
};

function changeUrlPrefixes() {
  try {
    // Get all HTML files in the directory
    const files = glob.sync("**/*.html", { cwd: config.inputDir });

    files.forEach((file) => {
      const inputFile = path.join(config.inputDir, file);
      const outputFile = path.join(config.outputDir, file);

      // Create a backup of the original file
      const backupFile = inputFile + ".backup";
      fs.copyFileSync(inputFile, backupFile);
      console.log("Created backup file:", backupFile);

      // Read the input file
      let content = fs.readFileSync(inputFile, "utf8");
      let modifiedContent = content;

      // Replace each prefix
      for (const [oldPrefix, newPrefix] of Object.entries(
        config.prefixMappings
      )) {
        // Create regex pattern that matches the prefix in various contexts
        const pattern = new RegExp(`(["']|\\()${oldPrefix}`, "g");
        modifiedContent = modifiedContent.replace(pattern, `$1${newPrefix}`);
      }

      // Write the modified content back to the file
      fs.writeFileSync(outputFile, modifiedContent, "utf8");
      console.log(`Modified file: ${file}`);
    });

    console.log("URL prefixes have been successfully changed!");
    console.log("Changes made:");
    for (const [oldPrefix, newPrefix] of Object.entries(
      config.prefixMappings
    )) {
      console.log(`${oldPrefix} -> ${newPrefix}`);
    }
  } catch (error) {
    console.error("Error changing URL prefixes:", error);
  }
}

// Run the script
changeUrlPrefixes();
