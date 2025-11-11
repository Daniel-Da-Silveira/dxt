/**
 * AI Compliance Checker
 *
 * This service uses AI to review form content and structure against
 * GOV.UK standards, based on guidance from the Service Manual:
 * https://www.gov.uk/service-manual/design/form-structure
 *
 * It checks for plain English, accessibility, logical structure,
 * field types, validation, and a user-centred experience.
 */

const fs = require("fs");
const path = require("path");

class AIComplianceChecker {
  constructor() {
    this.gdsStandards = {
      content: {
        clarity: {
          description:
            "Write content in plain English that’s clear and concise",
          source:
            "https://www.gov.uk/guidance/content-design/writing-for-gov-uk",
        },
        accessibility: {
          description: "Ensure all content can be used by everyone",
          source:
            "https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag",
        },
        userCentered: {
          description: "Write content from the user's point of view",
          source:
            "https://www.gov.uk/guidance/content-design/user-centred-content",
        },
      },
      formDesign: {
        questionOrder: {
          description:
            "Ask questions in a logical order that matches the user’s journey",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        fieldLabels: {
          description:
            "Use labels that clearly describe what each field is for",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        errorMessages: {
          description:
            "Write error messages that are specific, clear and helpful",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        validation: {
          description:
            "Use validation rules that are necessary, not overly strict",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
      },
      formStructure: {
        oneThingPerPage: {
          description: "Each page should only ask about one thing at a time",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        questionProtocol: {
          description:
            "Only include questions with a clear reason for being asked",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        commonScenarios: {
          description:
            "Design with the most common user needs and journeys in mind",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        branchingLogic: {
          description:
            "Use conditional logic to only show questions when they’re relevant",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        fieldOptimization: {
          description:
            "Choose the right field types and group related fields logically",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
      },
      accessibility: {
        altText: {
          description: "Use descriptive alt text for all images",
          source:
            "https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag",
        },
        keyboardNavigation: {
          description:
            "Users must be able to navigate the form using a keyboard",
          source:
            "https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag",
        },
        screenReader: {
          description: "Ensure the form works well with screen readers",
          source:
            "https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag",
        },
        colorContrast: {
          description: "Use colour combinations with sufficient contrast",
          source:
            "https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag",
        },
      },
      userExperience: {
        progressIndication: {
          description: "Let users know where they are in the form",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        saveProgress: {
          description: "Allow users to save their progress in long forms",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        confirmation: {
          description:
            "Give users a clear confirmation when they submit the form",
          source: "https://www.gov.uk/service-manual/design/form-structure",
        },
        mobileOptimization: {
          description: "Forms must work well on mobile devices",
          source:
            "https://www.gov.uk/service-manual/design/making-your-service-work-on-mobile",
        },
      },
      govukStyleGuide: {
        sentenceCase: {
          description:
            "Use sentence case for all headings, questions and labels – not title case",
          source:
            "https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style",
        },
        avoidSymbols: {
          description:
            "Do not use symbols like & or / – write them out as 'and' or 'or'",
          source:
            "https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style",
        },
        plainWords: {
          description:
            "Use plain English instead of jargon or legalistic phrases",
          source:
            "https://www.gov.uk/guidance/content-design/writing-for-gov-uk",
        },
        contractions: {
          description:
            "Use contractions like 'you’ll' and 'we’ll' where appropriate to sound more human",
          source:
            "https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style",
        },
        punctuation: {
          description:
            "Avoid unnecessary punctuation – especially colons, semicolons and dashes",
          source:
            "https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style",
        },
        activeVoice: {
          description:
            "Use active voice – write 'Register the site' not 'The site must be registered'",
          source:
            "https://www.gov.uk/guidance/content-design/writing-for-gov-uk",
        },
      },
    };
  }

  // NEW: Load real form JSON for demo
  static loadDemoForm() {
    const demoPath = path.join(
      __dirname,
      "../data/demo-bat-mitigation-form.json"
    );
    const raw = fs.readFileSync(demoPath, "utf8");
    const jsonData = JSON.parse(raw);

    // Transform the JSON structure to match what the AI checker expects
    const transformedData = {
      formName: jsonData.name,
      formDetails: {
        team: {
          email: "bat-mitigation@defra.gov.uk",
        },
        organisation: {
          name: "Department for Environment, Food and Rural Affairs",
        },
        support: {
          email: "support@defra.gov.uk",
          phone: "0800 123 4567",
        },
        nextSteps: "You will receive a response within 10 working days",
        privacyNotice: "https://www.gov.uk/help/privacy-notice",
        dataProtection: true,
        userJourney:
          "Complete form → Submit → Receive confirmation → Get response",
        mobileOptimized: true,
        progressIndicator: true,
        mobileTested: false,
        customNextSteps: false,
        customUserJourney: false,
        defaultPrivacyNotice: true,
      },
      checkAnswersItems: [],
      sections: [
        {
          id: "section1",
          name: "Registration details",
          title: "Registration details",
        },
        { id: "section2", name: "Site information", title: "Site information" },
        { id: "section3", name: "Contact details", title: "Contact details" },
      ],
    };

    // Transform pages into checkAnswersItems format
    if (jsonData.pages) {
      jsonData.pages.forEach((page, pageIndex) => {
        // Add the page itself
        transformedData.checkAnswersItems.push({
          id: pageIndex + 1,
          type: "page",
          key: page.title,
          value: `Page ${pageIndex + 1}`,
          section: null,
          questions: [],
        });

        // Add each component as a question
        if (page.components) {
          page.components.forEach((component, compIndex) => {
            if (component.type !== "Html") {
              // Skip HTML content components
              transformedData.checkAnswersItems.push({
                id: `${pageIndex + 1}-${compIndex + 1}`,
                type: "question",
                key: component.title || component.name,
                value: this.getSampleValue(component.type),
                section: null,
                fieldType: component.type,
                hint: component.hint || "",
              });
            }
          });
        }
      });
    }

    return transformedData;
  }

  // Helper method to generate sample values based on field type
  static getSampleValue(fieldType) {
    const sampleValues = {
      TextField: "Sample text input",
      EmailAddressField: "user@example.com",
      TelephoneNumberField: "07700 900457",
      NumberField: "12345",
      RadiosField: "Yes",
      CheckboxesField: "Option 1",
      DatePartsField: "01 01 2024",
      TextareaField: "Sample textarea content",
      FileUploadField: "1 file uploaded",
      SelectField: "Option 1",
    };
    return sampleValues[fieldType] || "Sample value";
  }

  /**
   * Analyze form data for GDS compliance
   * @param {Object} formData - The form data to analyze
   * @returns {Object} Compliance analysis results
   */
  async analyzeForm(formData) {
    const analysis = {
      overallScore: 0,
      passed: false,
      issues: [],
      recommendations: [],
      categories: {
        content: { score: 0, issues: [], passed: false },
        formDesign: { score: 0, issues: [], passed: false },
        formStructure: { score: 0, issues: [], passed: false },
        accessibility: { score: 0, issues: [], passed: false },
        userExperience: { score: 0, issues: [], passed: false },
      },
    };

    // Simulate AI analysis with realistic checks
    await this.simulateAIAnalysis(formData, analysis);

    // Calculate overall score
    const categoryScores = Object.values(analysis.categories).map(
      (cat) => cat.score
    );
    analysis.overallScore = Math.round(
      categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
    );
    analysis.passed =
      analysis.overallScore >= 70 && analysis.issues.length <= 3;

    return analysis;
  }

  /**
   * Simulate AI analysis of form content
   * @param {Object} formData - Form data to analyze
   * @param {Object} analysis - Analysis object to populate
   */
  async simulateAIAnalysis(formData, analysis) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Content analysis
    this.analyzeContent(formData, analysis);

    // Form design analysis
    this.analyzeFormDesign(formData, analysis);

    // Form structure analysis (new category based on GDS guidance)
    this.analyzeFormStructure(formData, analysis);

    // Accessibility analysis
    this.analyzeAccessibility(formData, analysis);

    // User experience analysis
    this.analyzeUserExperience(formData, analysis);

    // GOV.UK Style Guide compliance analysis
    this.analyzeStyleGuideCompliance(formData, analysis);
  }

  /**
   * Extract form content for analysis
   */
  extractFormContent(formData) {
    const content = {
      formName: formData.formName || "Untitled Form",
      questions: [],
      pages: [],
      textContent: "",
      fieldTypes: [],
      examples: [],
    };

    // Extract questions from checkAnswersItems if available
    if (formData.checkAnswersItems) {
      formData.checkAnswersItems.forEach((item) => {
        if (item.type === "question") {
          content.questions.push({
            label: item.key,
            value: item.value,
            type: this.inferFieldType(item.key, item.value),
          });
          content.examples.push(`${item.key}: ${item.value}`);
        } else if (item.type === "page" && item.questions) {
          content.pages.push({
            title: item.key,
            questionCount: item.questions.length,
            questions: item.questions,
          });
          item.questions.forEach((q) => {
            content.examples.push(`${q.label}: ${q.value}`);
          });
        }
      });
    }

    // Extract text content for analysis
    content.textContent = JSON.stringify(formData).toLowerCase();

    return content;
  }

  /**
   * Infer field type from question label and value
   */
  inferFieldType(label, value) {
    const labelLower = label.toLowerCase();
    const valueStr = String(value).toLowerCase();

    if (labelLower.includes("email") || valueStr.includes("@")) return "email";
    if (labelLower.includes("phone") || labelLower.includes("number"))
      return "phone";
    if (labelLower.includes("date") || /\d{2}\s\d{2}\s\d{4}/.test(valueStr))
      return "date";
    if (labelLower.includes("address")) return "address";
    if (labelLower.includes("name")) return "text";
    if (
      labelLower.includes("yes") ||
      labelLower.includes("no") ||
      valueStr === "yes" ||
      valueStr === "no"
    )
      return "radio";
    if (/\d+/.test(valueStr) && !labelLower.includes("phone")) return "number";

    return "text";
  }

  /**
   * Analyze content for clarity and user-centeredness
   */
  analyzeContent(formData, analysis) {
    const contentIssues = [];
    let contentScore = 100;
    const formContent = this.extractFormContent(formData);

    // Check form name clarity
    if (formContent.formName && formContent.formName.length > 50) {
      contentIssues.push({
        severity: "Medium",
        category: "Content clarity",
        title: "Form name is too long",
        description: `Your form name "${formContent.formName}" is ${formContent.formName.length} characters long.`,
        recommendation:
          "Keep form names under 50 characters for better clarity.",
        example: `Current: "${
          formContent.formName
        }"\nSuggested: "${formContent.formName.substring(0, 47)}..."`,
        formExample: formContent.formName,
        source: this.gdsStandards.content.clarity.source,
      });
      contentScore -= 15;
    }

    // Check for technical language and unclear labels
    const technicalTerms = [
      "mitigation",
      "accreditation",
      "registration",
      "compliance",
      "documentation",
      "methodology",
      "regulatory",
      "stakeholder",
      "infrastructure",
      "utilization",
      "earned recognition",
      "annexes",
      "licence",
      "legal status",
      "governance structure",
      "named contact",
      "joint licensee",
      "utilize",
      "facilitate",
      "implement",
      "leverage",
      "optimize",
      "protocol",
    ];

    const foundTechnicalTerms = [];
    const technicalQuestions = [];

    formContent.questions.forEach((question) => {
      technicalTerms.forEach((term) => {
        if (question.label.toLowerCase().includes(term)) {
          foundTechnicalTerms.push({ term, question: question.label });
          technicalQuestions.push({
            question: question.label,
            technicalTerm: term,
          });
        }
      });
    });

    if (foundTechnicalTerms.length > 0) {
      const examples = foundTechnicalTerms
        .slice(0, 3)
        .map((item) => `"${item.question}" (contains "${item.term}")`)
        .join(", ");

      contentIssues.push({
        severity: "High",
        category: "Content clarity",
        title: "Technical language detected in questions",
        description: `Found ${foundTechnicalTerms.length} questions with technical terms that may confuse users.`,
        recommendation:
          "Replace technical terms with plain English alternatives.",
        example: `Instead of "earned recognition", use "approved status"\nInstead of "annexes", use "sections"\nInstead of "joint licensee", use "co-applicant"`,
        formExamples: foundTechnicalTerms.map((item) => item.question),
        source: this.gdsStandards.content.clarity.source,
      });
      contentScore -= 20;
    }

    // Check for unclear question labels - GOV.UK style guide allows "What is..." format
    const unclearPatterns = [
      /\b(please specify|other|additional|relevant)\b/i,
      /\b(if applicable|if any|if required)\b/i,
    ];

    const unclearQuestions = [];
    formContent.questions.forEach((question) => {
      unclearPatterns.forEach((pattern) => {
        if (pattern.test(question.label)) {
          unclearQuestions.push(question.label);
        }
      });
    });

    // Check for overly long questions (GOV.UK recommends concise but clear)
    const longQuestions = formContent.questions.filter(
      (q) => q.label.length > 100
    );
    unclearQuestions.push(...longQuestions.map((q) => q.label));

    if (unclearQuestions.length > 0) {
      contentIssues.push({
        severity: "Medium",
        category: "Content clarity",
        title: "Unclear or overly long question labels",
        description: `Found ${unclearQuestions.length} questions that may be unclear to users.`,
        recommendation:
          "Make question labels clear, concise, and specific. GOV.UK style guide allows 'What is...' format for questions.",
        example: `Instead of "Please specify any other relevant information", use "Additional comments"\nInstead of very long questions, break them into shorter, clearer statements`,
        formExamples: unclearQuestions.slice(0, 5),
        source: this.gdsStandards.content.clarity.source,
      });
      contentScore -= 15;
    }

    analysis.categories.content.issues = contentIssues;
    analysis.categories.content.score = Math.max(0, contentScore);
    analysis.categories.content.passed = contentScore >= 70;
    analysis.issues.push(...contentIssues);
  }

  /**
   * Analyze form design and field types
   */
  analyzeFormDesign(formData, analysis) {
    const designIssues = [];
    let designScore = 100;
    const formContent = this.extractFormContent(formData);

    // Check for appropriate field types
    const inappropriateFieldTypes = [];
    formContent.questions.forEach((question) => {
      const label = question.label.toLowerCase();
      const fieldType = question.fieldType || question.type;

      // Check for email fields
      if (
        (label.includes("email") || label.includes("e-mail")) &&
        fieldType !== "EmailAddressField"
      ) {
        inappropriateFieldTypes.push({
          question: question.label,
          currentType: fieldType,
          suggestedType: "email field",
          reason: "Email validation and formatting",
        });
      }

      // Check for phone fields
      if (
        (label.includes("phone") ||
          label.includes("telephone") ||
          label.includes("number")) &&
        fieldType !== "TelephoneNumberField"
      ) {
        inappropriateFieldTypes.push({
          question: question.label,
          currentType: fieldType,
          suggestedType: "phone number field",
          reason: "Phone number formatting and validation",
        });
      }

      // Check for date fields
      if (label.includes("date") && fieldType !== "DatePartsField") {
        inappropriateFieldTypes.push({
          question: question.label,
          currentType: fieldType,
          suggestedType: "date field",
          reason: "Date validation and user-friendly input",
        });
      }

      // Check for number fields
      if (
        (label.includes("number") ||
          label.includes("amount") ||
          label.includes("quantity")) &&
        fieldType !== "NumberField" &&
        !label.includes("phone")
      ) {
        inappropriateFieldTypes.push({
          question: question.label,
          currentType: fieldType,
          suggestedType: "number field",
          reason: "Numeric validation and formatting",
        });
      }

      // Check for address fields
      if (label.includes("address") && fieldType !== "AddressField") {
        inappropriateFieldTypes.push({
          question: question.label,
          currentType: fieldType,
          suggestedType: "address field",
          reason: "Structured address input",
        });
      }
    });

    if (inappropriateFieldTypes.length > 0) {
      designIssues.push({
        severity: "Medium",
        category: "Field types",
        title: "Some fields could use better field types",
        description: `Found ${inappropriateFieldTypes.length} fields that could be improved by using more specific field types.`,
        recommendation:
          "Using the right field type helps users enter information correctly and provides better validation.",
        example: inappropriateFieldTypes
          .slice(0, 3)
          .map(
            (item) =>
              `"${item.question}" - consider using a ${item.suggestedType} for better user experience`
          )
          .join("\n"),
        formExamples: inappropriateFieldTypes.map((item) => item.question),
        source: this.gdsStandards.formDesign.fieldLabels.source,
      });
      designScore -= 15;
    }

    // Check for fields that might need custom validation
    const fieldsNeedingCustomValidation = formContent.questions.filter((q) => {
      const label = q.label.toLowerCase();
      return (
        label.includes("registration") ||
        label.includes("accreditation") ||
        label.includes("licence") ||
        label.includes("certificate") ||
        label.includes("reference")
      );
    });

    if (fieldsNeedingCustomValidation.length > 0) {
      designIssues.push({
        severity: "Low",
        category: "Field validation",
        title: "Some fields might need specific validation rules",
        description: `Found ${fieldsNeedingCustomValidation.length} fields that may need special validation to ensure users enter information in the correct format.`,
        recommendation:
          "Consider adding validation rules to help users enter information in the right format.",
        example: fieldsNeedingCustomValidation
          .slice(0, 3)
          .map(
            (field) => `"${field.label}" - check if it needs format validation`
          )
          .join("\n"),
        formExamples: fieldsNeedingCustomValidation.map((field) => field.label),
        source: this.gdsStandards.formDesign.validation.source,
      });
      designScore -= 5;
    }

    analysis.categories.formDesign.issues = designIssues;
    analysis.categories.formDesign.score = Math.max(0, designScore);
    analysis.categories.formDesign.passed = designScore >= 70;
    analysis.issues.push(...designIssues);
  }

  /**
   * Analyze form structure based on GDS guidance
   */
  analyzeFormStructure(formData, analysis) {
    const structureIssues = [];
    let structureScore = 100;
    const formContent = this.extractFormContent(formData);

    // Check for one thing per page principle
    const pagesWithMultipleQuestions = formContent.pages.filter(
      (page) => page.questionCount > 3
    );

    if (pagesWithMultipleQuestions.length > 0) {
      structureIssues.push({
        severity: "Medium",
        category: "Form structure",
        title: "Pages with too many questions",
        description: `Found ${pagesWithMultipleQuestions.length} pages that may have too many questions per page.`,
        recommendation:
          "Consider splitting complex pages into simpler, single-purpose pages.",
        example: `Split "${pagesWithMultipleQuestions[0].title}" into separate pages:\n• Registration details\n• Site information\n• Contact information`,
        formExamples: pagesWithMultipleQuestions.map((page) => page.title),
        source: this.gdsStandards.formStructure.oneThingPerPage.source,
      });
      structureScore -= 20;
    }

    // Check for logical question order
    const questionOrder = formContent.questions.map((q) =>
      q.label.toLowerCase()
    );
    const eligibilityKeywords = [
      "registered",
      "eligible",
      "qualify",
      "permit",
      "license",
      "accreditation",
      "recognition",
    ];

    const eligibilityQuestions = questionOrder.filter((question) =>
      eligibilityKeywords.some((keyword) => question.includes(keyword))
    );

    if (eligibilityQuestions.length > 0) {
      const firstEligibilityIndex = questionOrder.findIndex((question) =>
        eligibilityKeywords.some((keyword) => question.includes(keyword))
      );

      if (firstEligibilityIndex > 2) {
        structureIssues.push({
          severity: "Medium",
          category: "Form structure",
          title: "Eligibility questions not prioritized",
          description:
            "Questions that determine eligibility should come first to avoid wasting users' time.",
          recommendation:
            "Move eligibility questions to the beginning of the form.",
          example: `Move "${eligibilityQuestions[0]}" to be one of the first questions`,
          formExamples: eligibilityQuestions,
          source: this.gdsStandards.formStructure.questionProtocol.source,
        });
        structureScore -= 15;
      }
    }

    // Check for question justification (complex questions need clear purpose)
    const complexQuestions = formContent.questions.filter((q) => {
      const label = q.label.toLowerCase();
      return (
        q.label.length > 80 ||
        label.includes("statement") ||
        label.includes("document") ||
        label.includes("evidence") ||
        label.includes("accreditation") ||
        label.includes("recognition") ||
        label.includes("legal status") ||
        label.includes("governance")
      );
    });

    if (complexQuestions.length > 0) {
      structureIssues.push({
        severity: "High",
        category: "Question justification",
        title: "Complex questions without clear justification",
        description: `Found ${complexQuestions.length} questions that may need clearer justification.`,
        recommendation:
          "Create a question protocol that justifies each field and its purpose.",
        example: `For "${complexQuestions[0].label}":\n• Why is this information needed?\n• How will it be used?\n• What happens if it's not provided?`,
        formExamples: complexQuestions.map((q) => q.label),
        source: this.gdsStandards.formStructure.questionProtocol.source,
      });
      structureScore -= 25;
    }

    // Check for branching logic opportunities
    const conditionalQuestions = formContent.questions.filter((q) => {
      const label = q.label.toLowerCase();
      return (
        label.includes("if") ||
        label.includes("other") ||
        label.includes("specify") ||
        label.includes("additional")
      );
    });

    if (conditionalQuestions.length > 0) {
      structureIssues.push({
        severity: "Medium",
        category: "Form structure",
        title: "Opportunities for branching logic",
        description: `Found ${conditionalQuestions.length} questions that could benefit from conditional logic.`,
        recommendation:
          "Consider using branching logic to show only relevant questions to users.",
        example: `"${conditionalQuestions[0].label}" could be shown conditionally based on previous answers`,
        formExamples: conditionalQuestions.map((q) => q.label),
        source: this.gdsStandards.formStructure.branchingLogic.source,
      });
      structureScore -= 10;
    }

    // Note: Form length check moved to analyzeUserExperience to avoid duplication

    analysis.categories.formStructure.issues = structureIssues;
    analysis.categories.formStructure.score = Math.max(0, structureScore);
    analysis.categories.formStructure.passed = structureScore >= 70;
    analysis.issues.push(...structureIssues);
  }
  /**
   * Analyze accessibility features
   */
  analyzeAccessibility(formData, analysis) {
    const accessibilityIssues = [];
    let accessibilityScore = 100;
    const formContent = this.extractFormContent(formData);

    // Check for clear field labels for screen readers
    const unclearLabels = formContent.questions.filter((q) => {
      const label = q.label.toLowerCase();
      return (
        q.label.length < 3 ||
        label.includes("field") ||
        label.includes("input") ||
        label.length > 100
      );
    });

    if (unclearLabels.length > 0) {
      accessibilityIssues.push({
        severity: "Medium",
        category: "Accessibility",
        title: "Unclear field labels for screen readers",
        description: `Found ${unclearLabels.length} fields with unclear labels that may confuse screen readers.`,
        recommendation: "Use clear, descriptive labels for all form fields.",
        example: `Instead of "Field 1", use a specific description\nInstead of "Input", use a clear description`,
        formExamples: unclearLabels.map((q) => q.label),
        source: this.gdsStandards.accessibility.screenReader.source,
      });
      accessibilityScore -= 15;
    }

    // Check for missing hint text on complex fields
    const complexFieldsWithoutHints = formContent.questions.filter((q) => {
      const label = q.label.toLowerCase();
      return (
        (label.includes("registration") ||
          label.includes("accreditation") ||
          label.includes("licence") ||
          label.includes("certificate")) &&
        !q.hint
      );
    });

    if (complexFieldsWithoutHints.length > 0) {
      accessibilityIssues.push({
        severity: "Low",
        category: "Accessibility",
        title: "Complex fields missing hint text",
        description: `Found ${complexFieldsWithoutHints.length} complex fields that could benefit from hint text.`,
        recommendation:
          "Add helpful hint text to complex fields to improve accessibility.",
        example: `For "${complexFieldsWithoutHints[0].label}", add hint text explaining the expected format`,
        formExamples: complexFieldsWithoutHints.map((q) => q.label),
        source: this.gdsStandards.accessibility.screenReader.source,
      });
      accessibilityScore -= 10;
    }

    analysis.categories.accessibility.issues = accessibilityIssues;
    analysis.categories.accessibility.score = Math.max(0, accessibilityScore);
    analysis.categories.accessibility.passed = accessibilityScore >= 70;
    analysis.issues.push(...accessibilityIssues);
  }

  /**
   * Analyze user experience aspects
   */
  analyzeUserExperience(formData, analysis) {
    const uxIssues = [];
    let uxScore = 100;
    const formContent = this.extractFormContent(formData);

    // Check form length and suggest breaking into sections
    const totalQuestions = formContent.questions.length;

    if (totalQuestions > 15) {
      uxIssues.push({
        severity: "Medium",
        category: "Form length",
        title: "Long form detected",
        description: `Form has ${totalQuestions} questions which may be overwhelming for users.`,
        recommendation: "Consider breaking the form into more than one form",
        example: `Split your ${totalQuestions} form into logical sections:\n1. Registration details\n2. Site information\n3. Contact details\n4. Supporting documents`,
        formExample: `${totalQuestions} total questions`,
        source: this.gdsStandards.userExperience.progressIndication.source,
      });
      uxScore -= 15;
    }

    // Check for pages with too many questions
    const pagesWithMultipleQuestions = formContent.pages.filter(
      (page) => page.questionCount > 3
    );

    if (pagesWithMultipleQuestions.length > 0) {
      uxIssues.push({
        severity: "Medium",
        category: "Form length",
        title: "Pages with too many questions",
        description: `Found ${pagesWithMultipleQuestions.length} pages that may have too many questions per page.`,
        recommendation:
          "Consider splitting complex pages into simpler, single-purpose pages.",
        example: `Split "${pagesWithMultipleQuestions[0].title}" into separate pages with fewer questions each`,
        formExamples: pagesWithMultipleQuestions.map((page) => page.title),
        source: this.gdsStandards.userExperience.progressIndication.source,
      });
      uxScore -= 10;
    }

    // Check for logical grouping opportunities
    const relatedQuestions = formContent.questions.filter((q) => {
      const label = q.label.toLowerCase();
      return (
        label.includes("name") ||
        label.includes("email") ||
        label.includes("phone") ||
        label.includes("address")
      );
    });

    if (relatedQuestions.length > 3) {
      uxIssues.push({
        severity: "Low",
        category: "Form length",
        title: "Consider grouping related questions",
        description: `Found ${relatedQuestions.length} related questions that could be grouped together.`,
        recommendation:
          "Group related questions into logical sections to improve user experience.",
        example:
          "Group contact information questions together:\n• Full name\n• Email address\n• Phone number\n• Address",
        formExamples: relatedQuestions.map((q) => q.label),
        source: this.gdsStandards.userExperience.progressIndication.source,
      });
      uxScore -= 5;
    }

    analysis.categories.userExperience.issues = uxIssues;
    analysis.categories.userExperience.score = Math.max(0, uxScore);
    analysis.categories.userExperience.passed = uxScore >= 70;
    analysis.issues.push(...uxIssues);
  }

  /**
   * Analyze GOV.UK Style Guide compliance
   */
  analyzeStyleGuideCompliance(formData, analysis) {
    const styleIssues = [];
    let styleScore = 100;
    const formContent = this.extractFormContent(formData);

    // Check for contractions - GOV.UK style guide allows contractions for readability
    // Only flag excessive or inappropriate contractions
    const problematicContractions = [
      "can't", // GOV.UK prefers "cannot" in formal content
      "won't", // GOV.UK prefers "will not" in formal content
      "don't", // Can be acceptable but check context
    ];

    const foundProblematicContractions = [];
    formContent.questions.forEach((question) => {
      problematicContractions.forEach((contraction) => {
        if (question.label.toLowerCase().includes(contraction)) {
          foundProblematicContractions.push({
            question: question.label,
            contraction: contraction,
          });
        }
      });
    });

    if (foundProblematicContractions.length > 0) {
      styleIssues.push({
        severity: "Low",
        category: "Style guide",
        title: "Some contractions may need review",
        description: `Found ${foundProblematicContractions.length} questions using contractions that may need review for formal content.`,
        recommendation:
          "GOV.UK style guide allows contractions for readability, but consider using full words for very formal content.",
        example: `Consider: "cannot" instead of "can't" for formal requirements\n"will not" instead of "won't" for official statements`,
        formExamples: foundProblematicContractions.map((item) => item.question),
        source: this.gdsStandards.govukStyleGuide.contractions.source,
      });
      styleScore -= 5;
    }

    // Check for unnecessary capitalisation - GOV.UK uses sentence case
    const overCapitalised = formContent.questions.filter((q) => {
      const words = q.label.split(" ");
      const capitalisedWords = words.filter(
        (word) =>
          word.length > 3 &&
          word[0] === word[0].toUpperCase() &&
          ![
            "Name",
            "Email",
            "Phone",
            "Address",
            "Date",
            "Number",
            "Registration",
            "Accreditation",
            "England",
            "Wales",
            "Scotland",
            "Northern",
            "Ireland",
            "United",
            "Kingdom",
            "Government",
            "Department",
            "Service",
            "Office",
          ].includes(word)
      );
      return capitalisedWords.length > 3; // More lenient threshold
    });

    if (overCapitalised.length > 0) {
      styleIssues.push({
        severity: "Low",
        category: "Style guide",
        title: "Unnecessary capitalisation detected",
        description: `Found ${overCapitalised.length} questions with unnecessary capitalisation.`,
        recommendation:
          "GOV.UK style guide uses sentence case. Only capitalise proper nouns and the first word of sentences.",
        example: `Instead of "What Is Your Full Name?", use "What is your full name?"\nInstead of "Please Enter Your Details", use "Please enter your details"`,
        formExamples: overCapitalised.map((q) => q.label),
        source: this.gdsStandards.govukStyleGuide.sentenceCase.source,
      });
      styleScore -= 5;
    }

    // Check for inconsistent punctuation
    const inconsistentPunctuation = formContent.questions.filter((q) => {
      const label = q.label;
      return (
        (label.includes("?") && label.includes(".")) ||
        (label.includes("!") && label.includes(".")) ||
        (label.endsWith("?") && label.includes("?")) ||
        (label.endsWith("!") && label.includes("!"))
      );
    });

    if (inconsistentPunctuation.length > 0) {
      styleIssues.push({
        severity: "Low",
        category: "Style guide",
        title: "Inconsistent punctuation detected",
        description: `Found ${inconsistentPunctuation.length} questions with inconsistent punctuation.`,
        recommendation:
          "Use consistent punctuation. Avoid mixing question marks with periods or exclamation marks.",
        example: `Instead of "What is your name? Please provide details.", use "What is your name?"\nInstead of "Please confirm! Thank you.", use "Please confirm."`,
        formExamples: inconsistentPunctuation.map((q) => q.label),
        source: this.gdsStandards.govukStyleGuide.punctuation.source,
      });
      styleScore -= 5;
    }

    // Check for jargon and technical terms - GOV.UK style guide has specific words to avoid
    const jargonTerms = [
      "utilize",
      "utilise", // GOV.UK: use "use" instead
      "facilitate", // GOV.UK: use "help" or be specific
      "implement", // GOV.UK: use "put in place" or be specific
      "leverage", // GOV.UK: use "use" or "influence"
      "optimize",
      "optimise", // GOV.UK: be specific about what you're improving
      "methodology", // GOV.UK: use "approach" or "method"
      "protocol", // GOV.UK: use "procedure" or "process"
      "stakeholder", // GOV.UK: use "people" or be specific
      "infrastructure", // GOV.UK: be specific about what you mean
      "utilization",
      "utilisation", // GOV.UK: use "use"
      "facilitation", // GOV.UK: be specific about what you're helping with
      "implementation", // GOV.UK: be specific about what you're putting in place
      "optimization",
      "optimisation", // GOV.UK: be specific about what you're improving
    ];

    const foundJargon = [];
    formContent.questions.forEach((question) => {
      jargonTerms.forEach((term) => {
        if (question.label.toLowerCase().includes(term)) {
          foundJargon.push({
            question: question.label,
            jargon: term,
          });
        }
      });
    });

    if (foundJargon.length > 0) {
      styleIssues.push({
        severity: "High",
        category: "Style guide",
        title: "Jargon and technical terms detected",
        description: `Found ${foundJargon.length} questions using jargon that may confuse users.`,
        recommendation:
          "Use plain English instead of jargon. GOV.UK style guide recommends simple, clear language.",
        example: `Instead of "utilize", use "use"\nInstead of "facilitate", use "help"\nInstead of "implement", use "put in place"\nInstead of "leverage", use "use"`,
        formExamples: foundJargon.map((item) => item.question),
        source: this.gdsStandards.govukStyleGuide.plainWords.source,
      });
      styleScore -= 20;
    }

    // Check for passive voice
    const passiveVoicePatterns = [
      /\b(is|are|was|were|be|been|being)\s+\w+ed\b/i,
      /\b(has|have|had)\s+been\s+\w+ing\b/i,
    ];

    const passiveVoiceQuestions = [];
    formContent.questions.forEach((question) => {
      passiveVoicePatterns.forEach((pattern) => {
        if (pattern.test(question.label)) {
          passiveVoiceQuestions.push(question.label);
        }
      });
    });

    if (passiveVoiceQuestions.length > 0) {
      styleIssues.push({
        severity: "Medium",
        category: "Style guide",
        title: "Passive voice detected",
        description: `Found ${passiveVoiceQuestions.length} questions using passive voice.`,
        recommendation:
          "Use active voice instead of passive voice for clearer, more direct communication.",
        example: `Instead of "Your details will be processed", use "We will process your details"\nInstead of "The form has been completed", use "You have completed the form"`,
        formExamples: passiveVoiceQuestions,
        source: this.gdsStandards.govukStyleGuide.activeVoice.source,
      });
      styleScore -= 10;
    }

    // Check for unnecessary words and phrases - GOV.UK style guide recommends direct language
    const unnecessaryPhrases = [
      "please note that", // GOV.UK: be direct
      "it should be noted that", // GOV.UK: be direct
      "kindly", // GOV.UK: not needed
      "please be advised", // GOV.UK: be direct
      "as per", // GOV.UK: use "according to" or "under"
      "in accordance with", // GOV.UK: use "under" or "according to"
      "with reference to", // GOV.UK: use "about" or be direct
      "pursuant to", // GOV.UK: use "under" or "according to"
    ];

    const foundUnnecessaryPhrases = [];
    formContent.questions.forEach((question) => {
      unnecessaryPhrases.forEach((phrase) => {
        if (question.label.toLowerCase().includes(phrase)) {
          foundUnnecessaryPhrases.push({
            question: question.label,
            phrase: phrase,
          });
        }
      });
    });

    if (foundUnnecessaryPhrases.length > 0) {
      styleIssues.push({
        severity: "Medium",
        category: "Style guide",
        title: "Unnecessary formal phrases detected",
        description: `Found ${foundUnnecessaryPhrases.length} questions using unnecessarily formal phrases.`,
        recommendation:
          "Remove unnecessary formal phrases. GOV.UK style guide recommends direct, simple language.",
        example: `Instead of "Please note that you must provide", use "You must provide"\nInstead of "As per the requirements", use "Under the requirements"`,
        formExamples: foundUnnecessaryPhrases.map((item) => item.question),
        source: this.gdsStandards.govukStyleGuide.plainWords.source,
      });
      styleScore -= 10;
    }

    // Check for consistent terminology
    const terminologyVariations = {
      email: ["email", "e-mail", "Email", "E-mail"],
      phone: ["phone", "telephone", "Phone", "Telephone"],
      name: ["name", "full name", "Name", "Full name"],
      address: ["address", "Address", "postal address", "Postal address"],
    };

    const inconsistentTerminology = [];
    Object.entries(terminologyVariations).forEach(([standard, variations]) => {
      const foundVariations = formContent.questions.filter((q) =>
        variations.some((variant) => q.label.toLowerCase().includes(variant))
      );
      if (foundVariations.length > 1) {
        inconsistentTerminology.push({
          term: standard,
          variations: foundVariations.map((q) => q.label),
        });
      }
    });

    if (inconsistentTerminology.length > 0) {
      styleIssues.push({
        severity: "Medium",
        category: "Style guide",
        title: "Inconsistent terminology detected",
        description: `Found inconsistent use of terms across the form.`,
        recommendation:
          "Use consistent terminology throughout the form. Choose one term and stick to it.",
        example: `Choose one term and use it consistently:\n• "email" or "e-mail" (not both)\n• "phone" or "telephone" (not both)\n• "name" or "full name" (not both)`,
        formExamples: inconsistentTerminology.map((item) => item.variations[0]),
        source: this.gdsStandards.govukStyleGuide.sentenceCase.source,
      });
      styleScore -= 10;
    }

    // Add style guide category to analysis
    if (!analysis.categories.styleGuide) {
      analysis.categories.styleGuide = { score: 0, issues: [], passed: false };
    }

    analysis.categories.styleGuide.issues = styleIssues;
    analysis.categories.styleGuide.score = Math.max(0, styleScore);
    analysis.categories.styleGuide.passed = styleScore >= 70;
    analysis.issues.push(...styleIssues);
  }

  /**
   * Generate detailed recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallScore < 70) {
      recommendations.push({
        priority: "high",
        title: "Address critical issues first",
        description:
          "Focus on fixing critical and high-severity issues before making the form live.",
      });
    }

    if (analysis.categories.content.score < 70) {
      recommendations.push({
        priority: "medium",
        title: "Improve content clarity",
        description:
          "Review and simplify language to make it more user-friendly.",
      });
    }

    if (analysis.categories.formDesign.score < 70) {
      recommendations.push({
        priority: "high",
        title: "Complete essential form setup",
        description:
          "Ensure all required fields and contact information are properly configured.",
      });
    }

    if (analysis.categories.formStructure.score < 70) {
      recommendations.push({
        priority: "medium",
        title: "Optimize form structure",
        description:
          "Follow GDS guidance on one thing per page and question protocols.",
      });
    }

    return recommendations;
  }
}

module.exports = AIComplianceChecker;
