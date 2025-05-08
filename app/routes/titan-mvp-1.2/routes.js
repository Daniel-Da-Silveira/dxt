const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();
const fs = require("fs");
const path = require("path");
const lists = require("../../routes/lists");
const sections = require("../../routes/sections");
const terms = require("../../data/dictionary.json");

// Add middleware to make terms available to all templates
router.use((req, res, next) => {
  res.locals.commonTerms = terms;
  next();
});

// Add middleware to initialize form name in session data
router.use((req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  if (!req.session.data.formName) {
    req.session.data.formName = "Form name";
  }
  next();
});

// Add middleware to initialize users in session data
router.use((req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  if (!req.session.data.users) {
    req.session.data.users = [
      {
        email: "chris.smith@defra.gov.uk",
        role: "Admin",
      },
      {
        email: "laura.parker@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "maria.garcia@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "james.wilson@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "sarah.johnson@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "michael.brown@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "emma.davis@defra.gov.uk",
        role: "Form creator",
      },
      {
        email: "david.miller@defra.gov.uk",
        role: "Admin",
      },
    ];
  }
  next();
});

// ── LISTS ROUTES ───────────────────────────────────────────────────────────────

// Non-prefixed URLs
router.get("/form-editor/new-list", (req, res) =>
  res.render("titan-mvp-1.2/form-editor/lists/new")
);
router.post("/form-editor/new-list", lists.post);
router.get("/form-editor/list-manager", lists.get);
router.get("/form-editor/edit-list/:name", lists.editGet);
router.post("/form-editor/update-list/:name", lists.editPost);
router.post("/form-editor/delete-list/:name", lists.delete);
router.get("/form-editor/api/lists", lists.getListsAPI);
router.get("/form-editor/api/list/:name", lists.getListAPI);
router.get("/form-editor/view-list/:name", lists.viewGet);

// Prefixed URLs
router.get("/titan-mvp-1.2/form-editor/new-list", (req, res) =>
  res.render("titan-mvp-1.2/form-editor/lists/new")
);
router.post("/titan-mvp-1.2/form-editor/new-list", lists.post);
router.get("/titan-mvp-1.2/form-editor/list-manager", lists.get);
router.get("/titan-mvp-1.2/form-editor/edit-list/:name", lists.editGet);
router.post("/titan-mvp-1.2/form-editor/update-list/:name", lists.editPost);
router.post("/titan-mvp-1.2/form-editor/delete-list/:name", lists.delete);
router.get("/titan-mvp-1.2/form-editor/api/lists", lists.getListsAPI);
router.get("/titan-mvp-1.2/form-editor/api/list/:name", lists.getListAPI);
router.get("/titan-mvp-1.2/form-editor/view-list/:name", lists.viewGet);

// ── SECTIONS ROUTES ────────────────────────────────────────────────────────────

// Mount shared sections router
router.use("/form-editor", sections);
router.use("/titan-mvp-1.2/form-editor", sections);

// One-off sections management page (non-prefixed)
router.get("/form-editor/sections", (req, res) => {
  const formData = req.session.data || {};
  const allSections = formData.sections || [];
  const formPages = formData.formPages || [];

  res.render("titan-mvp-1.2/form-editor/sections.html", {
    form: { name: formData.formName || "Form name" },
    sections: allSections,
    formPages,
  });
});

// One-off sections management page (prefixed)
router.get("/titan-mvp-1.2/form-editor/sections", (req, res) => {
  const formData = req.session.data || {};
  const allSections = formData.sections || [];
  const formPages = formData.formPages || [];

  res.render("titan-mvp-1.2/form-editor/sections.html", {
    form: { name: formData.formName || "Form name" },
    sections: allSections,
    formPages,
  });
});

// Add non-.html route for sections
router.get("/titan-mvp-1.2/form-editor/sections.html", (req, res) => {
  const formData = req.session.data || {};
  const allSections = formData.sections || [];
  const formPages = formData.formPages || [];
  res.render("titan-mvp-1.2/form-editor/sections.html", {
    form: { name: formData.formName || "Form name" },
    sections: allSections,
    formPages,
  });
});

// Add non-.html route for conditions/page-level
router.get(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formPages.findIndex(
      (page) => String(page.pageId) === req.params.pageId
    );
    const currentPage = formPages[pageIndex] || {};
    const pageNumber = pageIndex + 1;
    const conditions = currentPage.conditions || [];
    res.render("titan-mvp-1.2/form-editor/conditions/page-level.html", {
      form: { name: formData.formName || "Form name" },
      currentPage,
      pageNumber,
      conditions,
      question: currentPage.questions ? currentPage.questions[0] : {},
      existingConditions: [], // You may want to populate this as needed
    });
  }
);

// Form-level conditions management (manager)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/manager",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data["formPages"] || [];
    const conditions = formData.conditions || [];
    const conditionSaved = req.query.conditionSaved === "true";

    // Get all available questions for conditions
    const availableQuestions = formPages
      .flatMap((page) => page.questions)
      .filter((question) => {
        const type = question.subType || question.type;
        return ["radios", "checkboxes", "yes-no"].includes(type);
      })
      .map((question) => ({
        value: question.questionId,
        text: question.label,
        type: question.subType || question.type,
        options: question.options,
      }));

    res.render("titan-mvp-1.2/form-editor/conditions/manager", {
      form: {
        name: formData.formName || "Form name",
      },
      availableQuestions: availableQuestions,
      conditions: conditions,
      formPages: formPages,
      conditionSaved: conditionSaved,
    });
  }
);

// ── FORM EDITOR ROUTES ─────────────────────────────────────────────────────────

// Listing and setup routes
router.get("/titan-mvp-1.2/form-editor/listing", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};

  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    page.questions.forEach((question) => {
      if (question.subType === "radios" || question.subType === "checkboxes") {
        question.options = question.options || [];
      }
    });
  });

  // Get all sections
  const sections = formData.sections || [];

  // Clear the success flag after showing it
  if (formData.showUploadSuccess) {
    delete req.session.data.showUploadSuccess;
  }

  res.render("titan-mvp-1.2/form-editor/listing/index", {
    formPages,
    sections,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Add non-.html route for listing
router.get("/titan-mvp-1.2/form-editor/listing.html", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};
  // Ensure each question inside each page has its own options array
  formPages.forEach((page) => {
    page.questions.forEach((question) => {
      if (question.subType === "radios" || question.subType === "checkboxes") {
        question.options = question.options || [];
      }
    });
  });
  // Get all sections
  const sections = formData.sections || [];
  // Clear the success flag after showing it
  if (formData.showUploadSuccess) {
    delete req.session.data.showUploadSuccess;
  }
  res.render("titan-mvp-1.2/form-editor/listing/index", {
    formPages,
    sections,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Page type selection
router.get("/titan-mvp-1.2/form-editor/page-type.html", function (req, res) {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/page-type.html", {
    commonTerms: terms,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Add non-.html route for page-type
router.get("/titan-mvp-1.2/form-editor/page-type", function (req, res) {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/page-type.html", {
    commonTerms: terms,
    form: {
      name: formData.formName || "Form name",
    },
  });
});

// Question number handling
router.post("/titan-mvp-1.2/question-number", function (req, res) {
  const pageType = req.session.data["questionnumber"];

  if (!req.session.data["formPages"]) {
    req.session.data["formPages"] = [];
  }

  const newPage = {
    pageId: Date.now(),
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

  const formPages = req.session.data["formPages"];
  formPages.push(newPage);
  req.session.data["currentPageIndex"] = formPages.length - 1;

  if (pageType === "oncenf") {
    return res.redirect("/titan-mvp-1.2/form-editor/information-type-nf.html");
  } else if (pageType === "guidance") {
    return res.redirect(
      "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html"
    );
  } else {
    return res.redirect("/titan-mvp-1.2/form-editor/page-type.html");
  }
});

// Information type handling
router.post("/titan-mvp-1.2/information-type-answer-nf", function (req, res) {
  const mainType = req.body["informationQuestion1"];
  const writtenSubType = req.body["written"];
  const dateSubType = req.body["dateType"];
  const listSubType = req.body["listType"];

  const formPages = req.session.data["formPages"] || [];
  const pageIndex = req.session.data["currentPageIndex"];

  if (pageIndex === undefined || !formPages[pageIndex]) {
    console.error("❌ Current page not found in session");
    return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
  }

  const currentPage = formPages[pageIndex];
  const questionIndex = req.session.data["currentQuestionIndex"] || 0;

  req.session.data["currentQuestionType"] = mainType;
  req.session.data["writtenSubType"] = writtenSubType;
  req.session.data["dateSubType"] = dateSubType;
  req.session.data["listSubType"] = listSubType;

  const newQuestion = {
    questionId: Date.now(),
    type: mainType,
    subType: listSubType || dateSubType || writtenSubType,
    label: "New question",
    options: [],
  };

  if (mainType === "list" && listSubType === "checkboxes") {
    newQuestion.type = "list";
    newQuestion.subType = "checkboxes";
    newQuestion.options = [];
    if (!currentPage.checkboxList) {
      currentPage.checkboxList = [];
    }
  }

  currentPage.questions.push(newQuestion);
  req.session.data["currentQuestionIndex"] = currentPage.questions.length - 1;
  req.session.data["formPages"] = formPages;

  if (mainType === "list") {
    if (listSubType === "radios") {
      return res.redirect(
        "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit"
      );
    } else if (listSubType === "checkboxes") {
      return res.redirect(
        "/titan-mvp-1.2/form-editor/question-type/checkboxes/edit"
      );
    }
  }

  res.redirect("/titan-mvp-1.2/question-configuration");
});

// Question configuration
router.get("/titan-mvp-1.2/question-configuration", function (req, res) {
  const formData = req.session.data || {};
  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const pageNumber = pageIndex + 1;
  const questionIndex = req.session.data["currentQuestionIndex"] || 0;
  const questionNumber = questionIndex + 1;

  const mainType = req.session.data["currentQuestionType"];
  const writtenSubType = req.session.data["writtenSubType"];
  const dateSubType = req.session.data["dateSubType"];
  const listSubType = req.session.data["listSubType"];

  let templateToRender =
    "/titan-mvp-1.2/form-editor/question-type/default.html";

  if (mainType === "text") {
    if (writtenSubType === "short-answer-nf") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/shorttext/edit-nf.html";
    } else if (writtenSubType === "long-answer") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/textarea/edit-nf.html";
    } else if (writtenSubType === "numbers") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/numbers/edit-nf.html";
    }
  } else if (mainType === "date") {
    if (dateSubType === "day-month-year") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/date/edit-nf.html";
    } else if (dateSubType === "month-year") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/date-mmyy/edit-nf.html";
    }
  } else if (mainType === "address") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/address/edit-nf.html";
  } else if (mainType === "phone") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/phone/edit-nf.html";
  } else if (mainType === "file") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/fileupload/edit-nf.html";
  } else if (mainType === "email") {
    templateToRender =
      "/titan-mvp-1.2/form-editor/question-type/email/edit-nf.html";
  } else if (mainType === "list") {
    if (listSubType === "yes-no") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/yesno/edit-nf.html";
    } else if (listSubType === "checkboxes") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/checkboxes/edit.html";
    } else if (listSubType === "radios") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit.html";
    } else if (listSubType === "select") {
      templateToRender =
        "/titan-mvp-1.2/form-editor/question-type/autocomplete-nf/edit.html";
    }
  }

  res.render(templateToRender, {
    form: {
      name: formData.formName || "Form name",
    },
    pageNumber: pageNumber,
    questionNumber: questionNumber,
    data: formData,
  });
});

// Question configuration save
router.post("/titan-mvp-1.2/question-configuration-save", function (req, res) {
  if (!req.session.data["formPages"]) {
    req.session.data["formPages"] = [];
  }

  const pageIndex = req.session.data["currentPageIndex"] || 0;
  const formPages = req.session.data["formPages"];
  const currentPage = formPages[pageIndex] || { questions: [] };

  if (!currentPage.questions) {
    currentPage.questions = [];
  }

  const questionType = req.session.data["currentQuestionType"];
  const writtenSubType = req.session.data["writtenSubType"];
  const dateSubType = req.session.data["dateSubType"];
  const listSubType = req.session.data["listSubType"];

  let finalSubType = null;
  if (questionType === "text") {
    finalSubType = writtenSubType;
  } else if (questionType === "date") {
    finalSubType = dateSubType;
  } else if (questionType === "list") {
    finalSubType = listSubType;
  } else if (questionType === "address") {
    finalSubType = "address";
  }

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
      questionLabel = "Test question";
      break;
  }

  let questionHint = "";
  if (questionType === "address") {
    questionHint = req.body["hintTextInputAddress"] || "";
  } else {
    questionHint = req.body["questionHintInput"] || "";
  }

  let questionOptions = [];

  if (questionType === "list" && listSubType === "radios") {
    questionOptions = [...(currentPage.radioList || [])];
  } else if (questionType === "list" && listSubType === "checkboxes") {
    const existingQuestionIndex = req.session.data["currentQuestionIndex"];
    const existingQuestion = currentPage.questions[existingQuestionIndex];
    questionOptions = existingQuestion.options || [];
  }

  let existingQuestionIndex = req.session.data["currentQuestionIndex"];
  if (
    existingQuestionIndex !== undefined &&
    currentPage.questions[existingQuestionIndex]
  ) {
    currentPage.questions[existingQuestionIndex].label = questionLabel;
    currentPage.questions[existingQuestionIndex].hint = questionHint;
    currentPage.questions[existingQuestionIndex].options = questionOptions;
  } else {
    const newQuestion = {
      questionId: Date.now(),
      label: questionLabel,
      hint: questionHint,
      type: questionType,
      subType: finalSubType,
      options: questionOptions,
    };
    currentPage.questions.push(newQuestion);
  }

  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  res.redirect("/titan-mvp-1.2/page-overview");
});

// Page overview
router.get("/titan-mvp-1.2/page-overview", function (req, res) {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;
  const pageNumber = pageIndex + 1;

  const currentPage = formPages[pageIndex];
  const sections = formData.sections || [];

  res.render("titan-mvp-1.2/form-editor/page-overview.html", {
    form: {
      name: formData.formName || "Form name",
    },
    pageNumber: pageNumber,
    currentPage: currentPage,
    sections: sections,
  });
});

// Edit page
router.get("/titan-mvp-1.2/edit-page/:pageId", function (req, res) {
  const pageId = req.params.pageId;
  const formPages = req.session.data["formPages"] || [];
  const pageIndex = formPages.findIndex(
    (page) => String(page.pageId) === pageId
  );

  if (pageIndex === -1) {
    return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
  }

  req.session.data["currentPageIndex"] = pageIndex;

  const pageToEdit = formPages[pageIndex];
  if (pageToEdit.pageType === "question") {
    res.redirect("/titan-mvp-1.2/page-overview");
  } else if (pageToEdit.pageType === "guidance") {
    res.redirect(
      "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html"
    );
  } else {
    res.redirect("/titan-mvp-1.2/form-editor/listing.html");
  }
});

// Edit question
router.get("/titan-mvp-1.2/edit-question", function (req, res) {
  const questionId = (req.query.questionId || "").trim();

  if (!questionId) {
    return res.redirect("/titan-mvp-1.2/page-overview");
  }

  const formPages = req.session.data["formPages"] || [];
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
    return res.redirect("/titan-mvp-1.2/page-overview");
  }

  req.session.data["currentPageIndex"] = foundPageIndex;
  req.session.data["currentQuestionIndex"] = foundQuestionIndex;

  const question = formPages[foundPageIndex].questions[foundQuestionIndex];

  req.session.data["currentQuestionType"] = question.type;
  if (question.type === "text") {
    req.session.data["writtenSubType"] = question.subType;
  } else if (question.type === "date") {
    req.session.data["dateSubType"] = question.subType;
  } else if (question.type === "list") {
    req.session.data["listSubType"] = question.subType;
  }

  res.redirect("/titan-mvp-1.2/question-configuration");
});

// Page overview save
router.post("/titan-mvp-1.2/page-overview", function (req, res) {
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

  const pageHeading = req.body.pageHeading || "";
  const guidanceTextarea = req.body.guidance || "";

  currentPage.hasGuidance = req.body.guidance === "guidance";

  let allowMultipleResponses = req.body.allowMultipleResponses;
  const questionSetName = req.body.questionSetName || "";
  const minResponseCount = req.body.minResponseCount || "";
  const maxResponseCount = req.body.maxResponseCount || "";

  if (Array.isArray(allowMultipleResponses)) {
    allowMultipleResponses = allowMultipleResponses.includes("true")
      ? "true"
      : "false";
  }

  const sectionId = req.body.section;
  if (sectionId) {
    const sections = req.session.data.sections || [];
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      currentPage.section = {
        id: section.id,
        name: section.name,
      };
    }
  } else {
    currentPage.section = null;
  }

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

  if (!currentPage.pageType) {
    currentPage.pageType = "question";
  }

  formPages[pageIndex] = currentPage;
  req.session.data["formPages"] = formPages;

  res.redirect("/titan-mvp-1.2/page-overview");
});

// Form creation flow - simple routes without validation
router.get("/titan-mvp-1.2/create-new-form/form-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Generate form ID if not already exists
  if (!req.session.data.formId) {
    req.session.data.formId = `FORM-${Date.now()}`;
  }

  // Log current session data
  console.log("Current session data:", req.session.data);

  res.render("titan-mvp-1.2/create-new-form/form-name", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/create-new-form/form-name", (req, res) => {
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
      status: "Draft",
    },
  };

  // Log the updated session data
  console.log("Updated session data after form name:", req.session.data);

  res.redirect("/titan-mvp-1.2/create-new-form/organisation-name");
});

router.get("/titan-mvp-1.2/create-new-form/organisation-name", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Log current session data
  console.log("Current session data:", req.session.data);

  // Check if we have a form name before proceeding
  if (!req.session.data.formName) {
    return res.redirect("/titan-mvp-1.2/create-new-form/form-name");
  }

  res.render("titan-mvp-1.2/create-new-form/organisation-name", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/create-new-form/organisation-name", (req, res) => {
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

  res.redirect("/titan-mvp-1.2/create-new-form/policy-sme");
});

router.get("/titan-mvp-1.2/create-new-form/policy-sme", (req, res) => {
  // Initialize session data if it doesn't exist
  req.session.data = req.session.data || {};

  // Log current session data
  console.log("Current session data:", req.session.data);

  // Check if we have the required data before proceeding
  if (!req.session.data.formName || !req.session.data.organisationName) {
    return res.redirect("/titan-mvp-1.2/create-new-form/form-name");
  }

  res.render("titan-mvp-1.2/create-new-form/policy-sme", {
    data: req.session.data,
  });
});

router.post("/titan-mvp-1.2/create-new-form/policy-sme", (req, res) => {
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
      status: "Draft", // Set initial status to Draft
    },
  };

  // Add form to library
  try {
    const libraryPath = path.join(__dirname, "data", "form-library.json");
    const libraryData = JSON.parse(fs.readFileSync(libraryPath, "utf8"));

    // Create new form entry
    const newForm = {
      name: req.session.data.formName,
      path: "forms/form-home/report-a-dead-wild-bird-published", // Default path
      organisation: req.session.data.organisationName,
      status: "draft",
      created: {
        date: new Date().toISOString().split("T")[0],
        name: "Chris Smith", // Current user
      },
      updated: {
        date: new Date().toISOString().split("T")[0],
        name: "Chris Smith", // Current user
      },
    };

    // Add to library
    libraryData.push(newForm);

    // Write back to file
    fs.writeFileSync(libraryPath, JSON.stringify(libraryData, null, 2));
  } catch (error) {
    console.error("Error updating form library:", error);
  }

  // Log the final session data
  console.log("Final session data:", req.session.data);

  res.redirect("/titan-mvp-1.2/form-overview/index/");
});

// Overview page route
router.get("/titan-mvp-1.2/form-overview/index/", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Map status to GOV.UK Design System tag colors
  const statusColorMap = {
    Draft: "orange",
    Live: "green",
    Closed: "red",
  };

  const status = formData.formDetails?.status || "Draft";
  const statusColor = statusColorMap[status] || "grey";

  // Create a URL-friendly version of the form name
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Create the preview URL
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;

  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Form name",
    status: {
      text: status,
      color: statusColor,
    },
    previewUrl: previewUrl,
    createdAt: formData.formDetails?.createdAt || new Date().toISOString(),
    updatedAt: formData.formDetails?.lastUpdated || new Date().toISOString(),
    organisation: {
      name: formData.formDetails?.organisation || "Not set",
    },
    team: {
      name: formData.formDetails?.teamName || "Not set",
      email: formData.formDetails?.email || "Not set",
    },
    support: {
      phone: formData.formDetails?.support?.phone,
      email: formData.formDetails?.support?.email,
      link: formData.formDetails?.support?.link,
    },
    nextSteps: formData.formDetails?.nextSteps,
    privacyNotice: formData.formDetails?.privacyNotice,
    notificationEmail: formData.formDetails?.notificationEmail,
  };

  res.render("titan-mvp-1.2/form-overview/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Add POST route handler for saving page changes
router.post("/titan-mvp-1.2/form-overview/index", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;

  // Get the current page
  const currentPage = formPages[pageIndex];

  // Update the current page with the new values
  formPages[pageIndex] = {
    ...currentPage,
    pageHeading: req.body.pageHeading || currentPage.pageHeading,
    guidanceTextarea: req.body.guidanceText || currentPage.guidanceTextarea,
    hasGuidance: req.body.guidance === "guidance",
    allowMultipleResponses: req.body.allowMultipleResponses === "true",
    minResponseCount: req.body.minResponseCount || currentPage.minResponseCount,
    maxResponseCount: req.body.maxResponseCount || currentPage.maxResponseCount,
    questionSetName: req.body.questionSetName || currentPage.questionSetName,
    section: req.body.section
      ? {
          id: req.body.section,
          name:
            formData.sections?.find((s) => s.id === req.body.section)?.name ||
            "",
        }
      : null,
    lastUpdated: new Date().toISOString(),
  };

  // Update the session data
  req.session.data = {
    ...formData,
    formPages: formPages,
    formDetails: {
      ...formData.formDetails,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Redirect back to the page overview
  res.redirect("/titan-mvp-1.2/form-editor/page-overview");
});

// Support pages routes
router.get("/titan-mvp-1.2/form-overview/index/support/phone", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-telephone", {
    form: {
      name: formData.formName || "Form name",
      support: {
        phone: formData.formDetails?.support?.phone || "",
      },
    },
    pageName: "Add phone number for support",
  });
});

router.post("/titan-mvp-1.2/form-overview/index/support/phone", (req, res) => {
  const formData = req.session.data || {};
  const phoneDetails = req.body.moreDetail;

  // Update the form details with the phone number
  formData.formDetails = {
    ...formData.formDetails,
    support: {
      ...formData.formDetails?.support,
      phone: phoneDetails,
    },
    lastUpdated: new Date().toISOString(),
  };

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/index");
});

router.get("/titan-mvp-1.2/form-overview/index/support/email", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-email", {
    form: {
      name: formData.formName || "Form name",
      support: {
        email: formData.formDetails?.support?.email || "",
      },
    },
    pageName: "Add email address for support",
  });
});

router.post("/titan-mvp-1.2/form-overview/index/support/email", (req, res) => {
  const formData = req.session.data || {};
  const emailAddress = req.body.emailAddress;
  const responseTime = req.body.responseTime;

  // Update the form details with the email and response time
  formData.formDetails = {
    ...formData.formDetails,
    support: {
      ...formData.formDetails?.support,
      email: emailAddress,
      responseTime: responseTime,
    },
    lastUpdated: new Date().toISOString(),
  };

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/index");
});

router.get("/titan-mvp-1.2/form-overview/index/support/link", (req, res) => {
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-overview/support/add-contact-link", {
    form: {
      name: formData.formName || "Form name",
      support: {
        link: formData.formDetails?.support?.link || "",
      },
    },
    pageName: "Add contact link for support",
  });
});

router.post("/titan-mvp-1.2/form-overview/index/support/link", (req, res) => {
  const formData = req.session.data || {};
  const contactLink = req.body.contactLink;
  const contactLinkDescription = req.body.contactLinkDescription;

  // Update the form details with the contact link and description
  formData.formDetails = {
    ...formData.formDetails,
    support: {
      ...formData.formDetails?.support,
      link: contactLink,
      linkDescription: contactLinkDescription,
    },
    lastUpdated: new Date().toISOString(),
  };

  req.session.data = formData;
  res.redirect("/titan-mvp-1.2/form-overview/index");
});

router.get(
  "/titan-mvp-1.2/form-overview/index/support/next-steps",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/next-steps.html", {
      form: {
        name: formData.formName || "Form name",
        nextSteps: formData.formDetails?.nextSteps || "",
      },
      pageName: "Add next steps",
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-overview/index/support/next-steps",
  (req, res) => {
    const formData = req.session.data || {};
    const nextSteps = req.body.nextSteps;

    // Update the form details with the next steps
    formData.formDetails = {
      ...formData.formDetails,
      nextSteps: nextSteps,
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

router.get(
  "/titan-mvp-1.2/form-overview/index/support/privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/privacy-notice", {
      form: {
        name: formData.formName || "Form name",
        privacyNotice: formData.formDetails?.privacyNotice || "",
      },
      pageName: "Add privacy notice",
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-overview/index/support/privacy-notice",
  (req, res) => {
    const formData = req.session.data || {};
    const privacyNotice = req.body.privacyLink;

    formData.formDetails = {
      ...formData.formDetails,
      privacyNotice: privacyNotice,
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

router.get(
  "/titan-mvp-1.2/form-overview/index/support/notification-email",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/support/notification-email", {
      form: {
        name: formData.formName || "Form name",
        notificationEmail: formData.formDetails?.notificationEmail || "",
      },
      pageName: "Add notification email",
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-overview/index/support/notification-email",
  (req, res) => {
    const formData = req.session.data || {};
    const notificationEmail = req.body.notificationEmail;

    formData.formDetails = {
      ...formData.formDetails,
      notificationEmail: notificationEmail,
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

// Form editor routes
router.get("/titan-mvp-1.2/form-editor/page-overview", function (req, res) {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;
  const currentPage = formPages[pageIndex] || {};
  const sections = formData.sections || [];
  res.render("titan-mvp-1.2/form-editor/page-overview.html", {
    form: { name: formData.formName || "Form name" },
    pageNumber: pageIndex + 1,
    currentPage: currentPage,
    sections: sections,
  });
});

router.post("/titan-mvp-1.2/form-editor/page-overview", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;

  // Get the current page
  const currentPage = formPages[pageIndex];

  // Update the current page with the new values
  formPages[pageIndex] = {
    ...currentPage,
    pageHeading: req.body.pageHeading || currentPage.pageHeading,
    guidanceTextarea: req.body.guidanceText || currentPage.guidanceTextarea,
    hasGuidance: req.body.guidance === "guidance",
    allowMultipleResponses: req.body.allowMultipleResponses === "true",
    minResponseCount: req.body.minResponseCount || currentPage.minResponseCount,
    maxResponseCount: req.body.maxResponseCount || currentPage.maxResponseCount,
    questionSetName: req.body.questionSetName || currentPage.questionSetName,
    section: req.body.section
      ? {
          id: req.body.section,
          name:
            formData.sections?.find((s) => s.id === req.body.section)?.name ||
            "",
        }
      : null,
    lastUpdated: new Date().toISOString(),
  };

  // Update the session data
  req.session.data = {
    ...formData,
    formPages: formPages,
    formDetails: {
      ...formData.formDetails,
      lastUpdated: new Date().toISOString(),
    },
  };

  // Redirect back to the listing page
  res.redirect("/titan-mvp-1.2/form-editor/listing");
});

// Question configuration routes
router.get(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const currentPage = formPages[pageIndex] || {};

    res.render(
      "titan-mvp-1.2/form-editor/question-type/guidance-configuration",
      {
        form: {
          name: formData.formName || "Form name",
        },
        page: currentPage,
      }
    );
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;

    // Get the current page
    const currentPage = formPages[pageIndex];

    // Update the current page with the guidance configuration
    formPages[pageIndex] = {
      ...currentPage,
      pageHeading: req.body.pageHeading || currentPage.pageHeading,
      guidanceTextarea: req.body.guidanceText || currentPage.guidanceTextarea,
      hasGuidance: true,
      lastUpdated: new Date().toISOString(),
    };

    // Update the session data
    req.session.data = {
      ...formData,
      formPages: formPages,
      formDetails: {
        ...formData.formDetails,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/form-editor/page-overview");
  }
);

// Question type configuration routes
router.get(
  "/titan-mvp-1.2/form-editor/question-type/:type/configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const currentPage = formPages[pageIndex] || {};
    const questionType = req.params.type;

    res.render(
      `titan-mvp-1.2/form-editor/question-type/${questionType}-configuration`,
      {
        form: {
          name: formData.formName || "Form name",
        },
        page: currentPage,
        questionType: questionType,
      }
    );
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/question-type/:type/configuration",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const questionType = req.params.type;

    // Get the current page
    const currentPage = formPages[pageIndex];

    // Update the current page with the question configuration
    formPages[pageIndex] = {
      ...currentPage,
      questions: [
        {
          ...currentPage.questions[0],
          label: req.body.questionLabel,
          hint: req.body.questionHint,
          type: questionType,
          validation: {
            required: req.body.required === "true",
            pattern: req.body.pattern,
            minLength: req.body.minLength,
            maxLength: req.body.maxLength,
          },
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    // Update the session data
    req.session.data = {
      ...formData,
      formPages: formPages,
      formDetails: {
        ...formData.formDetails,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/form-editor/page-overview");
  }
);

// Question options routes
router.get(
  "/titan-mvp-1.2/form-editor/question-type/:type/options",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const currentPage = formPages[pageIndex] || {};
    const questionType = req.params.type;

    res.render(
      `titan-mvp-1.2/form-editor/question-type/${questionType}-options`,
      {
        form: {
          name: formData.formName || "Form name",
        },
        page: currentPage,
        questionType: questionType,
      }
    );
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/question-type/:type/options",
  (req, res) => {
    const formData = req.session.data || {};
    const formPages = formData.formPages || [];
    const pageIndex = formData.currentPageIndex || 0;
    const questionType = req.params.type;

    // Get the current page
    const currentPage = formPages[pageIndex];

    // Get the options from the request body
    const options = req.body.options || [];

    // Update the current page with the question options
    formPages[pageIndex] = {
      ...currentPage,
      questions: [
        {
          ...currentPage.questions[0],
          options: Array.isArray(options)
            ? options.map((option) => ({
                value: option,
                label: option,
              }))
            : [{ value: options, label: options }],
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    // Update the session data
    req.session.data = {
      ...formData,
      formPages: formPages,
      formDetails: {
        ...formData.formDetails,
        lastUpdated: new Date().toISOString(),
      },
    };

    // Redirect to the page overview
    res.redirect("/titan-mvp-1.2/form-editor/page-overview");
  }
);

// Make draft live routes
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live",
  (req, res) => {
    const formData = req.session.data || {};

    res.render(
      "titan-mvp-1.2/form-overview/manage-form/make-draft-live/index",
      {
        form: {
          name: formData.formName || "Form name",
          status: {
            text: "Draft-Live",
            color: "blue",
          },
        },
      }
    );
  }
);

router.post("/titan-mvp-1.2/form-overview/make-draft-live", (req, res) => {
  // Update form status in session
  const formData = req.session.data || {};

  formData.formDetails = {
    ...formData.formDetails,
    status: "Live",
    publishedAt: new Date().toISOString(),
    publishedBy: "Chris Smith", // This would normally come from the logged-in user
    lastUpdated: new Date().toISOString(),
  };

  req.session.data = formData;

  // Redirect to passed validation page
  res.redirect(
    "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/passed-validation"
  );
});

router.get(
  "/titan-mvp-1.2/form-overview/manage-form/make-draft-live/passed-validation",
  (req, res) => {
    const formData = req.session.data || {};

    res.render(
      "titan-mvp-1.2/form-overview/manage-form/make-draft-live/passed-validation",
      {
        form: {
          name: formData.formName || "Form name",
          status: {
            text: "Live",
            color: "green",
          },
        },
        actions: {
          continue: "/titan-mvp-1.2/form-overview/live/index",
        },
      }
    );
  }
);

// Live form overview route
router.get("/titan-mvp-1.2/form-overview/live/index", (req, res) => {
  const formData = req.session.data || {};
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const form = {
    name: formData.formName || "Form name",
    status: {
      text: "Live",
      color: "green",
    },
    previewUrl: `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`,
    liveUrl: `https://forms-runner.prototype.cdp-int.defra.cloud/forms/${urlFriendlyName}`,
    publishedAt: formData.formDetails?.publishedAt || new Date().toISOString(),
    publishedBy: formData.formDetails?.publishedBy || "Chris Smith",
    organisation: formData.formDetails?.organisation || { name: "Not set" },
    team: {
      name: formData.formDetails?.teamName || "Not set",
      email: formData.formDetails?.email || "Not set",
    },
    support: formData.formDetails?.support || {},
    nextSteps: formData.formDetails?.nextSteps,
    privacyNotice: formData.formDetails?.privacyNotice,
  };

  res.render("titan-mvp-1.2/form-overview/live/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Migrate confirmation route
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/migrate-confirmation",
  (req, res) => {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-overview/manage-form/migrate-confirmation", {
      form: {
        id: formData.formId || "1",
        name: formData.formName || "Form name",
      },
    });
  }
);

// Library route
router.get("/titan-mvp-1.2/library", function (req, res) {
  res.render("titan-mvp-1.2/library.html", {
    commonTerms: terms,
  });
});

// Add non-.html route for information-type-nf
router.get(
  "/titan-mvp-1.2/form-editor/information-type-nf",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/information-type-nf.html", {
      form: {
        name: formData.formName || "Form name",
      },
      pageNumber: formData.currentPageIndex + 1 || 1,
      questionNumber: formData.currentQuestionIndex + 1 || 1,
      data: formData,
    });
  }
);

// Add non-.html route for errors/shorttext-edit
router.get(
  "/titan-mvp-1.2/form-editor/errors/shorttext-edit",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/errors/shorttext-edit.html", {
      data: formData,
      form: { name: formData.formName || "Form name" },
    });
  }
);

// Add non-.html route for form-overview/index
router.get("/titan-mvp-1.2/form-overview/index", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};
  // Map status to GOV.UK Design System tag colors
  const statusColorMap = {
    Draft: "orange",
    Live: "green",
    Closed: "red",
  };
  const status = formData.formDetails?.status || "Draft";
  const statusColor = statusColorMap[status] || "grey";
  // Create a URL-friendly version of the form name
  const urlFriendlyName = (formData.formName || "untitled-form")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // Create the preview URL
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;
  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Form name",
    status: {
      text: status,
      color: statusColor,
    },
    previewUrl: previewUrl,
    createdAt: formData.formDetails?.createdAt || new Date().toISOString(),
    updatedAt: formData.formDetails?.lastUpdated || new Date().toISOString(),
    organisation: {
      name: formData.formDetails?.organisation || "Not set",
    },
    team: {
      name: formData.formDetails?.teamName || "Not set",
      email: formData.formDetails?.email || "Not set",
    },
    support: {
      phone: formData.formDetails?.support?.phone,
      email: formData.formDetails?.support?.email,
      link: formData.formDetails?.support?.link,
    },
    nextSteps: formData.formDetails?.nextSteps,
    privacyNotice: formData.formDetails?.privacyNotice,
    notificationEmail: formData.formDetails?.notificationEmail,
  };
  res.render("titan-mvp-1.2/form-overview/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Add non-.html route for library
router.get("/titan-mvp-1.2/library.html", function (req, res) {
  res.render("titan-mvp-1.2/library.html", {
    commonTerms: terms,
  });
});

// Upload confirmation page
router.get(
  "/titan-mvp-1.2/form-editor/upload-confirmation",
  function (req, res) {
    const formData = req.session.data || {};
    res.render("titan-mvp-1.2/form-editor/upload-confirmation", {
      form: {
        name: formData.formName || "Form name",
      },
      pageName: "Upload confirmation",
    });
  }
);

// Export the router
module.exports = router;
