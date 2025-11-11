# Simplified Form Overview - Proof of Concept

## Overview

This is a proof of concept for a simplified form overview page that reduces the amount of content on the overview page itself by moving detailed editing sections to their respective locations in the form editor.

## Key Changes

### 1. Simplified Overview Page (`index.html`)

The simplified overview page focuses on essential information only:

- **Form status and metadata** (draft/live status, creation/update dates, preview links)
- **Essential form configuration summary** (submitted forms email, contact details, what happens next)
- **Organisation details** (form name, lead organisation, team, shared email)
- **Manage form actions** (edit draft, make live, delete draft)
- **History timeline**

### 2. Moved Editing Sections to Form Editor

The following sections have been moved from the overview page to the form editor (`listing-v2.html`):

#### Support Settings (`#support-settings`)

- Contact details for support (phone, email, address)
- Preview functionality for contact information
- Edit link points to dedicated support settings page

#### What Happens Next (`#what-happens-next`)

- Next steps configuration
- Notification email settings
- Preview functionality for what happens next content
- Edit link points to dedicated what happens next settings page

#### Notification Email (`#notification-email`)

- Where submitted forms are sent
- Email format configuration
- Preview functionality for notification settings
- Edit link points to dedicated notification email page

## Benefits

1. **Reduced cognitive load** - Overview page shows only essential information
2. **Better workflow** - Detailed editing happens in the form editor where it naturally belongs
3. **Improved navigation** - Users can access configuration settings while editing the form
4. **Consistent editing experience** - All form configuration happens in one place

## Navigation Flow

### Overview Page → Form Editor

- "Edit draft" button takes users to the form editor
- Configuration sections are available at the bottom of the form editor
- Users can edit form content and configuration in the same session

### Form Editor → Configuration Sections

- Support settings: `#support-settings`
- What happens next: `#what-happens-next`
- Notification email: `#notification-email`

## Implementation Notes

- All configuration sections include preview functionality
- Edit links point to existing dedicated settings pages
- Preview containers follow the same design pattern as form page previews
- Anchor links allow direct navigation to specific sections

## Future Considerations

- Consider inline editing within the form editor for simpler configurations
- Add breadcrumb navigation between overview and editor
- Implement real-time preview updates for configuration changes
- Add validation and save functionality for configuration changes
