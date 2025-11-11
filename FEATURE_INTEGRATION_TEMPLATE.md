# Feature Integration Requirements Template
## Defra Forms Builder - New Feature UI Integration Guide

### Document Information
- **Feature Name**: [Feature Name]
- **Version**: 1.0
- **Date**: [Date]
- **Author**: [Designer Name]
- **Status**: Draft/Review/Approved

---

## 1. Feature Overview

### 1.1 What is this feature?
Brief description of the new feature and its purpose.

### 1.2 Where does it fit in the user journey?
- Which user persona(s) will use this?
- When in the form creation/editing process is it accessed?
- What problem does it solve?

---

## 2. UI Integration Points

### 2.1 Entry Points - Where is it accessed from?

#### Forms Library (`/titan-mvp-1.2/library.html`)
- [ ] New button/link in the forms library?
- [ ] New filter option?
- [ ] New action in the form actions menu?
- [ ] New status indicator?

**If yes, specify:**
- Button text and placement
- Icon requirements
- Link destination

#### Form Overview (`/titan-mvp-1.2/form-overview/`)
- [ ] New section on the overview page?
- [ ] New tab in the overview navigation?
- [ ] New action button?
- [ ] New status indicator?

**If yes, specify:**
- Section title and content
- Tab name and icon
- Button placement and styling

#### Form Editor (`/titan-mvp-1.2/form-editor/listing`)
- [ ] New button in the form editor toolbar?
- [ ] New option in the page actions menu?
- [ ] New section in the page listing?
- [ ] New filter option?

**If yes, specify:**
- Button placement and styling
- Menu option text
- Section layout and content

### 2.2 Question Type Integration

#### Information Type Selection (`/titan-mvp-1.2/form-editor/information-type-nf.html`)
- [ ] New radio option in the main question type list?
- [ ] New sub-type under an existing question type?
- [ ] New conditional content that appears?

**If new question type, specify:**
```html
{
  value: "new-type",
  text: "New Question Type",
  hint: {
    text: "Description of what this question type does"
  }
}
```

**If new sub-type, specify:**
- Which parent type it belongs to
- Sub-type options and descriptions
- Conditional HTML content

#### Question Type Configuration (`/titan-mvp-1.2/form-editor/question-type/[type]/edit-nf.html`)
- [ ] New template file needed?
- [ ] Modifications to existing template?

**Template structure required:**
- Form fields and controls needed
- Validation rules
- Preview integration
- Error handling

---

## 3. Form Editor Integration

### 3.1 Page Listing (`/titan-mvp-1.2/form-editor/listing.html`)

#### Page Card Display
- [ ] New visual indicator on page cards?
- [ ] New information in the page summary?
- [ ] New actions in the page actions menu?

**Specify:**
- Visual styling (colors, icons, badges)
- Text content and placement
- Action button text and behavior

#### Filtering and Organization
- [ ] New filter option in the page filters?
- [ ] New sort option?
- [ ] New grouping method?

**Specify:**
- Filter label and options
- Sort criteria
- Grouping logic

### 3.2 Page Overview (`/titan-mvp-1.2/form-editor/page-overview.html`)
- [ ] New section in the page overview?
- [ ] New configuration options?
- [ ] New preview elements?

**Specify:**
- Section title and content
- Configuration form fields
- Preview display requirements

---

## 4. Preview and Runner Integration

### 4.1 Form Preview (`/app/assets/javascripts/components/form-editor/form-preview.js`)

#### Preview Rendering
- [ ] New case in the `renderQuestion()` switch statement?
- [ ] New preview template needed?
- [ ] New validation logic?

**Required code structure:**
```javascript
case "new-type":
  html = this.renderNewType(question, questionId, labelSize);
  break;
```

#### Preview Styling
- [ ] New CSS classes needed?
- [ ] New responsive behavior?
- [ ] New accessibility features?

### 4.2 Runner Templates (`/app/views/titan-mvp-1.2/runner/`)

#### Question Display
- [ ] New runner template needed?
- [ ] Modifications to existing templates?

**Template requirements:**
- HTML structure
- Form controls
- Validation display
- Error handling

#### Check Answers Integration
- [ ] New display format in check answers?
- [ ] New summary text?
- [ ] New edit functionality?

---

## 5. Data Structure Changes

### 5.1 Session Data Updates
- [ ] New fields in `req.session.data`?
- [ ] New question type properties?
- [ ] New page properties?

**Specify new data structure:**
```javascript
// New session data fields
req.session.data.newFeatureData = {
  // Define structure
};

// New question properties
{
  type: "new-type",
  newProperty: "value",
  // Other properties
}
```

### 5.2 Route Handlers
- [ ] New GET routes needed?
- [ ] New POST routes needed?
- [ ] Modifications to existing routes?

**Route specifications:**
```
GET /titan-mvp-1.2/[area]/[action]
POST /titan-mvp-1.2/[area]/[action]
```

---

## 6. Conditional Logic Integration

### 6.1 Condition Creation (`/titan-mvp-1.2/form-editor/conditions/`)
- [ ] New condition operators needed?
- [ ] New value types for conditions?
- [ ] New condition display logic?

**Specify:**
- Available operators (is, is-not, contains, etc.)
- Value input types (text, select, date, etc.)
- Condition display format

### 6.2 Condition Application
- [ ] New page-level conditions?
- [ ] New question-level conditions?
- [ ] New condition combinations?

---

## 7. Form Management Integration

### 7.1 Form Settings
- [ ] New form-level settings?
- [ ] New configuration options?
- [ ] New metadata fields?

### 7.2 Form Publishing
- [ ] New validation rules for publishing?
- [ ] New status indicators?
- [ ] New publishing workflow steps?

### 7.3 Form Submissions
- [ ] New submission data fields?
- [ ] New export formats?
- [ ] New submission display options?

---

## 8. AI Features Integration

### 8.1 AI Form Creation
- [ ] New prompts for AI form creation?
- [ ] New validation in AI-generated forms?
- [ ] New AI analysis criteria?

### 8.2 Compliance Checking
- [ ] New compliance rules?
- [ ] New analysis criteria?
- [ ] New recommendations?

---

## 9. Accessibility Requirements

### 9.1 Screen Reader Support
- [ ] New ARIA labels needed?
- [ ] New role attributes?
- [ ] New live regions?

### 9.2 Keyboard Navigation
- [ ] New tab order requirements?
- [ ] New keyboard shortcuts?
- [ ] New focus management?

### 9.3 Visual Accessibility
- [ ] New color contrast requirements?
- [ ] New text size considerations?
- [ ] New visual indicators?

---

## 10. Mobile and Responsive Design

### 10.1 Mobile Layout
- [ ] New mobile-specific layouts?
- [ ] New touch interactions?
- [ ] New responsive breakpoints?

### 10.2 Tablet Layout
- [ ] New tablet-specific behaviors?
- [ ] New layout adjustments?
- [ ] New interaction patterns?

---

## 11. Error Handling and Validation

### 11.1 Client-Side Validation
- [ ] New validation rules?
- [ ] New error messages?
- [ ] New validation timing?

### 11.2 Server-Side Validation
- [ ] New server validation?
- [ ] New error responses?
- [ ] New error display?

### 11.3 Error Recovery
- [ ] New error recovery options?
- [ ] New user guidance?
- [ ] New fallback behaviors?

---

## 12. Performance Considerations

### 12.1 Loading Performance
- [ ] New loading states needed?
- [ ] New lazy loading requirements?
- [ ] New caching strategies?

### 12.2 Interaction Performance
- [ ] New debouncing requirements?
- [ ] New throttling needs?
- [ ] New animation considerations?

---

## 13. Testing Requirements

### 13.1 User Testing
- [ ] New user scenarios to test?
- [ ] New edge cases to cover?
- [ ] New accessibility testing?

### 13.2 Technical Testing
- [ ] New unit tests needed?
- [ ] New integration tests?
- [ ] New performance tests?

---

## 14. Implementation Checklist

### 14.1 Template Files
- [ ] `/app/views/titan-mvp-1.2/form-editor/question-type/[type]/edit-nf.html`
- [ ] `/app/views/titan-mvp-1.2/runner/[type]-question.html`
- [ ] `/app/views/titan-mvp-1.2/form-editor/[feature]/[action].html`
- [ ] Other template files needed

### 14.2 Route Files
- [ ] GET routes in `/app/routes/titan-mvp-1.2/routes.js`
- [ ] POST routes in `/app/routes/titan-mvp-1.2/routes.js`
- [ ] Route validation and error handling

### 14.3 JavaScript Files
- [ ] Updates to `/app/assets/javascripts/components/form-editor/form-preview.js`
- [ ] New component files
- [ ] New utility functions

### 14.4 CSS/SCSS Files
- [ ] New styles in `/app/assets/sass/`
- [ ] New component styles
- [ ] New responsive styles

### 14.5 Data Files
- [ ] Updates to session data defaults
- [ ] New configuration files
- [ ] New content files

---

## 15. Design Assets Required

### 15.1 Wireframes
- [ ] Entry point wireframes
- [ ] Main feature wireframes
- [ ] Mobile wireframes
- [ ] Error state wireframes

### 15.2 Mockups
- [ ] Desktop mockups
- [ ] Mobile mockups
- [ ] Different states (loading, error, success)
- [ ] Accessibility considerations

### 15.3 Prototypes
- [ ] Interactive prototype
- [ ] User flow prototype
- [ ] Animation specifications

---

## 16. Content Requirements

### 16.1 Copy and Text
- [ ] Button labels and CTAs
- [ ] Help text and hints
- [ ] Error messages
- [ ] Success messages
- [ ] Accessibility labels

### 16.2 Documentation
- [ ] User guidance text
- [ ] Help documentation
- [ ] Tooltip content
- [ ] Onboarding content

---

## 17. Sign-off Checklist

### 17.1 Design Review
- [ ] Wireframes approved
- [ ] Mockups approved
- [ ] Prototype tested
- [ ] Accessibility reviewed

### 17.2 Technical Review
- [ ] Architecture approved
- [ ] Performance requirements met
- [ ] Security considerations addressed
- [ ] Integration points validated

### 17.3 Content Review
- [ ] Copy approved
- [ ] Accessibility labels reviewed
- [ ] Help content approved
- [ ] Error messages reviewed

---

*This template focuses on the practical implementation details and UI integration points. Use this alongside the main Feature Requirements Template for comprehensive feature specification.*
