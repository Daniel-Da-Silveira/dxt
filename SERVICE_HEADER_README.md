# Service Header Component

This project now uses a custom service header component with styles based on the DEFRA forms-designer repository.

## Files

- **Component**: `app/views/components/service-header/`
  - `macro.njk` - The macro definition
  - `template.njk` - The HTML template
- **Styles**: `app/assets/sass/components/_service-header.scss`
- **JavaScript**: `app/assets/javascripts/application.js` (ServiceHeaderNavigation class)

## Usage

### Basic Usage

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  navigationItems: [
    { href: "/page1", text: "Page 1", id: "nav-page1" },
    { href: "/page2", text: "Page 2", id: "nav-page2" }
  ]
}) }}
```

### With Active Navigation

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  activeLinkId: "nav-page2", // This will highlight the active navigation item
  navigationItems: [
    { href: "/page1", text: "Page 1", id: "nav-page1" },
    { href: "/page2", text: "Page 2", id: "nav-page2" }
  ]
}) }}
```

### With Account Information

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  accountName: "John Doe",
  accountLink: "/account",
  signOutLink: "/sign-out",
  homepageLink: "/",
  navigationItems: [
    { href: "/page1", text: "Page 1", id: "nav-page1" },
    { href: "/page2", text: "Page 2", id: "nav-page2" }
  ]
}) }}
```

### With Custom Container Classes

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  containerClasses: "app-width-container--full-width",
  navigationItems: [
    { href: "/page1", text: "Page 1", id: "nav-page1" },
    { href: "/page2", text: "Page 2", id: "nav-page2" }
  ]
}) }}
```

### With Custom Support Link

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  supportLink: "/custom-support-page"
  // No navigationItems - Support link will be automatically added
}) }}
```

### Hide Support Link

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  showSupportLink: false
  // Support link will be hidden
}) }}
```

### Custom Support Link + Hide Toggle

```njk
{{ serviceHeader({
  organisationName: "Defra",
  productName: "Forms Designer",
  serviceName: "Your Service Name",
  supportLink: "/help",
  showSupportLink: false
  // Custom support URL but link is hidden
}) }}
```

## Parameters

| Parameter                   | Type    | Required | Description                                                                   |
| --------------------------- | ------- | -------- | ----------------------------------------------------------------------------- |
| `organisationName`          | string  | Yes      | The name of the organisation (e.g., "Defra")                                  |
| `productName`               | string  | Yes      | The name of the product (e.g., "Forms Designer")                              |
| `serviceName`               | string  | No       | The name of the specific service                                              |
| `navigationItems`           | array   | No       | Array of navigation objects with `href`, `text`, and `id`                     |
| `activeLinkId`              | string  | No       | The ID of the currently active navigation item                                |
| `accountName`               | string  | No       | The signed-in user's name                                                     |
| `accountLink`               | string  | No       | Link to the user's account page                                               |
| `signOutLink`               | string  | No       | Link to the sign-out page                                                     |
| `homepageLink`              | string  | No       | Link to the homepage                                                          |
| `containerClasses`          | string  | No       | Additional CSS classes for the container                                      |
| `navigationBackgroundColor` | string  | No       | Custom background color for navigation (default: #f8f9fa)                     |
| `navigationInverse`         | boolean | No       | Use inverse styling for navigation (default: false)                           |
| `supportLink`               | string  | No       | Custom URL for support link (default: "/titan-mvp-1.2/product-pages/support") |
| `showSupportLink`           | boolean | No       | Whether to show the support link (default: true)                              |

## Navigation Items Structure

Each navigation item should have:

```javascript
{
  href: "/page-url",        // The URL the link goes to
  text: "Display Text",     // The text shown to users
  id: "unique-id"          // Unique identifier for active state
}
```

## Smart Support Link Behavior

The service header intelligently handles the support link:

- **With navigation items**: Uses your existing navigation (including any support item you define)
- **Without navigation items**: Automatically adds a support link to prevent empty navigation
- **Custom support URL**: Override the default support link with the `supportLink` parameter
- **Toggle support link**: Control whether the support link appears with `showSupportLink: false`

## Features

- **Responsive Design**: Automatically adapts to mobile and desktop
- **Active State**: Highlights the current page in navigation
- **Mobile Navigation**: Collapsible navigation on mobile devices
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **One Login Integration**: Account menu with sign-in/sign-out functionality
- **Custom Styling**: DEFRA-branded colors and typography
- **Smart Support Link**: Support navigation item automatically added when no navigation items are provided
- **Support Link Toggle**: Control whether the support link appears with `showSupportLink` parameter

## Styling

The component uses the following color scheme:

- **Primary**: #008531 (DEFRA Green)
- **Background**: #f8f9fa (Light Gray)
- **Borders**: #d1d5db (Medium Gray)
- **Text**: #0b0c0c (Dark Gray)
- **Focus**: #ffdd00 (GOV.UK Yellow)

## JavaScript Functionality

The component includes JavaScript for:

- Mobile navigation toggle
- Account menu toggle
- Proper ARIA state management

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Accessibility compliant
