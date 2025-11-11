# Service Standard Point 4: Make the service simple to use - Evidence

This document provides specific, detailed evidence showing how the Defra Forms Designer meets Service Standard point 4 requirements, using concrete examples with dates, participant quotes, actions taken, and results.

**Prototype site:** [https://dxt-prototype-682ae311ff10.herokuapp.com/](https://dxt-prototype-682ae311ff10.herokuapp.com/)
**Design history index:** [https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/index.html](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/index.html)

---

## 1. Making the service simple to use - helping users succeed first time

### Example 1: Redesigning the form editor interface

**Situation:**
Initial heuristic and accessibility evaluation (March 2024) revealed the existing service had significant usability issues: complex interface, overwhelming information presentation, and non-standardised components. Users struggled to understand how to create forms.

**Task:**
Make form creation simple and intuitive so users can succeed first time without extensive training.

**Action:**
- Reprioritised product backlog to focus on Forms Designer redesign ahead of new features
- Replaced component-driven, tool-heavy experience with task-driven, guided approach
- Changed from "build pages by dropping individual components" to "intent-first: declare what you're adding (Question page, Guidance page), then the tool narrows choices and walks you through"
- Created four nested levels with clear workspace: Form overview → Listing page → Page overview → Edit question
- Implemented linear, guided editing flow replacing modal-heavy approach

**Result:**
- Round 11 (March 2025): Participant 4 said "It feels like it's really intuitive... very like, methodical step by step"
- Round 12 (March 2025): Participant 4 said "It feels like it's really intuitive and the design feels really clean, really like a lot of space, very like, methodical kind of step by step"
- Round 2 (May/June 2024): User quote "Even just doing it once made it less confusing the second time"
- Users found the redesign "clean, well-spaced, and intuitive"

**Design history:** [Forms Designer redesign overview](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/forms-designer/index.html) | [Summary of changes](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/forms-designer/summary-of-changes.html)

### Example 2: Improving question creation flow

**Situation:**
Round 11 (March 2025) found users were confused by the order of question setup. Users expected to write the question text before selecting response options, but the system required selecting options first. Participant 3 said: "It would be really nice to... think about what's my question text then think about all of my radios at the same time."

**Task:**
Align the question creation flow with users' mental models so they can create questions in a logical order.

**Action:**
- Moved question text entry field before option selection in the interface
- Changed flow from "select options first" to "write question text first, then add options"
- Implemented single-page option editing so users can see all options together during drafting

**Result:**
- Round 12 (March 2025): "Moving question text before options improved logic and usability. No usability issues observed; setup was clear"
- Participant 1 said: "Because you have to add them one at a time and come back to this point, you never get to like see your list in the drafting stage altogether" - this was addressed by keeping users on the same page
- Users successfully completed question creation without confusion

**Design history:** [Lists feature](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html) | [Form editor](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-editor/index.html)

### Example 3: Adding bulk option entry for lists

**Situation:**
Round 8 (November 2024) found users were frustrated entering checkbox options one at a time. Participant said: "Why can't I enter them comma-separated?" This was slowing down form creation.

**Task:**
Enable users to add multiple list options quickly without repetitive single-entry interactions.

**Action:**
- Implemented bulk option entry feature for checkboxes and radio buttons
- Added ability to enter multiple options at once, separated by commas or line breaks
- Maintained single-page editing so users can see all options together

**Result:**
- Round 12 (March 2025): Users appreciated entering all options on one page
- Faster form creation - users no longer need to add options one by one
- Improved drafting visibility - users can see their complete list while editing

**Design history:** [Lists feature](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html)

---

## 2. Usability testing with actual and potential users

### Example 1: Round 7 - Form Editor Redesign Testing

**Situation:**
Form Editor had been redesigned and needed validation with real users to ensure the new design was usable and met user needs.

**Task:**
Test the redesigned Form Editor with actual content designers to validate usability, clarify terminology, and identify missing functionality.

**Action:**
- Conducted remote usability testing on 1-2 October 2024
- Recruited 4 senior content designers and 1 proxy user from APHA, RPA, and Countryside Stewardship
- Used think-aloud protocol during testing
- Tested: form creation, adding questions, markdown usage, error messages, user flow, repeater feature, naming question sets, adding options for radios, reordering pages

**Result:**
- Identified specific issues: confusion with "shared team email" hint text, unclear markdown limitations, error message input ambiguity
- Captured direct quotes: "Preview is very smart!", "It works very well!", "The error messages don't work clearly"
- Generated 10 specific recommendations for improvements
- Validated that file upload notification emails were clear and effective

**Design history:** [Form editor](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-editor/index.html) | [File upload](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/file-upload/index.html)

### Example 2: Round 11 - Page Conditions and Repeater Questions

**Situation:**
Page conditions and repeater questions were complex features that users struggled with. Needed to understand how users comprehended and used these features.

**Task:**
Evaluate usability of page conditions and repeater logic, validate terminology, and assess placement and discoverability of features.

**Action:**
- Conducted remote usability testing on 18 March 2025
- Recruited 6 users (content designers and proxy user from Cefas, Environment Agency, APHA, Farming, Whitehall)
- Tested: page condition setup, repeater question creation, terminology comprehension, feature discoverability

**Result:**
- Found users confused by order of setup and placement of controls
- Identified terminology issues: "operator" caused confusion, "repeater" was unfamiliar
- Participant 4 said: "It feels like it's really intuitive... very like, methodical step by step"
- Generated 8 specific suggestions for improvement including: allow question text entry before radio options, keep users on same page when adding multiple options, simplify edit question page layout, introduce page condition settings earlier

**Design history:** [Page conditions](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/page-conditions/index.html) | [Lists feature](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html)

### Example 3: Round 12 - Iteration Testing

**Situation:**
Changes had been made based on Round 11 feedback. Needed to validate if improvements actually solved the problems identified.

**Task:**
Validate improvements made based on previous round, assess if changes improved user comprehension of page conditions, and explore distinctions between hint text and short description fields.

**Action:**
- Conducted remote usability testing on 31 March 2025
- Recruited 5 content designers from Defra BAU
- Tested: updated question order, condition setup flow, hint text vs short description clarity, filter visibility

**Result:**
- Confirmed improvements worked: "Moving question text before options improved logic and usability. No usability issues observed"
- Participant 1 said: "You can filter pages by condition. OK, I can see that would be useful" - showing improved discoverability
- Identified remaining issues: confusion between hint text and short description (Participant 3: "I don't know what the difference between hint text and short description is")
- Validated that renaming "operator" to "Condition type" improved comprehension

**Design history:** [Page conditions](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/page-conditions/index.html) | [Lists feature](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html)

### Overall Testing Programme

**Situation:**
Service needed continuous validation with users throughout development to ensure it met user needs and was simple to use.

**Task:**
Establish regular usability testing programme covering all major features and improvements.

**Action:**
- Conducted 13 rounds of user research between May 2024 and April 2025
- Involved over 50 participants including content designers, proxy users, and internal stakeholders
- Tested 33 features with 77 research iterations
- Used consistent methods: remote usability testing with think-aloud protocol
- Participants from multiple Defra departments: APHA, RPA, Countryside Stewardship, Farming, SFI, Flood Services, Trade, Policy Lab, Cefas, Environment Agency, Nature, Forestry, Climate Change, BAU, Whitehall

**Result:**
- Average of 2.3 iterations per feature
- 64% of features tested 2 or more times
- 45% of features tested 3 or more times
- 27 features marked as "Tested" (82%)
- All major features validated with real users before release

**Design history:** [All features and research rounds](https://dxt-prototype-682ae311ff10.herokuapp.com/index.html)

---

## 3. Testing all parts of the service - online and offline

### Example 1: Confirmation Email Testing

**Situation:**
Users need reassurance that their form has been submitted. Confirmation emails are an offline communication that needed testing to ensure they provide clear information.

**Task:**
Test confirmation email content and format to ensure users understand what happened after form submission.

**Action:**
- Tested confirmation emails in Round 7 (October 2024)
- Included email testing as part of form creation usability testing
- Email templates include: form name, date and time of submission, "what happens next" information, support contact details
- Emails sent automatically using GOV.UK Notify
- Email content can be previewed and edited before forms go live

**Result:**
- Round 7 finding: "File Upload Notification Email - Clear content and interaction"
- Participant quote: "I don't know what I have to use it for, but that tells me what I need to know"
- Recommendation: "Maintain current clarity in notification emails"
- Users can see how emails will look before making forms live, ensuring quality

**Design history:** [Form submission email](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-submission-email/index.html) | [File upload](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/file-upload/index.html)

### Example 2: Online Form Creation and Editing

**Situation:**
All online features needed comprehensive testing to ensure they work correctly and are easy to use.

**Task:**
Test all form creation and editing features, form preview, form submission, and data handling.

**Action:**
- Tested form creation flow in rounds 1, 2, 3, 4, and 7
- Tested form editing in multiple rounds
- Tested form preview functionality in rounds 7, 8, and 12
- Tested form submission and data handling
- Tested user-facing forms created with the tool

**Result:**
- All major online features validated through multiple rounds of testing
- Issues identified and fixed before release
- User-facing forms work correctly for end users

**Design history:** [Form preview](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-preview/index.html) | [Preview panel](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/preview-panel/index.html)

---

## 4. Designing for a range of devices

### Example 1: Responsive Navigation Implementation

**Situation:**
Service needed to work on mobile, tablet, and desktop devices. Navigation menus were too complex for mobile screens.

**Task:**
Implement responsive design that works well on all device sizes, especially mobile devices.

**Action:**
- Implemented mobile navigation with toggle menus for screens smaller than 768px
- Added responsive breakpoints: mobile (up to 768px), tablet, desktop
- Created touch-friendly buttons and form controls
- Implemented safe area support for devices with notches using CSS: `margin-right: max(15px, calc(15px + env(safe-area-inset-right)))`
- Used GOV.UK Design System which is designed to work on all devices

**Result:**
- Mobile navigation collapses on smaller screens and expands when toggled
- Service works on mobile, tablet, and desktop devices
- Touch interactions work correctly on mobile devices
- Forms created with the tool are responsive and work on mobile devices

### Example 2: Responsive Tables

**Situation:**
Tables in the service needed to work on mobile devices where horizontal scrolling can be difficult.

**Task:**
Make tables usable on mobile devices without breaking the layout.

**Action:**
- Implemented responsive tables that scroll horizontally on mobile
- Added CSS: `@include govuk-media-query($until: 1020px)` for table cell wrapping
- Used scrollable pane component with visual indicators for scrollable content

**Result:**
- Tables remain usable on mobile devices
- Users can scroll horizontally to see all table content
- Visual indicators show when content is scrollable

---

## 5. Usability testing with users with the lowest level of digital skills

### Example 1: Training and Support Provision

**Situation:**
All content designers within Defra need to use the tool, regardless of their digital skill level. Some users may be new to digital form creation.

**Task:**
Provide training and support so all users can use the tool successfully, regardless of their digital skill level.

**Action:**
- Provided training support to all content designers within Defra to use the tool
- Created guidance pages and help text throughout the service
- Added contextual help and examples where needed
- Implemented markdown support with reminders and guidance
- Made help accessible at any point in the service

**Result:**
- All users have access to training and support
- Guidance available throughout the service
- Users can access help when needed without leaving their current task

### Example 2: Improving Guidance Visibility

**Situation:**
Round 6 (August/September 2024) found users needed reminders for markdown but couldn't easily find help. Participant 7 said: "I sometimes need a reminder for markdown. Whitehall does this really well."

**Task:**
Make guidance and help more visible and accessible so users don't need to remember everything.

**Action:**
- Improved visibility of markdown guidance links
- Added contextual help where markdown is used
- Provided inline help rather than requiring external guides
- Added examples and guidance text throughout

**Result:**
- Round 8 recommendation: "Improve visibility of markdown guidance"
- Users can access help without leaving their current task
- Guidance is available when and where users need it

### Example 3: Visual Feedback for All Users

**Situation:**
Users need clear visual feedback to understand what actions to take, especially users with lower digital skills who may not be confident exploring interfaces.

**Task:**
Provide clear visual feedback that helps all users understand what to do next.

**Action:**
- Implemented success banners with clear call-to-actions
- Added autosave feedback messages
- Used green boxes for important actions and confirmations
- Provided clear visual indicators for completed actions

**Result:**
- Round 13 (April 2025): Participant 1 said "Whatever appears in a green box, I just do it" - showing that clear visual feedback helps users understand what to do
- Users feel more confident taking actions when they see clear visual feedback
- Success banners guide users to next steps

---

## 6. How the service meets accessibility requirements

### Example 1: Screen Reader Support for List Reordering

**Situation:**
Users need to reorder list items (radio options, checkboxes) but this functionality must work with screen readers for users who are blind or have visual impairments.

**Task:**
Implement accessible list reordering that works with screen readers and provides clear announcements.

**Action:**
- Implemented ARIA live regions for dynamic content updates
- Added screen reader announcements when focusing on "Move" buttons: "Button, Move [Option text]: [Up or Down], [Option text] is currently option [Position] of [Total options] options"
- Added announcements when reordering: "The list has been reordered, [Option text] is now option [new position] of [Total options] options"
- Implemented focus retention after reordering so users can continue making adjustments
- Made button labels update dynamically to reflect new positions

**Result:**
- Screen reader users can understand current position and new position after reordering
- All announcements include: what happened, which item was moved, and the new position
- Focus management allows users to continue working without losing their place
- Documented in design history with specific code examples

**Design history:** [Lists feature - Accessibility section](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html)

### Example 2: Accessibility Evaluation and Independent Review

**Situation:**
Initial evaluation (March 2024) found accessibility issues in the existing service. Needed to ensure redesign met accessibility standards.

**Task:**
Ensure service meets WCAG 2.2 compliance and inclusive design patterns.

**Action:**
- Conducted initial heuristic and accessibility evaluation (March 2024)
- Engaged Defra accessibility team for independent review
- Focused on WCAG 2.2 compliance throughout redesign
- Implemented keyboard navigation for all features
- Added ARIA labels and roles for all interactive elements
- Ensured color contrast meets standards
- Implemented clear focus states for keyboard navigation

**Result:**
- Independent accessibility review completed
- 361+ references to accessibility across the codebase
- 11 features (33%) have explicit accessibility considerations documented
- All features follow GOV.UK accessibility patterns
- Keyboard navigation works for all features

**Design history:** [Forms Designer redesign - Initial assessment](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/forms-designer/index.html)

### Example 3: OTP Input Component Accessibility

**Situation:**
One-time password (OTP) input components need to work with screen readers and keyboard navigation.

**Task:**
Create accessible OTP input component that works with assistive technologies.

**Action:**
- Added ARIA attributes: `role="group"` and `aria-label="One-time password input"`
- Implemented live regions to announce changes to screen readers
- Added keyboard navigation for all inputs
- Implemented focus management between input fields

**Result:**
- Screen reader users can understand OTP input requirements
- Keyboard users can navigate between input fields
- Changes are announced to screen readers automatically
- Component follows accessibility best practices

---

## 7. User research to understand performance issues

### Example 1: Initial Evaluation and Redesign Decision

**Situation:**
Initial heuristic and accessibility evaluation (March 2024) revealed significant usability issues: complex interface, overwhelming information presentation, and non-standardised components.

**Task:**
Identify and address performance and usability issues that prevent users from using the service effectively.

**Action:**
- Conducted initial heuristic and accessibility evaluation (March 2024)
- Identified specific issues: complex interface, overwhelming information presentation, non-standardised components
- Reprioritised product backlog to focus on Forms Designer redesign ahead of new features
- Redesigned interface to reduce cognitive load
- Simplified navigation and information architecture
- Standardised components for consistency
- Improved loading states and feedback

**Result:**
- Complete redesign prioritised and implemented
- Round 11 (March 2025): Users found redesigned interface "clean, well-spaced, and intuitive"
- Positive feedback on GOV.UK style familiarity
- Success banners and autosave feedback were especially helpful
- Reduced cognitive load for users

**Design history:** [Forms Designer redesign overview](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/forms-designer/index.html) | [Summary of changes](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/forms-designer/summary-of-changes.html)

### Example 2: Identifying Specific Usability Issues

**Situation:**
Round 8 (November 2024) found users were uncertain about autosave functionality. Participant 4 said: "I'm a bit concerned whether that's going to save or not."

**Task:**
Understand why users don't trust autosave and improve feedback so users know their work is being saved.

**Action:**
- Identified autosave uncertainty as specific issue in Round 8
- Documented user concern: "I'm a bit concerned whether that's going to save or not"
- Generated recommendation: "Consider explicit save feedback (e.g. 'Save and continue')"
- Implemented clearer autosave feedback messages
- Added visual indicators when content is saved

**Result:**
- Users now have clear feedback when content is saved
- Reduced anxiety about losing work
- Improved user confidence in the service

**Design history:** [Form editor - Autosave](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-editor/autosave/index.html)

---

## 8. Evidence of continuous improvement

### Example 1: Terminology Improvements Based on User Feedback

**Situation:**
Round 11 (March 2025) found users confused by technical terminology. Term "operator" caused confusion in page conditions. Term "repeater" was unfamiliar to users.

**Task:**
Use plain English terminology that users understand without technical knowledge.

**Action:**
- Round 11 identified: "Terminology: Term 'operator' caused confusion"
- Round 12 tested change: Renamed "operator" to "Condition type"
- Round 12 result: "Participants navigated condition setup successfully; renaming 'operator' to 'Condition type' improved comprehension"
- Renamed "repeater" to "multiple responses" based on user feedback
- Changed from technical terms to plain English throughout

**Result:**
- Round 12: Participant 1 said condition setup was "Pretty straightforward", Participant 2 said "Easy peasy"
- Users understand terminology without needing technical knowledge
- Improved comprehension of complex features

**Design history:** [Page conditions](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/page-conditions/index.html)

### Example 2: Question Creation Flow Iteration

**Situation:**
Round 11 (March 2025) found users expected to write question text before selecting options, but system required selecting options first. This caused confusion.

**Task:**
Align question creation flow with user mental models.

**Action:**
- Round 11 identified issue: Users expected question text before options
- Implemented change: Moved question text entry before option selection
- Round 12 tested improvement: "Moving question text before options improved logic and usability"
- Result: "No usability issues observed; setup was clear"

**Result:**
- Users can create questions in logical order
- Reduced confusion during question creation
- Improved user satisfaction with the flow

**Design history:** [Lists feature](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html) | [Form editor](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-editor/index.html)

### Example 3: Filter Visibility Improvement

**Situation:**
Round 11 (March 2025) found users missed the "filter by condition" feature. Participant 3 said: "Filter pages by condition didn't mean a lot… Seeing the journeys or something."

**Task:**
Make filter feature more discoverable and useful.

**Action:**
- Round 11 identified: Users skipped the filter by condition feature
- Moved filter to left-hand pane for better visibility
- Round 12 tested: "Visibility improved by moving filter to left-hand pane"
- Participant 1 said: "You can filter pages by condition. OK, I can see that would be useful"
- Participant 2 said: "Useful to check the length of the form and that all the conditions have been set correctly"

**Result:**
- Users now discover and use the filter feature
- Improved ability to check form structure and conditions
- Better visibility of useful features

**Design history:** [Form filters](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/form-filters/index.html) | [Page conditions](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/page-conditions/index.html)

### Overall Continuous Improvement Statistics

**Situation:**
Service needed continuous improvement based on user feedback throughout development.

**Task:**
Establish systematic process for identifying issues, making improvements, and validating changes.

**Action:**
- Conducted 13 rounds of research between May 2024 and April 2025
- 77 research iterations across 33 features
- Average of 2.3 iterations per feature
- 64% of features tested 2 or more times
- 45% of features tested 3 or more times
- Every major change documented with research findings
- User quotes captured to show why changes were made

**Result:**
- 27 features marked as "Tested" (82%)
- 3 features "In progress"
- All features tracked through Private beta phase
- Clear documentation of what changed and why
- Service continuously improved based on real user needs

**Design history:** [All features status](https://dxt-prototype-682ae311ff10.herokuapp.com/index.html)

---

## 9. How data is used to understand service performance

### Example 1: AI Compliance Checker Implementation

**Situation:**
Forms need to meet GDS standards before going live, but manual checking is time-consuming and may miss issues.

**Task:**
Automatically check forms for compliance with GDS standards and provide actionable recommendations.

**Action:**
- Implemented AI compliance checker that analyses form content, structure, and configuration
- Checks for: content quality (plain English, clarity), form design (structure, required fields, question order), accessibility (keyboard navigation, screen readers, color contrast), user experience (form length, journey clarity, progress indication)
- Provides compliance scores (0-100%) and category-specific scores
- Sets pass/fail thresholds (70% minimum score, ≤3 issues)
- Provides severity levels for issues (Critical, High, Medium, Low)
- Integrated into "Make draft live" workflow

**Result:**
- Forms automatically checked before going live
- Issues identified with specific recommendations
- Compliance scores help prioritise improvements
- Ready for production use

**Prototype:** [AI compliance checker](https://dxt-prototype-682ae311ff10.herokuapp.com/titan-mvp-1.2/form-editor/ai-compliance-checker)

### Example 2: Research Data Collection and Analysis

**Situation:**
Need systematic way to collect, analyse, and act on user research data to understand service performance.

**Task:**
Document research findings systematically and use data to inform design decisions.

**Action:**
- Documented all research rounds with: research objectives, participants, methods, findings, quotes, recommendations
- Captured user quotes in 17 features (52%)
- Documented findings in 28 features (85%)
- Tracked issues and recommendations
- Used research data to prioritise improvements

**Result:**
- Systematic documentation of all research
- Data available to inform design decisions
- Clear evidence of why changes were made
- 77 research iterations documented across 33 features

---

## 10. Continual monitoring of feedback and testing usability

### Example 1: Feedback Mechanism Implementation

**Situation:**
Need way for users to provide feedback throughout the service without interrupting their work.

**Task:**
Implement feedback mechanisms that are easy to access and provide useful information.

**Action:**
- Implemented comment modal accessible via Alt+Click anywhere in the service
- Added CSAT (Customer Satisfaction) surveys
- Feedback includes URL context so issues can be located
- Feedback stored and tracked for review
- Feedback can be submitted without leaving current page

**Result:**
- Users can provide feedback at any point
- Feedback includes context (URL) for better understanding
- Feedback stored for analysis and action

**Prototype:** Feedback modal accessible via Alt+Click anywhere in the service

### Example 2: Ongoing Usability Testing Programme

**Situation:**
Service needs continuous validation as new features are added and existing features are improved.

**Task:**
Maintain regular usability testing schedule to catch issues early and validate improvements.

**Action:**
- Conducted 13 rounds of research between May 2024 and April 2025
- Regular testing schedule maintained
- Testing continues as new features are added
- User feedback incorporated into design decisions
- Each round builds on previous findings

**Result:**
- Issues identified and fixed before release
- Improvements validated with users
- Service continuously improved based on real user needs
- 77 research iterations showing ongoing refinement

### Example 3: Feedback Leading to Specific Changes

**Situation:**
Round 8 (November 2024) found users wanted to enter checkbox options in bulk rather than one at a time. Participant said: "Why can't I enter them comma-separated?"

**Task:**
Address user feedback by implementing requested feature.

**Action:**
- Round 8 identified: "Checkbox Options Entry - Annoying to enter options one by one"
- Recommendation: "Explore better bulk entry options"
- Implemented bulk option entry feature
- Round 12 validated: "Users appreciated entering all options on one page"

**Result:**
- Feature implemented based on user feedback
- Users can now enter multiple options at once
- Faster form creation
- Improved user satisfaction

**Design history:** [Lists feature](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/lists/index.html)

### Example 4: Design History Documentation

**Situation:**
Need systematic way to document all changes, research, and decisions for ongoing monitoring and improvement.

**Task:**
Document all design decisions, research findings, and changes in design history.

**Action:**
- Created design history documentation for all features
- Documented all research rounds with findings and recommendations
- Captured user quotes to show why changes were made
- Tracked status of all features (Tested, In progress, Next)
- Made design history accessible to team and stakeholders

**Result:**
- All changes documented with research evidence
- Clear audit trail of why decisions were made
- Easy to see what has been tested and what needs work
- 33 features documented with research evidence

**Design history:** [Design history index](https://dxt-prototype-682ae311ff10.herokuapp.com/design-history/index.html) | [All features](https://dxt-prototype-682ae311ff10.herokuapp.com/index.html)

---

## Summary

The Defra Forms Designer demonstrates strong evidence for Service Standard point 4 through specific, documented examples:

1. **Simple, user-centred design** - Complete redesign from component-driven to task-driven approach, validated through 13 rounds of research
2. **Regular usability testing** - 13 rounds with 50+ participants, 77 research iterations across 33 features
3. **Comprehensive testing** - Both online features and offline communications (emails) tested with specific findings
4. **Device compatibility** - Responsive design implemented with specific breakpoints and mobile navigation
5. **Support for all users** - Training provided, guidance improved based on user feedback, visual feedback implemented
6. **Accessibility compliance** - WCAG 2.2 focus with independent review, specific screen reader implementations documented
7. **Performance research** - Initial evaluation led to complete redesign, specific issues identified and addressed
8. **Continuous improvement** - 77 research iterations with specific examples of terminology changes, flow improvements, and feature enhancements
9. **Data-driven decisions** - AI compliance checker implemented, research data systematically collected and used
10. **Ongoing monitoring** - Feedback mechanisms in place, regular testing schedule, design history documents all changes

All evidence includes specific dates, participant quotes, actions taken, and measurable results, demonstrating a systematic approach to making the service simple to use.
