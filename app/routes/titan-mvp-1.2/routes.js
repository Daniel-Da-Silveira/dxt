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

    // Get available questions for conditions
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

    // Populate existingConditions (form-level and other page-level)
    const existingConditions = [];
    // Add form-level conditions first
    if (formData.conditions) {
      existingConditions.push(
        ...formData.conditions.map((condition) => ({
          value: condition.id.toString(),
          text: condition.conditionName,
          hint: {
            text: condition.rules
              .map(
                (rule) =>
                  `${rule.questionText} ${rule.operator} ${
                    Array.isArray(rule.value)
                      ? rule.value.join(" or ")
                      : rule.value
                  }`
              )
              .join(" AND "),
          },
        }))
      );
    }
    // Add page-level conditions from other pages
    formPages
      .filter((page) => String(page.pageId) !== req.params.pageId)
      .forEach((page) => {
        if (page.conditions) {
          existingConditions.push(
            ...page.conditions.map((condition) => ({
              value: condition.id.toString(),
              text: condition.conditionName,
              hint: {
                text: condition.rules
                  .map(
                    (rule) =>
                      `${rule.questionText} ${rule.operator} ${
                        Array.isArray(rule.value)
                          ? rule.value.join(" or ")
                          : rule.value
                      }`
                  )
                  .join(" AND "),
              },
            }))
          );
        }
      });

    // Combine default option and existingConditions for the select
    const selectItems = [
      { value: "", text: "Select existing condition" },
      ...existingConditions,
    ];

    res.render("titan-mvp-1.2/form-editor/conditions/page-level.html", {
      form: { name: formData.formName || "Form name" },
      currentPage,
      pageNumber,
      conditions,
      question: currentPage.questions ? currentPage.questions[0] : {},
      existingConditions: existingConditions,
      selectItems: selectItems,
      availableQuestions: availableQuestions, // Add available questions to the template context
    });
  }
);

// Form-level conditions management (manager)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/manager",
  function (req, res) {
    const formData = req.session.data || {};
    let formPages = req.session.data["formPages"] || [];
    const conditions = formData.conditions || [];
    const conditionSaved = req.query.conditionSaved === "true";

    if (!formPages || formPages.length === 0) {
      // Try to reconstruct from other session data if possible
      if (Array.isArray(formData.pages) && formData.pages.length > 0) {
        formPages = formData.pages;
        console.log(
          "DEBUG: Fallback to formData.pages",
          JSON.stringify(formPages)
        );
      }
    }

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
      query: req.query, // Pass query params for context banner
    });
  }
);

// Add route to handle creating conditions at the page level
router.post(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId/add",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const pageId = req.params.pageId;

    // Find the current page
    const currentPage = formPages.find(
      (page) => String(page.pageId) === pageId
    );

    if (!currentPage) {
      console.error("Page not found:", pageId);
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }

    // Initialize conditions array if it doesn't exist
    currentPage.conditions = currentPage.conditions || [];

    // Parse rules if it's a string, or use directly if it's already an object
    let rules;
    try {
      if (req.body.rules) {
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
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          return `${rule.questionText} ${rule.operator} ${valueText}`;
        })
        .join(" "),
    };

    // Add the condition to the page
    currentPage.conditions.push(newCondition);

    // Also add to form-level (manager) conditions if not already present
    req.session.data.conditions = req.session.data.conditions || [];
    const alreadyExists = req.session.data.conditions.some(
      (c) => String(c.id) === String(newCondition.id)
    );
    if (!alreadyExists) {
      req.session.data.conditions.push(newCondition);
    }

    // Save back to session
    req.session.data.formPages = formPages;

    // Redirect back to the page-level conditions view
    res.redirect(`/titan-mvp-1.2/form-editor/conditions/page-level/${pageId}`);
  }
);

// Add/Edit form-level condition (manager)
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/add",
  function (req, res) {
    const formData = req.session.data || {};
    if (!formData.conditions) {
      formData.conditions = [];
    }

    // Parse rules if it's a string, or use directly if it's already an object
    let rules;
    try {
      if (req.body.rules) {
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
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          return `${rule.questionText} ${rule.operator} ${valueText}`;
        })
        .join(" "),
    };

    // Add the condition to the global conditions list only
    formData.conditions.push(newCondition);

    // --- NEW: Apply to selected pages if any were checked ---
    const formPages = req.session.data.formPages || [];
    let selectedPages = [];
    try {
      selectedPages = (
        Array.isArray(req.body.pages)
          ? req.body.pages
          : req.body.pages
          ? JSON.parse(req.body.pages)
          : []
      )
        .filter(
          (pageId) =>
            pageId !== "_unchecked" &&
            pageId !== "none" &&
            !pageId.startsWith("[")
        )
        .map((pageId) => String(pageId));
    } catch (e) {
      selectedPages = [];
    }
    if (selectedPages.length > 0) {
      selectedPages.forEach((pageId) => {
        const page = formPages.find((p) => String(p.pageId) === pageId);
        if (page) {
          page.conditions = page.conditions || [];
          const alreadyExists = page.conditions.some(
            (c) => String(c.id) === String(newCondition.id)
          );
          if (!alreadyExists) {
            page.conditions.push(JSON.parse(JSON.stringify(newCondition)));
          }
        }
      });
    }
    req.session.data.formPages = formPages;
    // --- END NEW ---

    // Save back to session
    req.session.data = formData;

    // Redirect with the new condition ID
    res.redirect(
      `/titan-mvp-1.2/form-editor/conditions/manager?conditionSaved=true&newConditionId=${newCondition.id}`
    );
  }
);

// Add existing condition to a page (for page-level conditions UI)
router.post("/conditions-add", function (req, res) {
  const formData = req.session.data || {};
  const formPages = req.session.data.formPages || [];
  const currentPageId = req.body.currentPageId;

  // Find the current page by pageId
  const currentPage = formPages.find(
    (page) => String(page.pageId) === String(currentPageId)
  );

  if (!currentPage) {
    console.error("Page not found:", currentPageId);
    return res.redirect("/titan-mvp-1.2/form-editor/listing");
  }

  // Initialize conditions array if it doesn't exist
  currentPage.conditions = currentPage.conditions || [];

  if (req.body.conditionType === "existing") {
    const existingConditionId = req.body.existingConditionId;

    // Find the existing condition from form-level conditions first
    let existingCondition = null;
    if (formData.conditions) {
      existingCondition = formData.conditions.find(
        (c) => String(c.id) === String(existingConditionId)
      );
    }

    // If not found in form-level, look in page-level conditions
    if (!existingCondition) {
      for (const page of formPages) {
        if (page.conditions) {
          const found = page.conditions.find(
            (c) => String(c.id) === String(existingConditionId)
          );
          if (found) {
            existingCondition = found;
            break;
          }
        }
      }
    }

    if (existingCondition) {
      // Check if condition already exists in current page
      const alreadyExists = currentPage.conditions.some(
        (c) => String(c.id) === String(existingConditionId)
      );

      if (!alreadyExists) {
        // Add a deep copy of the condition to avoid reference issues
        currentPage.conditions.push(
          JSON.parse(JSON.stringify(existingCondition))
        );
      }
    } else {
      console.error(
        "Could not find existing condition with ID:",
        existingConditionId
      );
    }

    // Save back to session
    req.session.data.formPages = formPages;

    // Debug log for redirect
    console.log(
      "POST /conditions-add hit, redirecting to:",
      `/titan-mvp-1.2/form-editor/conditions/page-level/${currentPageId}`
    );

    // Redirect back to the page-level conditions view
    return res.redirect(
      `/titan-mvp-1.2/form-editor/conditions/page-level/${currentPageId}`
    );
  }

  // If not an existing condition, just redirect
  res.redirect(
    `/titan-mvp-1.2/form-editor/conditions/page-level/${currentPageId}`
  );
});

// Add this route to handle the delete condition page
router.get(
  "/titan-mvp-1.2/form-editor/conditions/delete/:conditionId",
  (req, res) => {
    const conditionId = req.params.conditionId;
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];

    // Find the condition details
    const condition =
      formData.conditions?.find(
        (c) => c.id.toString() === conditionId.toString()
      ) ||
      formPages
        .flatMap((page) => page.conditions || [])
        .find((c) => c.id.toString() === conditionId.toString());

    if (!condition) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Find all pages that use this condition
    const pagesWithCondition = [];
    formPages.forEach((page, index) => {
      if (page.conditions) {
        const usesCondition = page.conditions.some(
          (c) => c.id.toString() === conditionId.toString()
        );
        if (usesCondition) {
          pagesWithCondition.push({
            pageNumber: index + 1,
            pageHeading: page.pageHeading || `Page ${page.pageId}`,
          });
        }
      }
    });

    res.render("titan-mvp-1.2/form-editor/conditions/delete", {
      form: formData,
      conditionName: condition.conditionName,
      conditionId: conditionId,
      pagesWithCondition: pagesWithCondition,
      formName: formData.name || "Untitled form",
    });
  }
);

// POST route to actually delete the condition
router.post(
  "/titan-mvp-1.2/form-editor/conditions/delete/:conditionId",
  (req, res) => {
    const conditionId = req.params.conditionId;
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];

    // Remove from form-level conditions if they exist
    if (formData.conditions) {
      formData.conditions = formData.conditions.filter(
        (c) => c.id.toString() !== conditionId.toString()
      );
    }

    // Remove from any pages that use this condition
    formPages.forEach((page) => {
      if (page.conditions) {
        page.conditions = page.conditions.filter(
          (c) => c.id.toString() !== conditionId.toString()
        );
      }
      // Also check if this condition is used in any page's conditional routing
      if (page.conditionalRouting) {
        page.conditionalRouting = page.conditionalRouting.filter(
          (route) => route.conditionId.toString() !== conditionId.toString()
        );
      }
    });

    req.session.data.formPages = formPages;
    req.session.data.conditions = formData.conditions;

    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
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

// Add .html route for information-type-nf
router.get(
  "/titan-mvp-1.2/form-editor/information-type-nf.html",
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

// Live-draft overview page route
router.get("/titan-mvp-1.2/form-overview/live-draft", (req, res) => {
  // Get the form data from the session
  const formData = req.session.data || {};

  // Create a URL-friendly version of the form name
  const urlFriendlyName = (formData.formName || "Form name")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Create the preview URL and live URL
  const previewUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/preview/draft/${urlFriendlyName}`;
  const liveUrl = `https://forms-runner.prototype.cdp-int.defra.cloud/forms/${urlFriendlyName}`;

  // Create the form object that the templates expect
  const form = {
    name: formData.formName || "Form name",
    status: {
      text: "Draft-Live",
      color: "blue",
    },
    previewUrl: previewUrl,
    liveUrl: liveUrl,
    createdAt: formData.formDetails?.createdAt || new Date().toISOString(),
    updatedAt: formData.formDetails?.lastUpdated || new Date().toISOString(),
    updatedBy: formData.formDetails?.updatedBy || "Chris Smith",
    draftCreatedAt:
      formData.formDetails?.draftCreatedAt || new Date().toISOString(),
    draftCreatedBy: formData.formDetails?.draftCreatedBy || "Chris Smith",
    publishedAt: formData.formDetails?.publishedAt || new Date().toISOString(),
    publishedBy: formData.formDetails?.publishedBy || "Chris Smith",
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

  res.render("titan-mvp-1.2/form-overview/live-draft/index", {
    form: form,
    pageName: `Overview - ${form.name}`,
  });
});

// Delete draft confirmation page
router.get(
  "/titan-mvp-1.2/form-overview/manage-form/delete-draft",
  (req, res) => {
    const formData = req.session.data || {};

    res.render("titan-mvp-1.2/form-overview/manage-form/delete-draft/index", {
      form: {
        name: formData.formName || "Form name",
        status: formData.formDetails?.status || {
          text: "Draft",
          color: "orange",
        },
      },
      actions: {
        continue:
          "/titan-mvp-1.2/form-overview/manage-form/delete-draft/confirm",
        cancel: "/titan-mvp-1.2/form-overview/index",
      },
    });
  }
);

// Handle delete draft confirmation
router.post(
  "/titan-mvp-1.2/form-overview/manage-form/delete-draft/confirm",
  (req, res) => {
    const formData = req.session.data || {};

    // Update form status in session
    formData.formDetails = {
      ...formData.formDetails,
      status: "Live",
      lastUpdated: new Date().toISOString(),
    };

    req.session.data = formData;

    // Redirect back to form overview
    res.redirect("/titan-mvp-1.2/form-overview/index");
  }
);

// Remove form-level condition
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/remove",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const conditionId = req.body.conditionId;
    const conditionIds = req.body.conditionIds
      ? JSON.parse(req.body.conditionIds)
      : null;

    // Function to remove condition by ID
    const removeConditionById = (id) => {
      // Remove from form-level conditions if they exist
      if (formData.conditions) {
        formData.conditions = formData.conditions.filter(
          (c) => c.id.toString() !== id.toString()
        );
      }

      // Remove from any pages that use this condition
      formPages.forEach((page) => {
        if (page.conditions) {
          page.conditions = page.conditions.filter(
            (c) => c.id.toString() !== id.toString()
          );
        }
        // Also check if this condition is used in any page's conditional routing
        if (page.conditionalRouting) {
          page.conditionalRouting = page.conditionalRouting.filter(
            (route) => route.conditionId.toString() !== id.toString()
          );
        }
      });
    };

    // Handle single condition removal
    if (conditionId) {
      removeConditionById(conditionId);
    }

    // Handle multiple conditions removal
    if (conditionIds) {
      conditionIds.forEach((id) => removeConditionById(id));
    }

    // Save back to session
    req.session.data = formData;

    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Join conditions
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/join",
  function (req, res) {
    console.log("Join route req.body:", req.body);
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    let conditionIds = [];
    try {
      if (req.body.conditionIds && req.body.conditionIds !== "undefined") {
        conditionIds = JSON.parse(req.body.conditionIds);
      }
    } catch (e) {
      conditionIds = [];
    }
    const operator = req.body.operator;
    const newConditionName = req.body.newConditionName;
    if (!Array.isArray(conditionIds) || conditionIds.length < 2) {
      // Optionally, set a flash message or query param for error
      return res.redirect(
        "/titan-mvp-1.2/form-editor/conditions/manager?joinError=Please select at least two conditions to join"
      );
    }
    // ... existing code ...
    // Create the new joined condition
    const newCondition = {
      id: Date.now(),
      conditionName: newConditionName,
      logicalOperator: operator,
      rules: [],
    };

    // Find all the conditions to be joined
    const conditionsToJoin = [];
    // First check form-level conditions
    if (formData.conditions) {
      formData.conditions.forEach((condition) => {
        if (
          conditionIds.includes(condition.id.toString()) &&
          !conditionsToJoin.some((c) => c.id === condition.id)
        ) {
          conditionsToJoin.push(condition);
        }
      });
    }
    // Then check page-level conditions
    formPages.forEach((page) => {
      if (page.conditions) {
        page.conditions.forEach((condition) => {
          if (
            conditionIds.includes(condition.id.toString()) &&
            !conditionsToJoin.some((c) => c.id === condition.id)
          ) {
            conditionsToJoin.push(condition);
          }
        });
      }
    });
    // Sort conditions to match the order of conditionIds
    conditionsToJoin.sort((a, b) => {
      return (
        conditionIds.indexOf(a.id.toString()) -
        conditionIds.indexOf(b.id.toString())
      );
    });
    // Add rules from all conditions, setting logicalOperator for every rule after the first
    let ruleCounter = 0;
    conditionsToJoin.forEach((condition) => {
      condition.rules.forEach((rule) => {
        newCondition.rules.push({
          ...rule,
          logicalOperator: ruleCounter === 0 ? null : operator,
        });
        ruleCounter++;
      });
    });
    // Create the text representation of the joined condition
    newCondition.text = newCondition.rules
      .map((rule, idx) => {
        const valueText = Array.isArray(rule.value)
          ? rule.value.map((v) => `'${v}'`).join(" or ")
          : `'${rule.value}'`;
        // Add the logical operator before all but the first rule
        if (idx > 0 && rule.logicalOperator) {
          return `${rule.logicalOperator} '${rule.questionText}' ${rule.operator} ${valueText}`;
        }
        return `'${rule.questionText}' ${rule.operator} ${valueText}`;
      })
      .join(" ");

    // Add the new condition to the form-level conditions
    formData.conditions.push(newCondition);

    // --- Apply to selected pages if any were checked ---
    let selectedPages = [];
    try {
      selectedPages = (
        Array.isArray(req.body.pages)
          ? req.body.pages
          : req.body.pages
          ? JSON.parse(req.body.pages)
          : []
      )
        .filter(
          (pageId) =>
            pageId !== "_unchecked" &&
            pageId !== "none" &&
            !pageId.startsWith("[")
        )
        .map((pageId) => String(pageId));
    } catch (e) {
      selectedPages = [];
    }
    if (selectedPages.length > 0) {
      selectedPages.forEach((pageId) => {
        const page = formPages.find((p) => String(p.pageId) === pageId);
        if (page) {
          page.conditions = page.conditions || [];
          const alreadyExists = page.conditions.some(
            (c) => String(c.id) === String(newCondition.id)
          );
          if (!alreadyExists) {
            page.conditions.push(JSON.parse(JSON.stringify(newCondition)));
          }
        }
      });
    }
    // ... existing code ...

    // Save back to session
    req.session.data = formData;

    // Redirect to the conditions manager
    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Page-level delete confirmation and action
router.get(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId/delete/:conditionId",
  (req, res) => {
    const pageId = req.params.pageId;
    const conditionId = req.params.conditionId;
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const currentPage = formPages.find(
      (page) => String(page.pageId) === String(pageId)
    );
    if (!currentPage) {
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }
    const condition = (currentPage.conditions || []).find(
      (c) => String(c.id) === String(conditionId)
    );
    if (!condition) {
      return res.redirect(
        `/titan-mvp-1.2/form-editor/conditions/page-level/${pageId}`
      );
    }
    const pageIndex = formPages.findIndex(
      (page) => String(page.pageId) === String(pageId)
    );
    const pageNumber = pageIndex + 1;
    res.render("titan-mvp-1.2/form-editor/conditions/page-level-delete", {
      form: formData,
      pageId: pageId,
      conditionName: condition.conditionName,
      conditionId: conditionId,
      formName: formData.name || "Untitled form",
      pageHeading: currentPage.pageHeading,
      pageNumber: pageNumber,
    });
  }
);

router.post(
  "/titan-mvp-1.2/form-editor/conditions/page-level/:pageId/delete/:conditionId",
  (req, res) => {
    const pageId = req.params.pageId;
    const conditionId = req.params.conditionId;
    const formPages = req.session.data.formPages || [];
    const currentPage = formPages.find(
      (page) => String(page.pageId) === String(pageId)
    );
    if (currentPage && currentPage.conditions) {
      currentPage.conditions = currentPage.conditions.filter(
        (c) => String(c.id) !== String(conditionId)
      );
    }
    req.session.data.formPages = formPages;
    res.redirect(`/titan-mvp-1.2/form-editor/conditions/page-level/${pageId}`);
  }
);

// Edit page for checkbox options
router.get(
  "/titan-mvp-1.2/form-editor/question-type/checkboxes/edit",
  (req, res) => {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"] || 0;
    const pageNumber = pageIndex + 1;
    const questionIndex = req.session.data["currentQuestionIndex"] || 0;
    const questionNumber = questionIndex + 1;
    const formData = req.session.data || {};

    let checkboxList = [];
    if (formPages[pageIndex]) {
      const currentPage = formPages[pageIndex];
      checkboxList = currentPage.checkboxList || [];
    }
    if (checkboxList.length === 0) {
      checkboxList = req.session.data?.checkboxList || [];
    }

    res.render("titan-mvp-1.2/form-editor/question-type/checkboxes/edit.html", {
      checkboxList: checkboxList,
      pageNumber: pageNumber,
      questionNumber: questionNumber,
      form: {
        name: formData.formDetails?.name || formData.formName || "Form name",
      },
    });
  }
);

// Edit page for radio options
router.get(
  "/titan-mvp-1.2/form-editor/question-type/radios-nf/edit",
  (req, res) => {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"] || 0;
    const pageNumber = pageIndex + 1;
    const questionIndex = req.session.data["currentQuestionIndex"] || 0;
    const questionNumber = questionIndex + 1;
    const formData = req.session.data || {};

    let radioList = [];
    if (formPages[pageIndex]) {
      const currentPage = formPages[pageIndex];
      radioList = currentPage.radioList || [];
    }
    if (radioList.length === 0) {
      radioList = req.session.data?.radioList || [];
    }

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

    const existingConditions = formPages
      .flatMap((page) => page.conditions || [])
      .map((condition) => ({
        value: condition.id.toString(),
        text: condition.conditionName,
        hint: {
          text: condition.rules
            .map(
              (rule) =>
                `${rule.questionText} ${rule.operator} ${
                  Array.isArray(rule.value)
                    ? rule.value.join(" or ")
                    : rule.value
                }`
            )
            .join(" AND "),
        },
      }));

    res.render("titan-mvp-1.2/form-editor/question-type/radios-nf/edit.html", {
      radioList: radioList,
      pageNumber: pageNumber,
      questionNumber: questionNumber,
      form: {
        name: formData.formDetails?.name || formData.formName || "Form name",
      },
      commonTerms: terms,
      availableQuestions: availableQuestions,
      existingConditions: existingConditions,
    });
  }
);

// Guidance configuration edit route
router.get(
  "/titan-mvp-1.2/form-editor/question-type/guidance-configuration.html",
  function (req, res) {
    const formPages = req.session.data["formPages"] || [];
    const pageIndex = req.session.data["currentPageIndex"];
    const formData = req.session.data || {};
    const pageNumber = pageIndex + 1;
    const currentPage = formPages[pageIndex];
    if (!currentPage) {
      return res.redirect("/titan-mvp-1.2/form-editor/listing.html");
    }
    res.render(
      "titan-mvp-1.2/form-editor/question-type/guidance-configuration.html",
      {
        currentPage: currentPage,
        data: req.session.data,
        form: {
          name: formData.formName || "Form name",
        },
        pageNumber: pageNumber,
      }
    );
  }
);

// Apply condition to pages
router.post("/titan-mvp-1.2/form-editor/conditions/apply", function (req, res) {
  const formData = req.session.data;
  const formPages = req.session.data["formPages"] || [];

  // Parse condition IDs - handle both string and array formats
  const conditionIds =
    typeof req.body.conditionIds === "string"
      ? JSON.parse(req.body.conditionIds)
      : Array.isArray(req.body.conditionIds)
      ? req.body.conditionIds
      : [];

  // Clean up the pages array - remove any non-page IDs and parse JSON strings
  let selectedPages = [];
  try {
    selectedPages = (
      Array.isArray(req.body.pages)
        ? req.body.pages
        : req.body.pages
        ? JSON.parse(req.body.pages)
        : []
    )
      .filter((pageId) => pageId !== "_unchecked" && !pageId.startsWith("["))
      .map((pageId) => String(pageId));
  } catch (e) {
    selectedPages = [];
  }

  if (!formData || !conditionIds.length || !selectedPages.length) {
    return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }

  // Get all selected conditions
  const conditions = conditionIds
    .map((conditionId) => {
      // First check form-level conditions
      let condition = formData.conditions?.find(
        (condition) => String(condition.id) === String(conditionId)
      );
      // If not found in form-level, check page-level conditions
      if (!condition) {
        for (const page of formPages) {
          if (page.conditions) {
            const found = page.conditions.find(
              (c) => String(c.id) === String(conditionId)
            );
            if (found) {
              condition = found;
              break;
            }
          }
        }
      }
      return condition;
    })
    .filter(Boolean);

  if (conditions.length === 0) {
    return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }

  // Apply each condition to the selected pages
  conditions.forEach((condition) => {
    selectedPages.forEach((pageId) => {
      const page = formPages.find((p) => String(p.pageId) === pageId);
      if (page) {
        // Initialize conditions array if it doesn't exist
        if (!page.conditions) {
          page.conditions = [];
        }
        // Check if condition is already applied
        const conditionExists = page.conditions.some(
          (c) => String(c.id) === String(condition.id)
        );
        if (!conditionExists) {
          // Add a deep copy of the condition to avoid reference issues
          page.conditions.push(JSON.parse(JSON.stringify(condition)));
        }
      }
    });
  });

  // Save updated pages back to session
  req.session.data["formPages"] = formPages;
  res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
});

// Remove conditions from pages
router.post(
  "/titan-mvp-1.2/form-editor/conditions/remove",
  function (req, res) {
    const formData = req.session.data;
    const formPages = req.session.data["formPages"] || [];

    // Parse the selections object from the request body
    let selections = {};
    try {
      selections =
        typeof req.body.selections === "string"
          ? JSON.parse(req.body.selections)
          : req.body.selections || {};
    } catch (e) {
      console.error("Error parsing selections data:", e);
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    if (!formData || Object.keys(selections).length === 0) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Process each page's selections
    Object.entries(selections).forEach(([pageId, conditionIds]) => {
      const page = formPages.find((p) => String(p.pageId) === pageId);
      if (page) {
        // Initialize conditions array if it doesn't exist
        if (!page.conditions) {
          page.conditions = [];
        }

        // Remove the selected conditions from this page
        page.conditions = page.conditions.filter(
          (condition) => !conditionIds.includes(String(condition.id))
        );
      }
    });

    // Save updated pages back to session
    req.session.data["formPages"] = formPages;
    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Edit condition page (adapted from 1.0)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/edit/:id",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const conditionId = req.params.id;

    // Check if we have any form pages
    if (!formPages || formPages.length === 0) {
      console.error("No form pages found in session");
      return res.redirect("/titan-mvp-1.2/form-editor/listing");
    }

    // First check form-level conditions
    let condition = null;
    let foundInPage = null;

    if (formData.conditions) {
      condition = formData.conditions.find((c) => String(c.id) === conditionId);
    }

    // If not found in form-level conditions, check page-level conditions
    if (!condition) {
      for (const page of formPages) {
        if (page.conditions) {
          const found = page.conditions.find(
            (c) => String(c.id) === conditionId
          );
          if (found) {
            condition = found;
            foundInPage = page;
            break;
          }
        }
      }
    }

    if (!condition) {
      console.error("Condition not found:", conditionId);
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

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

    if (!availableQuestions || availableQuestions.length === 0) {
      console.error("No available questions found for condition editing");
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Calculate pagesWithCondition with pageNumber
    const pagesWithCondition = formPages
      .filter(
        (page) =>
          page.conditions &&
          page.conditions.some((c) => String(c.id) === conditionId)
      )
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));

    // Render the template with pagesWithCondition
    res.render("titan-mvp-1.2/form-editor/conditions/edit.html", {
      condition,
      availableQuestions,
      pageName: foundInPage ? foundInPage.pageHeading : null,
      pagesWithCondition,
      formName: formData.formName || "Default Form Name",
      formPages, // Add this line
    });
  }
);

// Handle the POST request for editing conditions (adapted from 1.0)
router.post(
  "/titan-mvp-1.2/form-editor/conditions-manager/edit",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const conditionId = req.body.conditionId;

    // Find the original condition before updating
    let originalCondition = null;
    let foundInFormLevel = false;

    // First check form-level conditions
    if (formData.conditions) {
      const formLevelIndex = formData.conditions.findIndex(
        (c) => String(c.id) === conditionId
      );
      if (formLevelIndex !== -1) {
        originalCondition = JSON.parse(
          JSON.stringify(formData.conditions[formLevelIndex])
        ); // Deep copy
        foundInFormLevel = true;
      }
    }

    // If not found in form-level, check page-level conditions
    if (!originalCondition) {
      for (const page of formPages) {
        if (page.conditions) {
          const found = page.conditions.find(
            (c) => String(c.id) === conditionId
          );
          if (found) {
            originalCondition = JSON.parse(JSON.stringify(found)); // Deep copy
            break;
          }
        }
      }
    }

    if (!originalCondition) {
      console.error("Condition not found:", conditionId);
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Parse rules if it's a string, or use directly if it's already an object
    let rules;
    try {
      if (req.body.rules) {
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
      rules = [];
    }

    // Create the updated condition
    const updatedCondition = {
      id: conditionId,
      conditionName: req.body.conditionName,
      rules: rules.map((rule) => ({
        questionText: rule.questionText,
        operator: rule.operator,
        value: rule.value,
        logicalOperator: rule.logicalOperator,
      })),
      text: rules
        .map((rule, index) => {
          const valueText = Array.isArray(rule.value)
            ? rule.value.map((v) => `'${v}'`).join(" or ")
            : `'${rule.value}'`;
          return index === 0
            ? `${rule.questionText} ${rule.operator} ${valueText}`
            : `${rule.logicalOperator} ${rule.questionText} ${rule.operator} ${valueText}`;
        })
        .join(" "),
    };

    // --- NEW: Store pending changes instead of updating formPages ---
    let selectedPages = [];
    if (Array.isArray(req.body.pages)) {
      selectedPages = req.body.pages;
    } else if (req.body.pages) {
      selectedPages = [req.body.pages];
    }

    // Store the current pagesWithCondition before updating formPages
    const beforePagesWithCondition = formPages
      .filter(
        (page) =>
          page.conditions &&
          page.conditions.some((c) => String(c.id) === String(conditionId))
      )
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));

    req.session.data.originalCondition = originalCondition;
    req.session.data.pendingConditionUpdate = updatedCondition;
    req.session.data.pendingConditionPages = selectedPages;
    req.session.data._pagesWithConditionBeforeEdit = beforePagesWithCondition;

    // Redirect to the review page
    res.redirect("/titan-mvp-1.2/form-editor/conditions/edit-review");
  }
);

// Add route for the review page (adapted from 1.0)
router.get(
  "/titan-mvp-1.2/form-editor/conditions/edit-review",
  function (req, res) {
    const originalCondition = req.session.data.originalCondition;
    const updatedCondition = req.session.data.pendingConditionUpdate;
    const formPages = req.session.data.formPages || [];
    const conditionId = originalCondition?.id;
    const selectedPages = req.session.data.pendingConditionPages || [];

    if (!originalCondition || !updatedCondition) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    // Calculate before/after page assignments
    const originalPagesWithCondition =
      req.session.data._pagesWithConditionBeforeEdit || [];
    // For after: show what the assignments WOULD be if saved
    const updatedPagesWithCondition = formPages
      .filter((page) => selectedPages.includes(String(page.pageId)))
      .map((page, index) => ({ ...page, pageNumber: index + 1 }));

    res.render("titan-mvp-1.2/form-editor/conditions/edit-review", {
      originalCondition,
      updatedCondition,
      pagesWithCondition: updatedPagesWithCondition,
      originalPagesWithCondition,
      updatedPagesWithCondition,
      formPages, // Pass for full context
      formName: req.session.data.formName || "Default Form Name",
    });
  }
);

// Add route to handle saving changes (adapted from 1.0)
router.post(
  "/titan-mvp-1.2/form-editor/conditions/save-changes",
  function (req, res) {
    const formData = req.session.data || {};
    const formPages = req.session.data.formPages || [];
    const originalCondition = req.session.data.originalCondition;
    const updatedCondition = req.session.data.pendingConditionUpdate;
    const selectedPages = req.session.data.pendingConditionPages || [];

    if (!originalCondition || !updatedCondition) {
      return res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
    }

    const conditionId = originalCondition.id;
    let foundInFormLevel = false;

    // Update in form-level conditions if it exists there
    if (formData.conditions) {
      const formLevelIndex = formData.conditions.findIndex(
        (c) => String(c.id) === String(conditionId)
      );
      if (formLevelIndex !== -1) {
        formData.conditions[formLevelIndex] = updatedCondition;
        foundInFormLevel = true;
      }
    }

    // Remove the condition from all pages first
    formPages.forEach((page) => {
      if (page.conditions) {
        page.conditions = page.conditions.filter(
          (c) => String(c.id) !== String(conditionId)
        );
      }
    });
    // Add the condition to only the selected pages
    selectedPages.forEach((pageId) => {
      const page = formPages.find((p) => String(p.pageId) === String(pageId));
      if (page) {
        page.conditions = page.conditions || [];
        if (
          !page.conditions.some((c) => String(c.id) === String(conditionId))
        ) {
          page.conditions.push(updatedCondition);
        }
      }
    });
    req.session.data.formPages = formPages;

    // Save back to session
    req.session.data = formData;

    // Clear the temporary condition data
    delete req.session.data.originalCondition;
    delete req.session.data.pendingConditionUpdate;
    delete req.session.data.pendingConditionPages;
    delete req.session.data._pagesWithConditionBeforeEdit;

    // Redirect back to the conditions manager
    res.redirect("/titan-mvp-1.2/form-editor/conditions/manager");
  }
);

// Export the router
module.exports = router;

// Add preview route
router.get("/titan-mvp-1.2/form-editor/preview", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/preview", {
    data: { formPages: formPages },
    form: { name: formData.formName || "Form name" },
  });
});

// Add check answers route
router.get("/titan-mvp-1.2/form-editor/check-answers", function (req, res) {
  const formPages = req.session.data["formPages"] || [];
  const formData = req.session.data || {};
  res.render("titan-mvp-1.2/form-editor/check-answers", {
    data: { formPages: formPages },
    form: { name: formData.formName || "Form name" },
  });
});

// Route for prototype routing page
router.get("/titan-mvp-1.2/choose", function (req, res) {
  res.render("titan-mvp-1.2/choose");
});
router.get("/titan-mvp-1.2/choose.html", function (req, res) {
  res.render("titan-mvp-1.2/choose");
});

// Handle prototype routing selection
router.post("/titan-mvp-1.2/choose", function (req, res) {
  const selection = req.body.prototype;

  // Map selections to their corresponding routes
  const routeMap = {
    signIn: "/titan-mvp-1.2/sign-in",
    library: "/titan-mvp-1.2/library",
    newForm: "/titan-mvp-1.2/create-new-form/form-name",
    editor: "/titan-mvp-1.2/form-editor/listing",
    overview: "/titan-mvp-1.2/form-overview/index",
    "overview-index": "/titan-mvp-1.2/form-overview/index",
    "overview-support": "/titan-mvp-1.2/form-overview/index/support/phone",
    "overview-live": "/titan-mvp-1.2/form-overview/live/index",
    "editor-listing": "/titan-mvp-1.2/form-editor/listing",
    "editor-page-overview": "/titan-mvp-1.2/form-editor/page-overview",
    "editor-preview": "/titan-mvp-1.2/form-editor/preview",
  };

  // Redirect to the selected route or default to library if invalid selection
  const redirectPath = routeMap[selection] || "/titan-mvp-1.2/library";
  res.redirect(redirectPath);
});

// Helper function to convert email to semantic name
function emailToName(email) {
  if (!email) return "";
  const localPart = email.split("@")[0];
  const parts = localPart.split(/[._]/);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

// Welcome email preview (GET)
router.get("/titan-mvp-1.2/email/welcome-preview", function (req, res) {
  const data = {
    email: req.query.email || "email address",
    role: req.query.role || "Form creator",
    addedBy: "Daniel Da Silveria",
  };
  res.render("titan-mvp-1.2/email/welcome-email", {
    data: data,
  });
});

// Manage users page (GET)
router.get("/titan-mvp-1.2/roles/manage-users.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.users) req.session.data.users = [];
  // Add semantic name and lowercase role to each user
  const usersWithNames = req.session.data.users.map((user) => ({
    ...user,
    semanticName: emailToName(user.email),
    role: user.role ? user.role.toLowerCase() : user.role,
  }));
  // Store and clear the success message
  const successMessage = req.session.data.successMessage;
  delete req.session.data.successMessage;
  res.render("titan-mvp-1.2/roles/manage-users.html", {
    data: {
      users: usersWithNames,
      successMessage: successMessage,
    },
  });
});

// Edit user (GET)
router.get("/titan-mvp-1.2/roles/edit-user.html", function (req, res) {
  console.log("EXPLICIT ROUTE: /titan-mvp-1.2/roles/edit-user.html");
  if (!req.session.data) req.session.data = {};
  const email = req.query.email;
  const user = (req.session.data.users || []).find((u) => u.email === email);
  if (!user) {
    return res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  }
  const userWithName = {
    ...user,
    semanticName: emailToName(user.email),
  };
  res.render("titan-mvp-1.2/roles/edit-user.html", {
    data: { user: userWithName },
  });
});

// Remove user confirmation page (GET)
router.get("/titan-mvp-1.2/roles/remove-user.html", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = req.query.email;
  const user = (req.session.data.users || []).find((u) => u.email === email);
  if (!user) {
    return res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  }
  const userWithName = {
    ...user,
    semanticName: emailToName(user.email),
  };
  res.render("titan-mvp-1.2/roles/remove-user.html", {
    data: { user: userWithName },
  });
});

// Remove user (POST)
router.post("/titan-mvp-1.2/remove-user", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = req.body.email;
  req.session.data.users = (req.session.data.users || []).filter(
    (u) => u.email !== email
  );
  req.session.data.successMessage = `You removed ${emailToName(
    email
  )} from Forms Designer and we've sent them an email to let them know.`;
  req.session.save(function (err) {
    res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  });
});

// Catch-all route for any .html file in titan-mvp-1.2 (must be last)
router.get("/titan-mvp-1.2/*", function (req, res, next) {
  console.log("CATCH-ALL ROUTE: /titan-mvp-1.2/*", req.path);
  const path = req.path.replace(/^\/titan-mvp-1.2\//, "");
  if (!path.match(/^[a-zA-Z0-9\-_\/]+(\.html)?$/)) return next();
  const viewName = path.replace(/\.html$/, "");
  const formData = req.session.data || {};
  let users = formData.users || [];
  // Add semanticName and lowercase role
  users = users.map((user) => ({
    ...user,
    semanticName: emailToName(user.email),
    role: user.role ? user.role.toLowerCase() : user.role,
  }));
  // Clear success message after displaying
  const successMessage = formData.successMessage;
  if (formData.successMessage) {
    delete formData.successMessage;
  }
  res.render(
    `titan-mvp-1.2/${viewName}`,
    {
      data: {
        users: users,
        successMessage: successMessage,
      },
      form: {
        name: formData.formName || "Form name",
      },
    },
    function (err, html) {
      if (err) return next();
      res.send(html);
    }
  );
});

// Add user (POST)
router.post("/titan-mvp-1.2/save-user", function (req, res) {
  if (!req.session.data) req.session.data = {};
  if (!req.session.data.users) req.session.data.users = [];
  const newUser = {
    email: req.body.email,
    role: req.body.role,
  };
  req.session.data.users.push(newUser);
  req.session.data.successMessage =
    "You added " +
    emailToName(newUser.email) +
    " and we've sent them an email to let them know.";
  req.session.save(function (err) {
    res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  });
});

// Update user (POST)
router.post("/titan-mvp-1.2/update-user", function (req, res) {
  if (!req.session.data) req.session.data = {};
  const email = String(req.body.email || "");
  const newRole = req.body.role;
  const userIndex = (req.session.data.users || []).findIndex(
    (u) => u.email === email
  );
  if (userIndex !== -1) {
    req.session.data.users[userIndex].role = newRole;
  }
  req.session.data.successMessage = `You updated ${emailToName(
    email
  )}'s role to ${newRole}.`;
  req.session.save(function (err) {
    res.redirect("/titan-mvp-1.2/roles/manage-users.html");
  });
});
