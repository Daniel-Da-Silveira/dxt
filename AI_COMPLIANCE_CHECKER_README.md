# AI Compliance Checker - Proof of Concept

## Overview

This proof of concept demonstrates how AI could be used to automatically check forms for compliance with Government Digital Service (GDS) standards before they are made live. The system analyzes form content, structure, and configuration to identify potential issues and provide actionable recommendations.

## Features

### AI-Powered Analysis

- **Content Analysis**: Checks for plain English usage, clarity, and user-centered language
- **Form Design**: Validates form structure, required fields, and logical question order
- **Accessibility**: Reviews data protection compliance, privacy notices, and accessibility features
- **User Experience**: Evaluates form length, user journey clarity, and progress indication

### Compliance Scoring

- Overall compliance score (0-100%)
- Category-specific scores for each analysis area
- Pass/fail thresholds (70% minimum score, ≤3 issues)
- Severity levels for issues (Critical, High, Medium, Low)

### User Interface

- Loading page with animated progress indicators
- Detailed results page with categorized issues
- Actionable recommendations for each issue
- Integration with existing form workflow

## How It Works

### 1. Integration Point

The AI compliance checker is integrated into the "Make draft live" workflow. Users can choose to:

- Run the AI compliance check before making the form live
- Skip the compliance check and proceed directly

### 2. Analysis Process

1. **Loading Phase**: Shows animated progress while AI analyzes the form
2. **Analysis**: AI service checks form data against GDS standards
3. **Results**: Displays compliance score, issues found, and recommendations
4. **Action**: Users can fix issues or proceed if compliance is met

### 3. Compliance Checks

#### Content Quality (25% weight)

- Form name length and clarity
- Technical jargon detection
- Missing essential content (e.g., "What happens next")

#### Form Design (30% weight)

- Required field completeness
- Team email address presence
- Support contact information
- Organisation details

#### Accessibility (25% weight)

- Privacy notice requirements
- Data protection compliance
- Screen reader compatibility

#### User Experience (20% weight)

- Form length optimization
- User journey clarity
- Progress indication

## Files Created/Modified

### New Files

- `app/services/ai-compliance-checker.js` - AI analysis service
- `app/views/titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-loading.html` - Loading page
- `app/views/titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-check.html` - Results page
- `app/views/titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-demo.html` - Demo page

### Modified Files

- `app/views/titan-mvp-1.2/form-overview/manage-form/make-draft-live/index-ai-concept.html` - Added AI check option
- `app/routes/titan-mvp-1.2/routes.js` - Added AI compliance routes

## Usage

### Running the PoC

1. **Start the application**:

   ```bash
   npm run dev
   ```

2. **Navigate to the make-draft-live page**:

   ```
   /titan-mvp-1.2/form-overview/manage-form/make-draft-live/index-ai-concept
   ```

3. **Run the AI compliance check**:

   - Click "Run AI compliance check"
   - Watch the loading animation
   - Review the results and recommendations

4. **View demo results**:
   ```
   /titan-mvp-1.2/form-overview/manage-form/make-draft-live/ai-compliance-demo
   ```

### Demo Scenarios

The PoC includes several demo scenarios:

1. **Form with Issues** (Demo page): Shows a form with multiple compliance issues
2. **Real Analysis**: Uses actual form data from the session
3. **Loading Simulation**: Demonstrates the user experience during analysis

## Technical Implementation

### AI Service Architecture

```javascript
class AIComplianceChecker {
  async analyzeForm(formData) {
    // Simulates AI analysis with realistic checks
    // Returns compliance score, issues, and recommendations
  }
}
```

### Analysis Categories

- **Content**: Language clarity and user-centeredness
- **Form Design**: Structure and required elements
- **Accessibility**: Data protection and accessibility compliance
- **User Experience**: Journey optimization and usability

### Scoring System

- **Pass Threshold**: 70% overall score with ≤3 issues
- **Category Weights**: Form Design (30%), Content (25%), Accessibility (25%), UX (20%)
- **Severity Levels**: Critical, High, Medium, Low

## Future Enhancements

### Real AI Integration

- Connect to actual AI services (OpenAI, Azure, etc.)
- Implement natural language processing for content analysis
- Add machine learning for pattern recognition

### Expanded Checks

- Visual accessibility (color contrast, alt text)
- Performance optimization
- Security compliance
- Legal requirements

### User Experience

- Real-time analysis during form editing
- Batch analysis for multiple forms
- Export compliance reports
- Integration with form validation

### Configuration

- Customizable compliance rules
- Organisation-specific standards
- Configurable thresholds
- White-label support

## Benefits

### For Form Creators

- **Early Detection**: Identify issues before going live
- **Quality Assurance**: Ensure GDS compliance
- **Time Saving**: Automated analysis reduces manual review
- **Learning**: Understand best practices through recommendations

### For Users

- **Better Forms**: Improved user experience and accessibility
- **Consistency**: Standardized form quality across government
- **Trust**: Confidence in form reliability and compliance

### For Government

- **Compliance**: Ensure adherence to GDS standards
- **Efficiency**: Reduce manual compliance checking
- **Quality**: Improve overall digital service quality
- **Innovation**: Demonstrate AI capabilities in government

## Limitations

### Current PoC

- **Simulated Analysis**: Uses predefined rules rather than real AI
- **Limited Scope**: Basic checks only
- **No Learning**: Doesn't improve over time
- **Static Rules**: Fixed compliance criteria

### Technical Constraints

- **Performance**: Real AI would require API integration
- **Cost**: AI services have usage costs
- **Privacy**: Data handling considerations
- **Reliability**: AI accuracy and fallback strategies

## Conclusion

This proof of concept demonstrates the potential for AI-powered compliance checking in government digital services. While currently simulated, it shows how such a system could improve form quality, ensure GDS compliance, and enhance user experience.

The modular architecture allows for easy integration of real AI services and expansion of compliance checks. The user interface provides a clear, actionable workflow that fits naturally into existing form management processes.

## Next Steps

1. **Real AI Integration**: Connect to actual AI services
2. **User Testing**: Validate the user experience and workflow
3. **Performance Testing**: Ensure scalability and reliability
4. **Compliance Validation**: Verify against actual GDS standards
5. **Pilot Deployment**: Test with real forms and users
