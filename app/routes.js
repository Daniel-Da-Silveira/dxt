//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();
const terms = require("./data/dictionary.json");

// Add middleware to make terms available to all templates
router.use((req, res, next) => {
  res.locals.commonTerms = terms;
  next();
});

// import lists stuff

router.get("/form-editor/new-list", (req, res) => {
  res.render("form-editor/lists/new");
});
router.post("/form-editor/new-list", require("./routes/lists.js").post);
router.get("/form-editor/list-manager", require("./routes/lists.js").get);
router.get(
  "/form-editor/edit-list/:name",
  require("./routes/lists.js").editGet
);
router.post(
  "/form-editor/update-list/:name",
  require("./routes/lists.js").editPost
);
router.post(
  "/form-editor/delete-list/:name",
  require("./routes/lists.js").delete
);

// New route to get predefined lists from the lists.js file
router.get("/form-editor/api/lists", require("./routes/lists.js").getListsAPI);

// New route to get a specific list by name
router.get(
  "/form-editor/api/list/:name",
  require("./routes/lists.js").getListAPI
);

// Preview lists
router.get(
  "/form-editor/view-list/:name",
  require("./routes/lists.js").viewGet
);

module.exports = router;

// routes.js
const express = require("express");

// **** LISTING AND SETUP ROUTES ****************************************************
//--------------------------------------
// 2. GET /form-editor/listing
//    Show the initial listing page
//--------------------------------------
router.get("/form-editor/listing", function (req, res) {
  const formPages = req.session.data["formPages"] || [];

  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    page.questions.forEach((question) => {
      if (question.subType === "radios" || question.subType === "checkboxes") {
        // Add checkboxes here
        question.options = question.options || [];
      }
    });
  });

  console.log(
    "✅ Passing formPages with radio and checkbox options:",
    formPages
  );

  res.render("form-editor/listing/index", {
    formPages,
  });
});

//--------------------------------------
// 3. GET /questiontype
//    Show the page type selection form
//--------------------------------------
router.get("/form-editor/page-type.html", function (req, res) {
  res.render("form-editor/page-type.html", {
    commonTerms: terms,
  });
});

// **** CREATE A NEW PAGE (QUESTION OR GUIDANCE) ****************************************************

//--------------------------------------
// 4. POST /question-number
//    Handle user's choice: question page or guidance page
//--------------------------------------
router.post("/question-number", function (req, res) {
  // E.g. 'oncenf' means "Question page", 'guidance' means "Guidance page"
  const pageType = req.session.data["questionnumber"];

  // Make sure we have an array to store pages
  if (!req.session.data["formPages"]) {
    req.session.data["formPages"] = [];
  }

  // Create a new page object
  const newPage = {
    pageId: Date.now(), // unique ID
    pageType: pageType === "guidance" ? "guidance" : "question",
    pageHeading: "",
    questions: [],
    hasGuidance: false,
    guidanceTextarea: "",
    allowMultipleResponses: false,
    setName: "",
    minResponseCount: "",
    maxResponseCount: "",
  };

  // Push it into formPages
  const formPages = req.session.data["formPages"];
  formPages.push(newPage);

  // Keep track of which page index we're editing
  // (the newly added page is always at formPages.length - 1)
  req.session.data["currentPageIndex"] = formPages.length - 1;

  // Decide where to go next
  if (pageType === "oncenf") {
    // If user chose "question" page
    return res.redirect("/form-editor/information-type-nf.html");
  } else if (pageType === "guidance") {
    // If user chose "guidance" page
    return res.redirect(
      "/form-editor/question-type/guidance-configuration.html"
    );
  } else {
    // If user somehow chose nothing, redirect back or show an error
    return res.redirect("/form-editor/page-type.html");
  }
});

// **** Choose Question Type / Subtype ****************************************************

//--------------------------------------
// 5. POST /information-type-answer-nf
//    Handle user picking the specific question type (e.g. "text", "date")
//--------------------------------------
router.post("/information-type-answer-nf", function (req, res) {
  // 1. The main question type (e.g. "text", "date", "list")
  const mainType = req.body["informationQuestion1"];

  // 2. Subtypes for each category:
  const writtenSubType = req.body["written"];
  const dateSubType = req.body["dateType"];
  const listSubType = req.body["listType"];

  // Ensure `formPages` exists
  const formPages = req.session.data["formPages"] || [];

  // Get the current page index - DO NOT CREATE NEW PAGE
  const pageIndex = req.session.data["currentPageIndex"];
  if (pageIndex === undefined || !formPages[pageIndex]) {
    console.error("❌ Current page not found in session");
    return res.redirect("/form-editor/listing.html");
  }

  // Get the current page
  const currentPage = formPages[pageIndex];

  // 3. Store question type and subtypes in session
  req.session.data["currentQuestionType"] = mainType;
  req.session.data["writtenSubType"] = writtenSubType;
  req.session.data["dateSubType"] = dateSubType;
  req.session.data["listSubType"] = listSubType;

  // 4. Create and add the new question
  const newQuestion = {
    questionId: Date.now(),
    type: mainType,
    subType: listSubType || dateSubType || writtenSubType,
    label: "New question",
    options: [], // Initialize empty options array
  };

  // Add the question to the current page
  currentPage.questions.push(newQuestion);

  // Store the question index
  req.session.data["currentQuestionIndex"] = currentPage.questions.length - 1;

  // 5. Save back to session
  req.session.data["formPages"] = formPages;

  // 6. Redirect to the question configuration route
  res.redirect("/question-configuration");
});

//--------------------------------------
// 6. GET /question-configuration
//    Render different templates depending on the user's choice
//--------------------------------------
router.get("/question-configuration", function (req, res) {
  // Retrieve the stored type choices from session
  const mainType = req.session.data["currentQuestionType"];
  const writtenSubType = req.session.data["writtenSubType"];
  const dateSubType = req.session.data["dateSubType"];
  const listSubType = req.session.data["listSubType"];

  // Decide which template to render
  let templateToRender = "/form-editor/question-type/default.html";

  // Decide which template to render based on mainType & subType
  if (mainType === "text") {
    // Choose the template based on writtenSubType
    if (writtenSubType === "short-answer-nf") {
      templateToRender = "/form-editor/question-type/shorttext/edit-nf.html";
    } else if (writtenSubType === "long-answer") {
      templateToRender = "/form-editor/question-type/textarea/edit-nf.html";
    } else if (writtenSubType === "numbers") {
      templateToRender = "/form-editor/question-type/numbers/edit-nf.html";
    } else {
      // Fallback for an unknown sub-type
      templateToRender = "/form-editor/question-type/default.html";
    }
  } else if (mainType === "date") {
    if (dateSubType === "day-month-year") {
      templateToRender = "/form-editor/question-type/date/edit-nf.html";
    } else if (dateSubType === "month-year") {
      templateToRender = "/form-editor/question-type/date-mmyy/edit-nf.html";
    } else {
      templateToRender = "/form-editor/question-type/default.html";
    }
  } else if (mainType === "address") {
    templateToRender = "/form-editor/question-type/address/edit-nf.html";
  } else if (mainType === "phone") {
    templateToRender = "/form-editor/question-type/phone/edit-nf.html";
  } else if (mainType === "file") {
    templateToRender = "/form-editor/question-type/fileupload/edit-nf.html";
  } else if (mainType === "email") {
    templateToRender = "/form-editor/question-type/email/edit-nf.html";
  } else if (mainType === "list") {
    if (listSubType === "yes-no") {
      templateToRender = "/form-editor/question-type/yesno/edit-nf.html";
    } else if (listSubType === "checkboxes") {
      templateToRender = "/form-editor/question-type/checkboxes-nf/add.html";
    } else if (listSubType === "radios") {
      templateToRender = "/form-editor/question-type/radios-nf/add.html";
    } else if (listSubType === "select") {
      templateToRender = "/form-editor/question-type/autocomplete-nf/edit.html";
    } else {
      templateToRender = "/form-editor/question-type/default.html";
    }
  }

  // Finally, render the chosen template
  res.render(templateToRender);
});

// **** SAVING QUESTION CONFIGURATION ****

// POST /question-configuration-save
router.post("/question-configuration-save", function (req, res) {
  // 1. Ensure formPages is initialized
  if (!req.session.data["formPages"]) {
    req.session.data["formPages"] = [];
  }

  // 2. Identify current page
  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const formPages = req.session.data["formPages"];
  const currentPage = formPages[pageIndex] || { questions: [] };

  if (!currentPage.questions) {
    currentPage.questions = [];
  }

  // 3. Read the question type & subtypes from session
  const questionType = req.session.data["currentQuestionType"];
  const writtenSubType = req.session.data["writtenSubType"];
  const dateSubType = req.session.data["dateSubType"];
  const listSubType = req.session.data["listSubType"];

  // 4. Determine the subtype
  let finalSubType = null;
  if (questionType === "text") {
    finalSubType = writtenSubType;
  } else if (questionType === "date") {
    finalSubType = dateSubType;
  } else if (questionType === "list") {
    finalSubType = listSubType;
  }

  // 5. Capture the question label
  let questionLabel = "";
  switch (questionType) {
    case "phone":
      questionLabel = req.body["questionLabelInputPhone"] || "Phone number";
      break;
    case "text":
      if (writtenSubType === "short-answer-nf") {
        questionLabel =
          req.body["questionLabelInputShortText"] || "Short answer";
      } else if (writtenSubType === "long-answer") {
        questionLabel = req.body["questionLabelInputTextArea"] || "Long answer";
      } else if (writtenSubType === "numbers") {
        questionLabel = req.body["questionLabelInputNumbers"] || "Numbers only";
      } else {
        questionLabel = req.body["questionLabelInputText"] || "Text question";
      }
      break;
    case "email":
      questionLabel = req.body["questionLabelInputEmail"] || "Email address";
      break;
    case "date":
      questionLabel = req.body["questionLabelInputDate"] || "Date question";
      break;
    case "address":
      questionLabel = req.body["questionLabelInputAddress"] || "Address";
      break;
    case "file":
      questionLabel = req.body["multiQuestionLabelInputFile"] || "File upload";
      break;
    case "list":
      if (listSubType === "yes-no") {
        questionLabel =
          req.body["questionLabelInputYesno"] || "Yes/No question";
      } else if (listSubType === "checkboxes") {
        questionLabel =
          req.body["multiQuestionLabelInputCheckboxes"] ||
          "Checkboxes question";
      } else if (listSubType === "radios") {
        questionLabel =
          req.body["multiQuestionLabelInputRadios"] || "Radios question";
      } else if (listSubType === "select") {
        questionLabel =
          req.body["questionLabelInputAutocomplete"] || "Select an option";
      } else {
        questionLabel = req.body["questionLabelInputList"] || "List question";
      }
      break;
    default:
      questionLabel = "Test question"; // Fallback
      break;
  }

  // 6. Capture the question hint
  let questionHint = req.body["questionHintInput"] || "";

  // 7. Capture the options (For Radio and Checkbox lists)
  let questionOptions = [];

  if (questionType === "list" && listSubType === "radios") {
    // Copy from currentPage.radioList
    questionOptions = [...(currentPage.radioList || [])];
  } else if (questionType === "list" && listSubType === "checkboxes") {
    // Copy from the question's existing .options array
    const existingQuestionIndex = req.session.data["currentQuestionIndex"];
    const existingQuestion = currentPage.questions[existingQuestionIndex];

    questionOptions = existingQuestion.options || [];
  }

  // 8. Create or update the question
  let existingQuestionIndex = req.session.data["currentQuestionIndex"];
  if (
    existingQuestionIndex !== undefined &&
    currentPage.questions[existingQuestionIndex]
  ) {
    // Update existing question
    currentPage.questions[existingQuestionIndex].label = questionLabel;
    currentPage.questions[existingQuestionIndex].hint = questionHint;
    currentPage.questions[existingQuestionIndex].options = questionOptions; // ✅ Save options
  } else {
    // Create new question
    const newQuestion = {
      questionId: Date.now(),
      label: questionLabel,
      hint: questionHint,
      type: questionType,
      subType: finalSubType,
      options: questionOptions, // ✅ Attach options
    };
    currentPage.questions.push(newQuestion);
  }

  // 9. Save back to session
  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  console.log(
    "✅ Updated formPages (saved options):",
    JSON.stringify(formPages, null, 2)
  );

  // 10. Redirect to the page overview
  res.redirect("/page-overview");
});

// **** PAGE OVERVIEW AND EDITING ****************************************************

//--------------------------------------
// 8. GET /page-overview
//    Display a summary of the questions on the current page
//--------------------------------------
router.get("/page-overview", function (req, res) {
  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const formPages = req.session.data["formPages"] || [];

  if (!formPages[pageIndex]) {
    console.log("⚠️ No current page found, redirecting...");
    return res.redirect("/form-editor/listing.html");
  }

  const currentPage = formPages[pageIndex];

  // Ensure the page has an ID
  if (!currentPage.pageId) {
    currentPage.pageId = Date.now(); // Generate an ID if one doesn't exist
    formPages[pageIndex] = currentPage;
    req.session.data["formPages"] = formPages;
  }

  // 🔍 Debugging: Log the questions and options before rendering
  currentPage.questions.forEach((question, index) => {
    console.log(
      `📌 Question #${index + 1}:`,
      JSON.stringify(question, null, 2)
    );
    if (question.type === "list" && question.subType === "radios") {
      console.log("✅ Radio Options:", question.options || []);
    }
  });

  console.log("📌 Current Page ID:", currentPage.pageId); // Debug log for page ID

  res.render("form-editor/page-overview", {
    currentPage,
  });
});

//--------------------------------------
// Edit page
//--------------------------------------
router.get("/edit-page/:pageId", function (req, res) {
  const pageId = req.params.pageId;
  const formPages = req.session.data["formPages"] || [];
  // Find the page to edit by matching pageId as a string
  const pageIndex = formPages.findIndex(
    (page) => String(page.pageId) === pageId
  );
  if (pageIndex === -1) {
    // If the page isn't found, redirect back to the listing page (or show an error)
    return res.redirect("/form-editor/listing.html");
  }
  // Set this page as the current page for editing
  req.session.data["currentPageIndex"] = pageIndex;

  // Redirect to the appropriate edit interface.
  const pageToEdit = formPages[pageIndex];
  if (pageToEdit.pageType === "question") {
    res.redirect("/page-overview");
  } else if (pageToEdit.pageType === "guidance") {
    res.redirect("/form-editor/question-type/guidance-configuration.html");
  } else {
    // Fallback
    res.redirect("/form-editor/listing.html");
  }
});

//--------------------------------------
// Edit an existing question
//--------------------------------------
router.get("/edit-question", function (req, res) {
  const questionId = (req.query.questionId || "").trim();
  console.log("Editing question with ID:", questionId);
  if (!questionId) {
    console.log("No questionId provided – redirecting to page overview.");
    return res.redirect("/page-overview");
  }

  // Retrieve formPages from session
  const formPages = req.session.data["formPages"] || [];

  // Search across all pages to find the matching question
  let foundPageIndex = -1;
  let foundQuestionIndex = -1;
  for (let i = 0; i < formPages.length; i++) {
    const qIndex = formPages[i].questions.findIndex(
      (q) => String(q.questionId) === questionId
    );
    if (qIndex !== -1) {
      foundPageIndex = i;
      foundQuestionIndex = qIndex;
      break;
    }
  }

  if (foundPageIndex === -1) {
    console.log("Question not found – redirecting to page overview.");
    return res.redirect("/page-overview");
  }

  // Set the found page as the current page for editing
  req.session.data["currentPageIndex"] = foundPageIndex;
  req.session.data["currentQuestionIndex"] = foundQuestionIndex;

  const question = formPages[foundPageIndex].questions[foundQuestionIndex];
  console.log("Editing question details:", question);

  // Also store the question type and its subtype
  req.session.data["currentQuestionType"] = question.type;
  if (question.type === "text") {
    req.session.data["writtenSubType"] = question.subType;
  } else if (question.type === "date") {
    req.session.data["dateSubType"] = question.subType;
  } else if (question.type === "list") {
    req.session.data["listSubType"] = question.subType;
  }

  res.redirect("/question-configuration");
});

// **** SAVING PAGE LEVEL CHANGES ****************************************************

//--------------------------------------
// 8a. POST /page-overview
//     Handle the user clicking "Save changes" on page-overview
//--------------------------------------
router.post("/page-overview", function (req, res) {
  console.log("req.body:", req.body);

  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const formPages = req.session.data["formPages"] || [];
  const currentPage = formPages[pageIndex] || {
    questions: [],
    pageType: "question",
    pageHeading: "",
    hasGuidance: false,
    guidanceTextarea: "",
    allowMultipleResponses: false,
    setName: "",
    minResponseCount: "",
    maxResponseCount: "",
  };

  // The page heading & guidance text
  const pageHeading = req.body.pageHeading || "";
  const guidanceTextarea = req.body.guidanceTextarea || "";

  // If "guidance" checkbox is checked, req.body.guidance === "guidance"
  currentPage.hasGuidance = req.body.guidance === "guidance";

  // The rest of your multiple responses logic
  let allowMultipleResponses = req.body.allowMultipleResponses;
  const questionSetName = req.body.questionSetName || "";
  const minResponseCount = req.body.minResponseCount || "";
  const maxResponseCount = req.body.maxResponseCount || "";

  if (Array.isArray(allowMultipleResponses)) {
    allowMultipleResponses = allowMultipleResponses.includes("true")
      ? "true"
      : "false";
  }

  // Update all page fields
  currentPage.pageHeading = pageHeading;
  currentPage.guidanceTextarea = guidanceTextarea;
  currentPage.allowMultipleResponses = allowMultipleResponses === "true";
  currentPage.setName = currentPage.allowMultipleResponses
    ? questionSetName
    : "";
  currentPage.minResponseCount = currentPage.allowMultipleResponses
    ? minResponseCount
    : "";
  currentPage.maxResponseCount = currentPage.allowMultipleResponses
    ? maxResponseCount
    : "";

  // Ensure we have a pageType
  if (!currentPage.pageType) {
    currentPage.pageType = "question";
  }

  // Save back to session
  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  console.log("Updated currentPage:", currentPage);
  res.redirect("/page-overview");
});

//--------------------------------------
// Test form (not specifically used in flow)
//--------------------------------------
router.post("/test-form", (req, res) => {
  // Grab the posted value(s)
  let allowMultipleResponses = req.body.allowMultipleResponses;

  // If it's an array of values, check if "true" is included
  if (Array.isArray(allowMultipleResponses)) {
    if (allowMultipleResponses.includes("true")) {
      allowMultipleResponses = "true";
    } else {
      allowMultipleResponses = "false";
    }
  }

  console.log("Final allowMultipleResponses:", allowMultipleResponses);
  res.send("Check your console for output");
});

// **** CHECKBOXES (ADD/EDIT/FINALIZE) ****************************************************
// Configure checkbox option route
router.post("/configure-checkbox-nf", function (req, res) {
  const currentPageIndex = req.session.data["currentPageIndex"];
  const questionIndex = req.session.data["currentQuestionIndex"];
  const formPages = req.session.data["formPages"];
  const currentPage = formPages[currentPageIndex];
  const currentQuestion = currentPage.questions[questionIndex];

  // Get the values from the form
  const label = req.body.label;
  const hint = req.body.hint;
  const value = req.body.value || label;

  // **Add a unique optionId here**
  const newOption = {
    optionId: Date.now(), // <---- UNIQUE ID
    label: req.body.label,
    value: value,
    hint: hint,
  };

  // Initialize options array if it doesn't exist
  if (!currentQuestion.options) {
    currentQuestion.options = [];
  }

  // Add the option to the question's options array
  currentQuestion.options.push(newOption);

  // Save back to session
  req.session.data["formPages"] = formPages;

  console.log("✅ Added checkbox option:", {
    questionId: currentQuestion.questionId,
    newOption,
    allOptions: currentQuestion.options,
  });

  res.redirect("/form-editor/question-type/checkboxes-nf/edit");
});

// Route to save the checkbox option
router.post("/save-checkbox-option", (req, res) => {
  const optionId = parseInt(req.body.optionId, 10); // The unique ID from the form
  const currentPageIndex = req.session.data["currentPageIndex"];
  const questionIndex = req.session.data["currentQuestionIndex"];
  const formPages = req.session.data["formPages"];
  const currentQuestion = formPages[currentPageIndex].questions[questionIndex];

  // Find the matching option by `optionId`
  const foundIndex = currentQuestion.options.findIndex(
    (opt) => opt.optionId === optionId
  );
  if (foundIndex !== -1) {
    currentQuestion.options[foundIndex].label = req.body["option-label"];
    currentQuestion.options[foundIndex].hint = req.body["option-hint"];
    currentQuestion.options[foundIndex].value = req.body["option-value"];
  }

  // Save back to session
  req.session.data["formPages"] = formPages;

  res.redirect("/form-editor/question-type/checkboxes-nf/edit");
});

// Route to save the checkbox option
router.post("/save-option", (req, res) => {
  const index = parseInt(req.body.index, 10); // Get the index from the form
  const checkboxList = req.session.data.checkboxList; // Access the checkboxList array

  if (checkboxList && checkboxList[index]) {
    // Update the data at the specified index
    checkboxList[index].label = req.body["option-label"];
    checkboxList[index].hint = req.body["option-hint"];
    checkboxList[index].value = req.body["option-value"];
  }

  // Redirect back to the edit page for checkboxes
  res.redirect("/form-editor/question-type/checkboxes-nf/edit");
});

/// Route to access the edit page for checkboxes
router.get(
  "/form-editor/question-type/checkboxes-nf/edit",
  function (req, res) {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"];
    const questionIndex = req.session.data["currentQuestionIndex"];

    console.log("Loading edit page:", {
      pageIndex,
      questionIndex,
      formPages,
    });

    const currentPage = formPages[pageIndex];
    if (!currentPage) {
      console.error("Page not found");
      return res.redirect("/form-editor/listing.html");
    }

    const currentQuestion = currentPage.questions[questionIndex];
    if (!currentQuestion) {
      console.error("Question not found");
      return res.redirect("/form-editor/question-type/checkboxes-nf/add.html");
    }

    res.render("form-editor/question-type/checkboxes-nf/edit.html", {
      currentPageIndex: pageIndex,
      currentQuestionIndex: questionIndex,
      formPages: formPages,
    });
  }
);

// -------------
//  /checkboxes-finalize
// -------------
router.post("/checkboxes-finalize", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const pageIndex = req.session.data["currentPageIndex"];
  const questionIndex = req.session.data["currentQuestionIndex"];

  console.log(
    "Before finalize - Current question:",
    formPages[pageIndex].questions[questionIndex]
  );

  // Get the current question
  const currentQuestion = formPages[pageIndex].questions[questionIndex];

  // IMPORTANT: Keep the existing options array
  const existingOptions = currentQuestion.options || [];

  // Update the question with final values while preserving options
  formPages[pageIndex].questions[questionIndex] = {
    ...currentQuestion,
    label: req.body.multiQuestionLabelInputCheckboxes || "Checkboxes question",
    hint: req.body.questionHintTextInputCheckboxes || "",
    options: existingOptions, // Preserve the options array
  };

  // Save back to session
  req.session.data["formPages"] = formPages;

  console.log(
    "After finalize - Updated question:",
    formPages[pageIndex].questions[questionIndex]
  );

  res.redirect("/page-overview");
});

// **** RADIOS ROUTES (ADD/EDIT/FINALIZE) ****************************************************

// Update the configure-radio-nf route to ensure options are being saved properly
router.post("/configure-radio-nf", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const pageIndex = req.session.data["currentPageIndex"];

  // Ensure we have a valid page
  if (!formPages[pageIndex]) {
    formPages[pageIndex] = { questions: [], radioList: [] };
  }

  const currentPage = formPages[pageIndex];

  // Ensure radioList exists on the page object
  if (!currentPage.radioList) {
    currentPage.radioList = [];
  }

  // Create new radio option
  const radioOption = {
    label: req.body.label,
    value: req.body.value || req.body.label.toLowerCase().replace(/\s+/g, "-"),
    hint: req.body.hint || "",
  };

  // Add to radioList
  currentPage.radioList.push(radioOption);

  // Save back to session
  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  // Log the state after adding option
  console.log("✅ Added radio option:", {
    radioOption,
    currentPage,
    radioList: currentPage.radioList,
  });

  res.redirect("/form-editor/question-type/radios-nf/edit");
});

// Edit page for radio options
router.get("/form-editor/question-type/radios-nf/edit", (req, res) => {
  const formPages = req.session.data["formPages"] || [];
  const pageIndex = req.session.data["currentPageIndex"] || 0;

  // Ensure current page exists
  if (!formPages[pageIndex]) {
    console.log("⚠️ No current page found, redirecting...");
    return res.redirect("/form-editor/question-type/radios-nf/add.html");
  }

  const currentPage = formPages[pageIndex];

  // Ensure radioList exists
  currentPage.radioList = currentPage.radioList || [];

  console.log("Current radio options:", currentPage.radioList);

  // Pass the radioList to the template
  res.render("form-editor/question-type/radios-nf/edit.html", {
    radioList: currentPage.radioList,
  });
});

// Route to access the edit page for radio buttons
router.get("/form-editor/question-type/radios-nf/edit", (req, res) => {
  const radioList = req.session.data?.radioList || [];

  // Check if the radioList is empty, redirect to the add page if so
  if (radioList.length === 0) {
    res.redirect("/form-editor/question-type/radios-nf/add.html");
  } else {
    // Render the edit page if there are items in the list
    res.render("/form-editor/question-type/radios-nf/edit.html", {
      radioList: radioList,
    });
  }
});

router.post("/update-radio-label", function (req, res) {
  // Update the session with the provided label
  req.session.data.currentRadioQuestionLabel = req.body.label || "";
  res.json({ success: true });
});

// -------------
//  /radios-finalize
// -------------
router.post("/radios-finalize", (req, res) => {
  const questionLabel = req.body.questionLabelInputRadios || "Radios question";

  // Ensure formPages exist
  req.session.data["formPages"] = req.session.data["formPages"] || [];

  // Ensure currentPage exists
  const pageIndex = req.session.data["currentPageIndex"];
  if (pageIndex === undefined || !req.session.data["formPages"][pageIndex]) {
    console.log("⚠️ No current page found, creating a new one...");
    req.session.data["formPages"].push({
      pageId: Date.now(),
      pageType: "question",
      questions: [],
      radioList: [],
    });
    req.session.data["currentPageIndex"] =
      req.session.data["formPages"].length - 1;
  }

  const currentPage =
    req.session.data["formPages"][req.session.data["currentPageIndex"]];

  // 🔥 Ensure `radioList` is defined for this page
  currentPage.radioList = currentPage.radioList || [];

  // ✅ Move `radioList` into the new question
  const newQuestion = {
    questionId: Date.now(),
    label: questionLabel,
    hint: "",
    type: "list",
    subType: "radios",
    options: [...currentPage.radioList], // ✅ FIX: Store options properly
  };

  // Push the new question into the questions array
  currentPage.questions.push(newQuestion);

  // ✅ Save back to session
  req.session.data["formPages"] = req.session.data["formPages"];

  // ✅ Clear `radioList` **only after** assigning it to `options`
  currentPage.radioList = [];

  console.log(
    "✅ Final Question Object (with options):",
    JSON.stringify(newQuestion, null, 2)
  );

  res.redirect("/page-overview");
});

// **** CONDITIONS ROUTES ****************************************************

//--------------------------------------
// GET /conditions
// Show conditions for the current page
//--------------------------------------

// Helper function to find a question by ID
function findQuestionById(formPages, questionId) {
  for (const page of formPages) {
    if (page.questions) {
      for (const question of page.questions) {
        if (question.questionId.toString() === questionId.toString()) {
          return {
            ...question,
            label: question.label || question.text, // Ensure we have a label
          };
        }
      }
    }
  }
  return null;
}

router.get("/conditions/:pageId", function (req, res) {
  const pageId = parseInt(req.params.pageId, 10);
  const formPages = req.session.data["formPages"] || [];

  // Find the current page
  const currentPage = formPages.find((page) => page.pageId === pageId);

  if (!currentPage) {
    console.log("Page not found:", pageId);
    return res.redirect("/form-editor/listing.html");
  }

  // Get the page index and create a label
  const pageIndex = formPages.indexOf(currentPage);

  // Get the page heading based on page type
  let pageLabel;
  if (currentPage.pageType === "guidance") {
    pageLabel = `Page ${pageIndex + 1}: ${
      currentPage.guidanceOnlyHeadingInput
    }`;
  } else if (currentPage.pageHeading) {
    pageLabel = `Page ${pageIndex + 1}: ${currentPage.pageHeading}`;
  } else if (currentPage.questions && currentPage.questions.length > 0) {
    pageLabel = `Page ${pageIndex + 1}: ${currentPage.questions[0].label}`;
  } else {
    pageLabel = `Page ${pageIndex + 1}`;
  }

  // Get available questions for conditions
  let availableQuestions = [];
  formPages.forEach((page) => {
    if (page.questions) {
      page.questions.forEach((question) => {
        if (["yes-no", "radios", "checkboxes"].includes(question.subType)) {
          availableQuestions.push({
            value: question.questionId,
            text: question.label,
            type: question.subType,
            options: question.options || [],
          });
        }
      });
    }
  });

  // Collect all conditions from all pages except current page
  let allConditions = [];
  formPages.forEach((page) => {
    if (page.conditions && page.pageId !== pageId) {
      page.conditions.forEach((condition) => {
        allConditions.push({
          value: condition.id,
          text: condition.conditionName,
          hint: condition.rules
            .map(
              (rule) => `${rule.questionText} ${rule.operator} ${rule.value}`
            )
            .join(" AND "),
        });
      });
    }
  });

  // For the dropdowns
  const defaultExistingOption = {
    value: "",
    text: "Select an existing condition",
    selected: true,
  };
  const defaultNewOption = {
    value: "",
    text: "Select a question",
    selected: true,
  };

  const combinedExistingConditions = [defaultExistingOption, ...allConditions];
  const combinedQuestions = [defaultNewOption, ...availableQuestions];

  // Store current page ID in session
  req.session.data["currentPageId"] = pageId;

  res.render("form-editor/conditions.html", {
    currentPage: currentPage,
    pageId: pageId,
    question: {
      label: pageLabel,
    },
    availableQuestions: combinedQuestions,
    availableConditions: combinedExistingConditions,
    conditions: currentPage.conditions || [],
    isGuidancePage: currentPage.pageType === "guidance",
  });
});

//--------------------------------------
// 2. POST /conditions-add
//    Add a new condition to the page
//--------------------------------------
router.post("/conditions-add", function (req, res) {
  console.log("Current conditions:", req.session.data.conditions || []);
  console.log("Adding condition - Debug info:", {
    pageId: req.session.data.currentPageId,
    availablePages: req.session.data.formPages?.map((p) => p.pageId),
    body: req.body,
  });

  // Add this debug log
  console.log("Raw request body:", {
    conditionName: req.body.conditionName,
    question: req.body.question,
    operator: req.body.operator,
    "condition-value": req.body["condition-value"],
    allKeys: Object.keys(req.body),
  });

  // Get the current page
  const pageId = req.session.data.currentPageId;
  const formPages = req.session.data.formPages || [];
  const currentPage = formPages.find((page) => page.pageId === pageId);

  if (!currentPage) {
    console.error("Current page not found");
    return res.redirect("back");
  }

  // Initialize conditions array if it doesn't exist
  currentPage.conditions = currentPage.conditions || [];

  if (req.body.conditionType === "existing") {
    // Handle existing condition
    const existingConditionId = parseInt(req.body.existingConditionId);

    // Find the existing condition from all pages
    let existingCondition = null;
    for (const page of formPages) {
      if (page.conditions) {
        const found = page.conditions.find((c) => c.id === existingConditionId);
        if (found) {
          existingCondition = found;
          break;
        }
      }
    }

    console.log("Found existing condition:", existingCondition);

    if (existingCondition) {
      // Create a deep copy of the existing condition with a new ID
      const newCondition = {
        id: Date.now(),
        conditionName: existingCondition.conditionName,
        rules: existingCondition.rules.map((rule) => ({
          questionText: rule.questionText,
          operator: rule.operator,
          value: rule.value,
          logicalOperator: rule.logicalOperator,
        })),
        text: existingCondition.text,
      };

      console.log("New condition created from existing:", newCondition);
      currentPage.conditions.push(newCondition);
    } else {
      console.error(
        "Could not find existing condition with ID:",
        existingConditionId
      );
    }
  } else {
    // Handle new condition
    let rules;
    try {
      if (req.body.rules) {
        // Debug log to see what's coming in
        console.log("Form data received:", {
          conditionName: req.body.conditionName,
          rules: req.body.rules,
          entireBody: req.body,
        });

        // Parse rules if it's a string, or use directly if it's already an object
        rules =
          typeof req.body.rules === "string"
            ? JSON.parse(req.body.rules)
            : req.body.rules;

        if (!Array.isArray(rules)) {
          rules = [rules];
        }
      } else {
        console.error("No rules provided in request");
        rules = [];
      }
    } catch (e) {
      console.error("Error handling rules:", e);
      console.error(e);
      rules = [];
    }

    // Create the new condition
    const newCondition = {
      id: Date.now(),
      conditionName: req.body.conditionName,
      rules: rules.map((rule) => ({
        questionText: rule.questionText,
        operator: rule.operator,
        value: rule.value,
        logicalOperator: rule.logicalOperator,
      })),
      text: rules
        .map((rule) => {
          // Only use "or" formatting for checkbox values (which come as arrays)
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          return `${rule.questionText} ${rule.operator} ${valueText}`;
        })
        .join(" AND "),
    };

    console.log("New condition created:", newCondition);
    currentPage.conditions.push(newCondition);
  }

  console.log("Updated page conditions:", currentPage.conditions);

  // Save back to session
  req.session.data.formPages = formPages;

  // Replace deprecated redirect with secure version
  const returnUrl = `/conditions/${req.session.data.currentPageId}`;
  res.redirect(returnUrl);
});

//--------------------------------------
// 3. POST /conditions-remove
//    Remove a condition
//--------------------------------------
router.post("/conditions-remove", function (req, res) {
  const pageId = req.session.data["currentPageId"]; // Get the stored page ID
  const formPages = req.session.data["formPages"] || [];

  // Find the specific page by ID
  const pageIndex = formPages.findIndex((page) => page.pageId === pageId);

  if (pageIndex === -1) {
    console.log("⚠️ Page not found:", pageId);
    return res.redirect("/form-editor/listing.html");
  }

  // Remove condition by ID
  const conditionId = req.body.conditionId;
  formPages[pageIndex].conditions = formPages[pageIndex].conditions.filter(
    (c) => c.id.toString() !== conditionId
  );

  // Save back to session
  req.session.data["formPages"] = formPages;

  console.log("✅ Removed condition from page:", pageId);
  console.log("Current conditions:", formPages[pageIndex].conditions);

  res.redirect(`/conditions/${pageId}`);
});

// **** PAGE REORDERING ****************************************************

router.get("/form-editor/reorder/main.html", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  res.render("form-editor/reorder/main.html", { formPages: formPages });
});

router.post("/update-page-order", function (req, res) {
  const orderedIds = req.body.orderedIds;
  if (!orderedIds || !Array.isArray(orderedIds)) {
    return res.json({ success: false, message: "Invalid order provided" });
  }

  // Get the existing pages from session
  const formPages = req.session.data["formPages"] || [];

  // Build a new array in the order specified by orderedIds
  const newOrder = [];
  orderedIds.forEach((id) => {
    const page = formPages.find((page) => String(page.pageId) === id);
    if (page) {
      newOrder.push(page);
    }
  });

  // If we have a valid new order, update the session and respond with success
  if (newOrder.length > 0) {
    req.session.data["formPages"] = newOrder;
    console.log(
      "Updated formPages order:",
      newOrder.map((page) => page.pageId)
    );
    return res.json({ success: true });
  } else {
    return res.json({
      success: false,
      message: "No pages found for the new order",
    });
  }
});

// Update the delete page route
router.get("/form-editor/delete/:pageId", function (req, res) {
  const pageId = parseInt(req.params.pageId, 10);
  const formPages = req.session.data["formPages"] || [];

  console.log("Delete confirmation page:", {
    requestedPageId: pageId,
    availablePages: formPages.map((p) => p.pageId),
  });

  const currentPage = formPages.find((page) => page.pageId === pageId);

  if (!currentPage) {
    console.log("Page not found:", pageId);
    return res.redirect("/form-editor/listing.html");
  }

  console.log("Found page to delete:", {
    pageId: currentPage.pageId,
    heading: currentPage.pageHeading,
  });

  res.render("form-editor/delete", {
    currentPage: currentPage,
    pageTitle: currentPage.pageHeading || "Untitled page",
  });
});

// Update the guidance overview route
router.post("/form-editor/guidance/overview", function (req, res) {
  console.log("Form data received:", req.body);

  const formPages = req.session.data["formPages"] || [];
  const pageIndex = req.session.data["currentPageIndex"];

  // Create or update the guidance page
  const guidancePage = {
    pageId: pageIndex !== undefined ? formPages[pageIndex]?.pageId : Date.now(),
    pageType: "guidance",
    guidanceOnlyHeadingInput: req.body.guidanceOnlyHeadingInput,
    guidanceOnlyGuidanceTextInput: req.body.guidanceOnlyGuidanceTextInput,
    isExitPage: Array.isArray(req.body.exitPage)
      ? req.body.exitPage.includes("true")
      : req.body.exitPage === "true",
    questions: [],
    conditions: [], // Initialize empty conditions array
  };

  // Add or update the page
  if (pageIndex !== undefined) {
    formPages[pageIndex] = guidancePage;
  } else {
    formPages.push(guidancePage);
    req.session.data["currentPageIndex"] = formPages.length - 1;
  }

  req.session.data["formPages"] = formPages;

  // Add this to pass the currentPage to the template
  res.render("form-editor/question-type/guidance-configuration", {
    currentPage: guidancePage,
    data: req.session.data,
  });
});

// Add this GET route for guidance configuration
router.get(
  "/form-editor/question-type/guidance-configuration.html",
  function (req, res) {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"];

    // Get the current page from the session
    const currentPage = formPages[pageIndex];

    if (!currentPage) {
      console.log("No current page found:", {
        pageIndex,
        formPagesLength: formPages.length,
      });
      return res.redirect("/form-editor/listing.html");
    }

    console.log("Rendering guidance config with page:", currentPage);

    res.render("form-editor/question-type/guidance-configuration", {
      currentPage: currentPage,
      data: req.session.data,
    });
  }
);

//--------------------------------------
// Edit an existing guidance page
//--------------------------------------
router.get("/form-editor/edit-guidance", function (req, res) {
  const pageId = (req.query.pageId || "").trim();
  console.log("Editing guidance page with ID:", pageId);

  if (!pageId) {
    console.log("No pageId provided – redirecting to listing.");
    return res.redirect("/form-editor/listing.html");
  }

  // Retrieve formPages from session
  const formPages = req.session.data["formPages"] || [];

  // Find the guidance page
  const foundPageIndex = formPages.findIndex(
    (page) => String(page.pageId) === pageId && page.pageType === "guidance"
  );

  if (foundPageIndex === -1) {
    console.log("Guidance page not found – redirecting to listing.");
    return res.redirect("/form-editor/listing.html");
  }

  // Set the found page as the current page for editing
  req.session.data["currentPageIndex"] = foundPageIndex;

  const guidancePage = formPages[foundPageIndex];
  console.log("Editing guidance page details:", guidancePage);

  res.redirect("/form-editor/question-type/guidance-configuration.html");
});

// Delete page route
router.post("/delete-page", function (req, res) {
  const pageId = parseInt(req.body.pageId, 10);
  const formPages = req.session.data["formPages"] || [];

  // Find and remove the page
  const pageIndex = formPages.findIndex((page) => page.pageId === pageId);
  if (pageIndex !== -1) {
    formPages.splice(pageIndex, 1);
    req.session.data["formPages"] = formPages;
  }

  // Redirect back to the listing page
  res.redirect("/form-editor/listing.html");
});

// Add preview route
router.get("/form-editor/preview", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  console.log("Rendering preview with form pages:", formPages);
  res.render("form-editor/preview", {
    data: {
      formPages: formPages,
    },
  });
});

// Form creation flow - simple routes without validation
router.get("/create-new-form/form-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Generate form ID if not already exists
  if (!req.session.data.formId) {
    req.session.data.formId = `FORM-${Date.now()}`;
  }

  // Log current session data
  console.log("Current session data:", req.session.data);

  res.render("create-new-form/form-name", {
    data: req.session.data,
  });
});

router.post("/create-new-form/form-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store form name from the request body
  const formName = req.body.formName;

  // Update session data
  req.session.data = {
    ...req.session.data,
    formId: req.session.data.formId || `FORM-${Date.now()}`,
    formName: formName,
    formDetails: {
      id: req.session.data.formId || `FORM-${Date.now()}`,
      name: formName,
      createdAt: new Date().toISOString(),
      status: "draft",
    },
  };

  // Log the updated session data
  console.log("Updated session data after form name:", req.session.data);

  res.redirect("/create-new-form/organisation-name");
});

router.get("/create-new-form/organisation-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Log current session data
  console.log("Current session data:", req.session.data);

  // Check if we have a form name before proceeding
  if (!req.session.data.formName) {
    return res.redirect("/create-new-form/form-name");
  }

  res.render("create-new-form/organisation-name", {
    data: req.session.data,
  });
});

router.post("/create-new-form/organisation-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store organisation name from the request body
  const organisationName = req.body.organisationName;

  // Update session data
  req.session.data = {
    ...req.session.data,
    organisationName: organisationName,
    formDetails: {
      ...req.session.data.formDetails,
      organisation: organisationName,
    },
  };

  // Log the updated session data
  console.log("Updated session data after organisation:", req.session.data);

  res.redirect("/create-new-form/policy-sme");
});

router.get("/create-new-form/policy-sme", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Log current session data
  console.log("Current session data:", req.session.data);

  // Check if we have the required data before proceeding
  if (!req.session.data.formName || !req.session.data.organisationName) {
    return res.redirect("/create-new-form/form-name");
  }

  res.render("create-new-form/policy-sme", {
    data: req.session.data,
  });
});

router.post("/create-new-form/policy-sme", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Store team details from the request body
  // Ensure we get the first value if it's an array, or the value itself if it's a string
  const teamName = Array.isArray(req.body.teamName)
    ? req.body.teamName[0]
    : req.body.teamName;
  const email = Array.isArray(req.body.email)
    ? req.body.email[0]
    : req.body.email;

  // Update session data
  req.session.data = {
    ...req.session.data,
    teamName: teamName,
    email: email,
    formDetails: {
      ...req.session.data.formDetails,
      teamName: teamName,
      email: email,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Log the final session data
  console.log("Final session data:", req.session.data);

  res.redirect("/cph-overview/draft/default");
});

/* dictionary stuff */

const path = require("path");

// Finally, export the router
module.exports = router;
