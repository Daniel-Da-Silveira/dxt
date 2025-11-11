# GOV.UK OTP Input Component

A GOV.UK Design System compliant OTP (One-Time Password) input component with smart focus management, paste functionality, and accessibility features.

## Features

- **GOV.UK Design System compliant** - Follows all GOV.UK design patterns and accessibility guidelines
- **Smart focus management** - Automatic cursor advancement and backspace handling
- **Paste intelligence** - Detects and fills multiple slots from clipboard
- **Keyboard navigation** - Arrow keys, Home, End, and Tab support
- **Pattern validation** - RegExp support for numbers, letters, or custom formats
- **Accessibility built-in** - Screen readers, keyboard navigation, focus indicators
- **Mobile optimized** - Appropriate keyboards for different input patterns
- **High contrast support** - Works with high contrast mode
- **Reduced motion support** - Respects user motion preferences

## Usage

### Basic 4-digit PIN

```njk
{{ govukOtpInput({
    id: "pin-input",
    name: "pin",
    maxLength: 4,
    pattern: "[0-9]",
    fieldset: {
        legend: {
            text: "Enter your 4-digit PIN",
            isPageHeading: false,
            classes: "govuk-fieldset__legend--s"
        }
    },
    hint: {
        text: "Enter the 4-digit PIN you received"
    }
}) }}
```

### 6-digit verification code with visual grouping

```njk
{{ govukOtpInput({
    id: "verification-code",
    name: "verification_code",
    maxLength: 6,
    pattern: "[0-9]",
    groups: [
        { slots: 3 },
        { slots: 3, separator: "-" }
    ],
    fieldset: {
        legend: {
            text: "Enter verification code",
            isPageHeading: false,
            classes: "govuk-fieldset__legend--s"
        }
    },
    hint: {
        text: "Enter the 6-digit code sent to your phone"
    }
}) }}
```

### 8-digit backup code with alphanumeric characters

```njk
{{ govukOtpInput({
    id: "backup-code",
    name: "backup_code",
    maxLength: 8,
    pattern: "[0-9A-Z]",
    groups: [
        { slots: 4 },
        { slots: 4, separator: "-" }
    ],
    fieldset: {
        legend: {
            text: "Enter backup code",
            isPageHeading: false,
            classes: "govuk-fieldset__legend--s"
        }
    },
    hint: {
        text: "Enter the 8-character backup code (letters and numbers)"
    }
}) }}
```

## Component Variants

### Compact variant

```njk
{{ govukOtpInput({
    id: "compact-code",
    name: "compact_code",
    maxLength: 6,
    pattern: "[0-9]",
    classes: "govuk-otp-input--compact",
    // ... other options
}) }}
```

### Large variant

```njk
{{ govukOtpInput({
    id: "large-code",
    name: "large_code",
    maxLength: 6,
    pattern: "[0-9]",
    classes: "govuk-otp-input--large",
    // ... other options
}) }}
```

## Parameters

| Parameter      | Type   | Description                                 | Default                  |
| -------------- | ------ | ------------------------------------------- | ------------------------ |
| `id`           | string | Unique identifier for the component         | Required                 |
| `name`         | string | Name for the hidden input field             | Required                 |
| `maxLength`    | number | Maximum number of characters                | 6                        |
| `pattern`      | string | RegExp pattern for validation               | "[0-9]"                  |
| `groups`       | array  | Array of group objects defining slot layout | `[{ slots: maxLength }]` |
| `fieldset`     | object | Fieldset configuration                      | Required                 |
| `hint`         | object | Hint text configuration                     | Optional                 |
| `errorMessage` | object | Error message configuration                 | Optional                 |
| `classes`      | string | Additional CSS classes                      | Optional                 |
| `value`        | string | Initial value                               | ""                       |

## Group Configuration

Groups define how the input slots are visually arranged:

```javascript
groups: [
  { slots: 3 }, // 3 slots in first group
  { slots: 3, separator: "-" }, // 3 slots in second group with separator
];
```

## Pattern Examples

| Pattern       | Description                            | Example |
| ------------- | -------------------------------------- | ------- |
| `[0-9]`       | Numbers only                           | 123456  |
| `[0-9A-Z]`    | Numbers and uppercase letters          | 1A2B3C  |
| `[0-9A-Za-z]` | Numbers and letters (case insensitive) | 1a2B3c  |
| `[A-Z]`       | Uppercase letters only                 | ABCDEF  |

## JavaScript API

The component automatically initializes on page load. You can also control it programmatically:

```javascript
// Get the OTP input instance
const container = document.querySelector(".govuk-otp-input");
const otpInput = new GovukOtpInput(container);

// Get current value
const value = otpInput.getValue();

// Set value
otpInput.setValue("123456");

// Clear all inputs
otpInput.clear();

// Focus first input
otpInput.focus();
```

## Accessibility

- Each input slot has proper ARIA labels
- Screen readers announce progress as characters are entered
- Keyboard navigation follows GOV.UK patterns
- Focus indicators meet WCAG 2.1 AA standards
- High contrast mode support
- Reduced motion support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Screen readers (NVDA, JAWS, VoiceOver)

## Demo

Visit `/titan-mvp-1.2/govuk-otp-input-demo` to see the component in action with various examples and configurations.

## Files

- **Macro**: `app/views/components/govuk-otp-input/macro.njk`
- **JavaScript**: `app/assets/javascripts/govuk-otp-input.js`
- **Styles**: `app/assets/sass/components/_govuk-otp-input.scss`
- **Demo**: `app/views/titan-mvp-1.2/govuk-otp-input-demo.html`

## Inspiration

This component is inspired by [shadcn/ui input-otp](https://www.shadcn.io/ui/input-otp) and [input-otp by @guilherme_rodz](https://github.com/guilhermerodz/input-otp), but adapted to follow GOV.UK Design System patterns and accessibility guidelines.
