# Defra Forms Builder - Architecture Reference Guide

## Overview
This document provides a comprehensive reference for the Defra Forms Builder architecture, data models, and implementation patterns. Use this as a guide when designing new features.

---

## 1. Application Architecture

### 1.1 Technology Stack
- **Framework**: GOV.UK Prototype Kit (Express.js + Nunjucks)
- **Frontend**: GOV.UK Design System + Defra customizations
- **Styling**: SCSS with GOV.UK Frontend
- **JavaScript**: Vanilla JS + custom components
- **Session Storage**: Express session middleware
- **File Structure**: MVC pattern with routes, views, and services

### 1.2 Project Structure
```
app/
├── assets/           # Static assets (CSS, JS, images)
├── components/       # Reusable UI components
├── config/          # Configuration files
├── data/            # Static data and content
├── routes/          # Route handlers
├── services/        # Business logic services
└── views/           # Nunjucks templates
```

---

## 2. Data Models & Session Structure

### 2.1 Core Session Data Structure
```javascript
req.session.data = {
  // Form metadata
  formName: "Form Name",
  formDetails: {
    name: "Form Name",
    description: "Form description",
    organization: "Organization name",
    lastUpdated: "2024-01-01T00:00:00.000Z"
  },

  // Form structure
  formPages: [],           // Array of form pages
  sections: [],            // Form sections (for organization)

  // Navigation state
  currentPageIndex: 0,     // Current page being edited
  currentQuestionIndex: 0, // Current question being edited

  // Check answers configuration
  checkAnswersItems: [],   // Items to show on check answers page

  // AI form creation data
  aiFormData: {
    formAim: "",
    pageDescription: "",
    referenceLinks: "",
    questionProtocol: "",
    wireframeUpload: "",
    conditionalLogic: "",
    taskStatuses: {}
  }
}
```

### 2.2 Form Page Structure
```javascript
{
  pageId: "unique-page-id",
  pageType: "question|guidance|check-answers|confirmation|exit",
  pageHeading: "Page title",
  pageDescription: "Optional page description",

  // Questions array (for question pages)
  questions: [
    {
      questionId: "unique-question-id",
      type: "text|date|email|phone|address|file|list",
      subType: "short-answer|long-answer|yes-no|radios|checkboxes|select|autocomplete",
      label: "Question text",
      hint: "Optional hint text",

      // Validation rules
      validation: {
        required: boolean,
        pattern: "regex-pattern",
        minLength: number,
        maxLength: number,
        min: number,        // For numeric inputs
        max: number         // For numeric inputs
      },

      // Options for list-type questions
      options: [
        {
          value: "option-value",
          text: "Option text",
          hint: "Optional option hint"
        }
      ],

      // File upload specific
      fileTypes: ["pdf", "doc", "jpg"], // For file uploads
      maxFileSize: 10000000,            // In bytes

      // Repeater configuration
      isRepeater: boolean,
      repeaterLabel: "Add another item",
      maxRepeats: number
    }
  ],

  // Page-level conditions
  conditions: [
    {
      id: "condition-id",
      conditionName: "Human readable name",
      question: "question-id",
      operator: "is|is-not",
      value: "selected-value"
    }
  ],

  // Metadata
  lastUpdated: "2024-01-01T00:00:00.000Z",
  isExitPage: boolean
}
```

### 2.3 Question Types Reference

#### Text Questions
```javascript
{
  type: "text",
  subType: "short-answer|long-answer",
  validation: {
    required: true,
    minLength: 1,
    maxLength: 100
  }
}
```

#### Date Questions
```javascript
{
  type: "date",
  subType: "date|month-year|year",
  validation: {
    required: true
  }
}
```

#### Contact Questions
```javascript
{
  type: "email|phone|address",
  validation: {
    required: true
  }
}
```

#### File Upload Questions
```javascript
{
  type: "file",
  subType: "fileupload",
  fileTypes: ["documents", "images", "tabular"],
  fileOptions: {
    documents: ["pdf", "doc", "docx"],
    images: ["jpg", "png", "gif"],
    tabular: ["csv", "xlsx", "xls"]
  },
  validation: {
    required: true,
    maxFileSize: 10000000
  }
}
```

#### List Questions
```javascript
{
  type: "list",
  subType: "yes-no|radios|checkboxes|select|autocomplete",
  options: [
    { value: "yes", text: "Yes" },
    { value: "no", text: "No" }
  ],
  validation: {
    required: true
  }
}
```

---

## 3. Routing Patterns

### 3.1 Route Structure
All routes follow the pattern: `/titan-mvp-1.2/[area]/[action]`

#### Form Editor Routes
```
/titan-mvp-1.2/form-editor/
├── listing                    # Main form editor page
├── page-overview             # Individual page overview
├── page-type                 # Choose page type
├── question-type/
│   ├── [type]/edit-nf        # Edit specific question type
│   └── [type]/configuration  # Configure question settings
├── conditions/
│   ├── create-condition-form # Create new condition
│   ├── manager              # Manage existing conditions
│   └── page-level           # Page-level condition setup
├── check-answers/
│   ├── organize             # Organize check answers items
│   └── settings             # Check answers settings
└── guidance/
    └── configuration        # Guidance page configuration
```

#### Form Overview Routes
```
/titan-mvp-1.2/form-overview/
├── index                    # Main overview page
├── submissions/             # Form submissions
└── simplified/              # Simplified overview variant
```

#### AI Features Routes
```
/titan-mvp-1.2/ai/
├── section-based-form-creation    # Step-by-step AI form creation
├── tasklist-form-creation         # Tasklist-based AI form creation
└── compliance-checker             # AI compliance checking
```

### 3.2 Route Handler Pattern
```javascript
// GET route example
router.get("/titan-mvp-1.2/form-editor/question-type/:type/edit-nf", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;
  const questionType = req.params.type;

  const currentPage = formPages[pageIndex];

  res.render("titan-mvp-1.2/form-editor/question-type/" + questionType + "/edit-nf", {
    form: formData.formDetails,
    currentPage: currentPage,
    questionType: questionType,
    pageNumber: pageIndex + 1,
    questionNumber: (formData.currentQuestionIndex || 0) + 1
  });
});

// POST route example
router.post("/titan-mvp-1.2/form-editor/question-type/:type/configuration", (req, res) => {
  const formData = req.session.data || {};
  const formPages = formData.formPages || [];
  const pageIndex = formData.currentPageIndex || 0;

  // Update form data
  formPages[pageIndex] = {
    ...formPages[pageIndex],
    questions: [{
      ...formPages[pageIndex].questions[0],
      label: req.body.questionLabel,
      hint: req.body.questionHint,
      validation: {
        required: req.body.required === "true"
      }
    }],
    lastUpdated: new Date().toISOString()
  };

  // Update session
  req.session.data = {
    ...formData,
    formPages: formPages
  };

  res.redirect("/titan-mvp-1.2/form-editor/page-overview");
});
```

---

## 4. Template Structure & Patterns

### 4.1 Base Template Structure
```html
{% extends "layouts/main.html" %}
{% from "components/service-header/macro.njk" import serviceHeader %}

{% set pageName %}Page Title - {{ form.name }}{% endset %}

{% block header %}
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Form Designer",
  serviceName: "",
  containerClasses: containerClasses,
  accountName: "Chris Smith",
  homepageLink: "/",
  signOutLink: "/onboarding/sign-out-confirmation",
  navigationItems: [
    { href: "/titan-mvp-1.2/library.html", text: "Forms library", id: "nav-library" },
    { href: "/cph-overview/draft/complete-clean.html", text: "Overview", id: "nav-overview" },
    { href: "/titan-mvp-1.2/form-editor/listing", text: "Editor", id: "nav-editor" }
  ],
  activeLinkId: "nav-editor"
}) }}

<div class="x-govuk-masthead x-govuk-masthead--large">
  <div class="govuk-width-container">
    {{ govukBackLink({
      classes: "govuk-back-link--inverse govuk-!-margin-bottom-0",
      text: "Back",
      href: "/titan-mvp-1.2/form-editor/listing.html"
    }) }}

    <hr class="govuk-section-break govuk-section-break--m govuk-section-break--visible"
        style="border-bottom: 1px solid white; margin-bottom: 0" />

    <div class="govuk-grid-row">
      <div class="govuk-grid-column-full-from-desktop">
        <h1 class="x-govuk-masthead__title">{{ form.name }}</h1>
      </div>
    </div>
  </div>
</div>
{% endblock %}

{% block content %}
<div class="govuk-grid-row">
  <div class="govuk-grid-column-full">
    <div class="govuk-grid-row">
      <!-- Left Column: Form Controls -->
      <div class="govuk-grid-column-one-half-from-desktop">
        <!-- Form content here -->
      </div>

      <!-- Right Column: Preview -->
      <div class="govuk-grid-column-one-half-from-desktop">
        <!-- Preview content here -->
      </div>
    </div>
  </div>
</div>
{% endblock %}
```

### 4.2 Form Component Patterns

#### Form Groups
```html
{{ govukFormGroup({
  errorMessage: errorMessage
}) }}
  {{ govukLabel({
    text: "Label text",
    classes: "govuk-label--m",
    isPageHeading: false,
    for: "input-id"
  }) }}

  {{ govukHint({
    text: "Hint text"
  }) }}

  {{ govukInput({
    id: "input-id",
    name: "inputName",
    value: data.inputName,
    classes: "govuk-input--width-20"
  }) }}
{{ govukFormGroup() }}
```

#### Radio Groups
```html
{{ govukRadios({
  name: "radioGroup",
  fieldset: {
    legend: {
      text: "Choose an option",
      isPageHeading: true,
      classes: "govuk-fieldset__legend--l"
    }
  },
  items: [
    {
      value: "option1",
      text: "Option 1",
      hint: { text: "Option 1 hint" }
    },
    {
      value: "option2",
      text: "Option 2",
      hint: { text: "Option 2 hint" }
    }
  ]
}) }}
```

#### Checkboxes
```html
{{ govukCheckboxes({
  name: "checkboxGroup",
  fieldset: {
    legend: {
      text: "Select options",
      isPageHeading: true,
      classes: "govuk-fieldset__legend--l"
    }
  },
  items: [
    {
      value: "option1",
      text: "Option 1"
    },
    {
      value: "option2",
      text: "Option 2"
    }
  ]
}) }}
```

---

## 5. JavaScript Components

### 5.1 Form Preview Component
Located in `/app/assets/javascripts/components/form-editor/form-preview.js`

```javascript
class FormPreview {
  constructor() {
    this.currentPageIndex = 0;
    this.formPages = [];
    this.initializePreview();
  }

  renderCurrentPage() {
    // Render current page in preview
  }

  renderQuestion(question) {
    // Render individual question based on type
    switch (question.type) {
      case "text":
        return this.renderTextInput(question);
      case "list":
        return this.renderListInput(question);
      // ... other types
    }
  }
}
```

### 5.2 Flow Builder Component
Located in `/app/assets/javascripts/flowbuilder/FormFlowBuilder.js`

```javascript
export class FormFlowBuilder {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.setupSVGLayer();
    this.canvasManager = new CanvasManager(this.canvas);
    this.connectionManager = new ConnectionManager(this.svgLayer, []);
    this.nodeManager = new NodeManager(this.canvas, this.canvasManager.zoomLevel, this.connectionManager);
  }
}
```

---

## 6. Styling & Design System

### 6.1 SCSS Structure
```
app/assets/sass/
├── application.scss          # Main stylesheet
├── components/              # Component-specific styles
├── form-editor/            # Form editor specific styles
└── patterns/               # Reusable pattern styles
```

### 6.2 Custom CSS Classes
- `.app-form-container` - Form container styling
- `.app-page-card` - Page card styling
- `.govuk-grid-column-one-half-from-desktop` - Responsive column layout

### 6.3 Color Scheme
- Primary: `#008938` (Defra green)
- Secondary: `#6b1c40` (Defra purple)
- Background: `#f3f2f1` (Light gray)

---

## 7. Services & Business Logic

### 7.1 AI Compliance Checker
Located in `/app/services/ai-compliance-checker.js`

```javascript
class AIComplianceChecker {
  constructor() {
    this.complianceThresholds = {
      minimumScore: 70,
      maximumIssues: 3
    };
  }

  async analyzeForm(formData) {
    // AI analysis logic
  }

  generateRecommendations(issues) {
    // Generate actionable recommendations
  }
}
```

---

## 8. Data Validation Patterns

### 8.1 Client-Side Validation
```javascript
// Form validation example
function validateForm(formData) {
  const errors = [];

  if (!formData.questionLabel || formData.questionLabel.trim() === '') {
    errors.push({
      field: 'questionLabel',
      message: 'Question label is required'
    });
  }

  return errors;
}
```

### 8.2 Server-Side Validation
```javascript
// Route validation example
router.post("/titan-mvp-1.2/form-editor/question-type/:type/configuration", (req, res) => {
  const errors = [];

  if (!req.body.questionLabel || req.body.questionLabel.trim() === '') {
    errors.push({
      field: 'questionLabel',
      message: 'Question label is required'
    });
  }

  if (errors.length > 0) {
    return res.render("titan-mvp-1.2/form-editor/question-type/" + req.params.type + "/edit-nf", {
      errors: errors,
      form: req.session.data.formDetails
    });
  }

  // Process valid form data
});
```

---

## 9. File Upload Handling

### 9.1 File Upload Configuration
```javascript
{
  type: "file",
  subType: "fileupload",
  fileTypes: ["documents", "images", "tabular"],
  fileOptions: {
    documents: ["pdf", "doc", "docx", "txt"],
    images: ["jpg", "jpeg", "png", "gif"],
    tabular: ["csv", "xlsx", "xls"]
  },
  validation: {
    required: true,
    maxFileSize: 10000000, // 10MB
    maxFiles: 5
  }
}
```

### 9.2 File Upload Template Pattern
```html
{{ govukFileUpload({
  id: "file-upload",
  name: "fileUpload",
  label: {
    text: "Upload a file",
    classes: "govuk-label--m"
  },
  hint: {
    text: "File must be PDF, DOC, or DOCX and smaller than 10MB"
  }
}) }}
```

---

## 10. Testing Patterns

### 10.1 Template Testing
- Use consistent data structures in templates
- Test with various question types
- Validate error states and edge cases

### 10.2 JavaScript Testing
- Test form preview functionality
- Validate condition logic
- Test file upload handling

### 10.3 Integration Testing
- Test complete user journeys
- Validate data persistence
- Test form submission flows

---

## 11. Performance Considerations

### 11.1 Session Management
- Minimize session data size
- Implement session cleanup
- Handle session timeouts gracefully

### 11.2 File Handling
- Implement file size limits
- Use efficient file upload patterns
- Clean up temporary files

### 11.3 JavaScript Performance
- Lazy load components when possible
- Minimize DOM manipulation
- Use efficient event handling

---

## 12. Security Considerations

### 12.1 Input Validation
- Sanitize all user inputs
- Validate file uploads
- Prevent XSS attacks

### 12.2 Session Security
- Secure session configuration
- Implement CSRF protection
- Validate session data

### 12.3 File Upload Security
- Validate file types
- Scan for malware
- Implement file size limits

---

This architecture reference should be used alongside the Feature Requirements Template to ensure consistency and proper implementation of new features in the Defra Forms Builder.
