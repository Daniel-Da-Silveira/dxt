# Guidance Pages in Check Answers Sections

## Problem

The current check answers sections design only showed question-based pages. Guidance pages existed in the system but weren't included in the check answers items, breaking the user experience when trying to organize guidance pages into sections.

## Solution

Extended the existing design to support guidance pages with minimal changes:

### 1. Data Structure Extension

- Added support for `type: 'guidance'` items in the `checkAnswersItems` array
- Guidance items include a `guidanceText` property for the content
- Example structure:

```javascript
{
  id: 10,
  type: 'guidance',
  key: 'Important information',
  value: 'Guidance page',
  section: null,
  guidanceText: 'Please ensure all information provided is accurate...'
}
```

### 2. Visual Indicators

- Guidance pages are visually distinguished with:
  - Gray border-left color (`#b1b4b6`) instead of green
  - Information icon (ℹ) prefix on the title
  - "Guidance page" label in the description

### 3. Preview Rendering

- Guidance pages are **excluded from the check answers preview** since they are informational content, not questions that users need to review
- Guidance pages only appear in the sections organization interface where they can be grouped and managed
- This ensures the check answers page remains focused on actual form responses

### 4. UI Text Updates

- Updated section hints to mention "Pages and guidance"
- Changed "Ungrouped pages" to "Ungrouped pages and guidance"
- Maintains existing drag-and-drop functionality

## Benefits

1. **Minimal Changes**: Extends existing functionality without breaking current design
2. **Consistent UX**: Guidance pages follow the same interaction patterns as question pages
3. **Visual Clarity**: Clear distinction between question pages and guidance pages
4. **Backward Compatible**: Existing question pages continue to work unchanged

## Implementation Details

- Added `isGuidancePage` check in `renderItem()` function
- Added CSS styling for guidance page visual indicators
- Updated default data to include multiple guidance page examples
- **Excluded guidance pages from check answers preview** (they only appear in the organization interface)

## Usage

Users can now:

1. Add guidance pages to sections just like question pages
2. Drag and drop guidance pages within sections
3. Organize guidance pages alongside question pages in logical groups
4. Guidance pages are excluded from the check answers preview (as they're informational, not questions to review)

## Testing the Changes

To see the guidance page in action:

1. **Clear existing session data** (if any):
   - Visit `/titan-mvp-1.2/clear-session` to reset the session
2. **Navigate to the sections page**:
   - Go to `/titan-mvp-1.2/form-editor/check-answers/settings-modular?tab=sections`
3. **Look for the guidance page**:
   - In the "Ungrouped pages and guidance" section, you should see:
     - "ℹ Important information" with a gray border
     - "Guidance page" label underneath
     - A dropdown to add it to a section
4. **Add it to a section**:
   - Select a section from the dropdown and click "Add"
   - The guidance page will appear in the section with the same visual styling
5. **Check the preview**:
   - The right panel will show only question pages in the check answers preview
   - Guidance pages are excluded from the preview as they're informational content
