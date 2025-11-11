# Check Answers Settings - Modular Components

This directory contains modular Nunjucks components for the check answers settings page, allowing for flexible sub-navigation combinations.

## Components

### 1. Sub-Navigation Macro (`macro.njk`)

A reusable macro that generates the sub-navigation for check answers settings.

**Usage:**

```njk
{% from "components/check-answers-sub-nav/macro.njk" import checkAnswersSubNav %}

{{ checkAnswersSubNav(
  currentTab='page-settings',
  showDeclarationTab=true,
  showSectionsTab=false,
  baseUrl="/titan-mvp-1.2/form-editor/check-answers/settings-v2"
) }}
```

**Parameters:**

- `currentTab` (string): The currently active tab ('page-settings', 'declaration', or 'sections')
- `showDeclarationTab` (boolean): Whether to show the declaration text tab
- `showSectionsTab` (boolean): Whether to show the organize sections tab
- `baseUrl` (string): The base URL for navigation links

### 2. Tab Content Templates

#### Page Settings (`check-answers-tabs/page-settings.njk`)

Shows the summary list with links to add declaration text and sections.

**Usage:**

```njk
{% include "components/check-answers-tabs/page-settings.njk" %}
```

#### Declaration Text (`check-answers-tabs/declaration.njk`)

Contains the form for adding declaration text with markdown support.

**Usage:**

```njk
{% include "components/check-answers-tabs/declaration.njk" %}
```

#### Organize Sections (`check-answers-tabs/sections.njk`)

Contains the form for organizing sections and managing section headings.

**Usage:**

```njk
{% include "components/check-answers-tabs/sections.njk" %}
```

## Sub-Navigation Variations

The modular approach allows for these sub-navigation combinations:

1. **Page settings only**

   - Shows: "Page settings"
   - Use: `showDeclarationTab=false, showSectionsTab=false`

2. **Page settings + Declaration text**

   - Shows: "Page settings | Declaration text"
   - Use: `showDeclarationTab=true, showSectionsTab=false`

3. **Page settings + Organize sections**

   - Shows: "Page settings | Organize sections"
   - Use: `showDeclarationTab=false, showSectionsTab=true`

4. **All three tabs**
   - Shows: "Page settings | Declaration text | Organize sections"
   - Use: `showDeclarationTab=true, showSectionsTab=true`

## Example Implementation

```njk
{% extends "layouts/main.html" %}
{% from "components/check-answers-sub-nav/macro.njk" import checkAnswersSubNav %}

{% block content %}
<div class="govuk-summary-card__content">
  <!-- Sub Navigation -->
  {{ checkAnswersSubNav(
    currentTab=data.currentTab or 'page-settings',
    showDeclarationTab=data.showDeclarationTab,
    showSectionsTab=data.showSectionsTab,
    baseUrl="/titan-mvp-1.2/form-editor/check-answers/settings-v2"
  ) }}

  <!-- Tab Content -->
  {% if data.currentTab == 'declaration' %}
    {% include "components/check-answers-tabs/declaration.njk" %}
  {% elif data.currentTab == 'sections' %}
    {% include "components/check-answers-tabs/sections.njk" %}
  {% else %}
    {% include "components/check-answers-tabs/page-settings.njk" %}
  {% endif %}
</div>
{% endblock %}
```

## Routes

The modular components work with these routes:

- `/titan-mvp-1.2/form-editor/check-answers/settings-modular` - Main modular settings page
- `/titan-mvp-1.2/form-editor/check-answers/example-modular` - Example page showing all variations

## Benefits

1. **Reusability**: Components can be used across different pages
2. **Flexibility**: Easy to show/hide tabs based on user actions
3. **Maintainability**: Changes to navigation or tab content only need to be made in one place
4. **Consistency**: Ensures consistent styling and behavior across all instances
5. **Scalability**: Easy to add new tabs or modify existing ones

## Data Requirements

The components expect the following data structure:

```javascript
{
  currentTab: 'page-settings' | 'declaration' | 'sections',
  showDeclarationTab: boolean,
  showSectionsTab: boolean,
  checkAnswersGuidanceTextInput: string, // For declaration text
  // ... other form data
}
```
