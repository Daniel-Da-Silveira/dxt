# Design History Template Usage Guide

This guide explains how to use the design history template and provides examples of different sections you can copy and paste into your pages.

## Basic Structure

The template extends from `layouts/main.html` and includes several GOV.UK components. Here's the basic structure:

```njk
{% extends "layouts/main.html" %}

{% from "components/service-header/macro.njk" import serviceHeader %}
{% from "side-navigation/macro.njk" import dwpSideNavigation %}
{% from "govuk/components/table/macro.njk" import govukTable %}
{% from "govuk/components/tabs/macro.njk" import govukTabs %}
{% from "govuk/components/breadcrumbs/macro.njk" import govukBreadcrumbs %}

{% block pageTitle %}
Your Feature Name - Design History
{% endblock %}

{% block header %}
{{ serviceHeader({
    organisationName: "Defra",
    productName: "Forms Designer",
    serviceName: "Design History",
    accountName: "Account",
    containerClasses: containerClasses,
    homepageLink: "/index.html",
    navigationItems: [
        { href: "/index.html", text: "Prototypes", id: "prototype" }
    ],
    activeLinkId: ""
}) }}

{{ xGovukMasthead({
    title: {
        text: featureName
    },
    description: {
        text: "History of how this feature has evolved over time."
    },
    startButton: {
        href: latestVersionLink,
        text: "Latest version of this journey",
        attributes: {
            target: "_blank",
            rel: "noopener noreferrer"
        }
    },
    breadcrumbs: {
        items: breadcrumbs
    }
}) }}
{% endblock %}
```

## Feature Details Section

This section appears at the top of your page and provides key information about the feature:

```njk
<h2 class="govuk-heading-m">Feature details</h2>
<dl class="govuk-summary-list">
    <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Status</dt>
        <dd class="govuk-summary-list__value">
            <strong class="govuk-tag govuk-tag--{{ statusColor }}">{{ status }}</strong>
        </dd>
    </div>
    <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Description</dt>
        <dd class="govuk-summary-list__value">{{ description }}</dd>
    </div>
    <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">User need</dt>
        <dd class="govuk-summary-list__value">{{ userNeed }}</dd>
    </div>
    <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Phase</dt>
        <dd class="govuk-summary-list__value">{{ phase }}</dd>
    </div>
    <div class="govuk-summary-list__row">
        <dt class="govuk-summary-list__key">Category</dt>
        <dd class="govuk-summary-list__value">
            <span class="govuk-!-margin-right-2" style="display: inline-flex; align-items: center;">
                {% if category == "Form creation" %}
                📝
                {% elif category == "Form editing" %}
                ✏️
                {% elif category == "Form publishing" %}
                📤
                {% elif category == "Form admin" %}
                ⚙️
                {% else %}
                📄
                {% endif %}
            </span>
            {{ category }}
        </dd>
    </div>
</dl>
```

## Research History Table

Use this section to show a chronological list of research rounds:

```njk
<h2 class="govuk-heading-m">Research history</h2>
<table class="govuk-table">
    <thead class="govuk-table__head">
        <tr class="govuk-table__row">
            <th scope="col" class="govuk-table__header">Round</th>
            <th scope="col" class="govuk-table__header">Date</th>
            <th scope="col" class="govuk-table__header">Research findings</th>
            <th scope="col" class="govuk-table__header">Changes made</th>
        </tr>
    </thead>
    <tbody class="govuk-table__body">
        {% for entry in researchHistory %}
        <tr class="govuk-table__row">
            <td class="govuk-table__cell">{{ entry.roundNumber }}</td>
            <td class="govuk-table__cell">{{ entry.researchDate }}</td>
            <td class="govuk-table__cell">{{ entry.researchFinding }}</td>
            <td class="govuk-table__cell">{{ entry.changeMade }}</td>
        </tr>
        {% endfor %}
    </tbody>
</table>
```

## Detailed Research Summaries

This section uses an accordion to show detailed research information:

```njk
<h2 class="govuk-heading-m">Detailed research summaries</h2>
<div class="timeline govuk-accordion" data-module="govuk-accordion" id="accordion-default">
    {% for researchSummary in researchSummaries %}
    <div class="timeline__item govuk-accordion__section">
        <div class="timeline__header govuk-accordion__section-header">
            <h3 class="timeline__title govuk-accordion__section-heading">
                <span class="govuk-accordion__section-button" id="accordion-default-heading-{{ loop.index }}">
                    {{ researchSummary.title }}
                </span>
            </h3>
            <div class="timeline__summary govuk-accordion__section-summary govuk-body">
                {{ researchSummary.summary }}
            </div>
        </div>
        <div id="accordion-default-content-{{ loop.index }}" class="timeline__content govuk-accordion__section-content">
            <!-- Content sections go here -->
        </div>
    </div>
    {% endfor %}
</div>
```

## Content Sections

Here are examples of different content sections you can use within the research summaries:

### 1. Basic Content with Markdown

```njk
{% if section.type == 'content' %}
<div class="markdown-content govuk-body" data-markdown="{{ section.content | replace('"', ' &quot;') | replace('\n', '\\n' ) }}"></div>
{% endif %}
```

### 2. Research Objectives

```njk
{% elif section.type == 'objectives' %}
<h4 class="govuk-heading-s">Research objectives</h4>
<ul class="govuk-list govuk-list--bullet">
    {% for objective in section.content %}
    <li>{{ objective }}</li>
    {% endfor %}
</ul>
```

### 3. Images

```njk
{% elif section.type == 'images' %}
<div class="govuk-grid-row app-prose-scope">
    {% for image in section.content %}
    <div class="govuk-grid-column-{{ image.width | default('two-thirds') }}">
        <figure class="govuk-image {% if image.classes %}{{ image.classes }}{% endif %}">
            {% if image.link %}
            <a href="{{ image.link }}" class="govuk-link">
            {% endif %}
            <img src="{{ image.src }}" alt="{{ image.alt }}"
                {% if image.scale %}style="width: {{ image.scale }}%; height: auto;" {% endif %}
                {% if image.widthPx %}width="{{ image.widthPx }}" {% endif %}
                {% if image.heightPx %}height="{{ image.heightPx }}" {% endif %}
                {% if image.classes %}class="{{ image.classes }}" {% endif %} />
            {% if image.link %}
            </a>
            {% endif %}
            {% if image.caption %}
            <figcaption>{{ image.caption }}</figcaption>
            {% endif %}
        </figure>
    </div>
    {% endfor %}
</div>
```

### 4. Participant Quotes

```njk
{% elif section.type == 'quotes' %}
<div class="govuk-grid-row">
    <div class="govuk-grid-column-two-thirds">
        {% if section.content|length > 1 %}
        <h4 class="govuk-heading-s">Participant quotes</h4>
        {% endif %}
        {% for quote in section.content %}
        <div class="govuk-inset-text">{{ quote | safe }}</div>
        {% endfor %}
    </div>
</div>
```

### 5. Changes and Rationale

```njk
{% elif section.type == 'changes' %}
<h4 class="govuk-heading-s">{{ section.title | default("Changes and rationale") }}</h4>
<table class="govuk-table">
    <thead class="govuk-table__head">
        <tr class="govuk-table__row">
            <th scope="col" class="govuk-table__header">Screen</th>
            <th scope="col" class="govuk-table__header">What changed</th>
            <th scope="col" class="govuk-table__header">Why</th>
            {% if section.showImageColumn != false %}
            <th scope="col" class="govuk-table__header">Image</th>
            {% endif %}
        </tr>
    </thead>
    <tbody class="govuk-table__body">
        {% for change in section.content %}
        <tr class="govuk-table__row">
            <td class="govuk-table__cell">{{ change.screen }}</td>
            <td class="govuk-table__cell">{{ change.what }}</td>
            <td class="govuk-table__cell">{{ change.why }}</td>
            {% if section.showImageColumn != false %}
            <td class="govuk-table__cell">
                {% if change.image %}
                <figure class="govuk-image govuk-!-margin-0">
                    <img src="{{ change.image.src }}" alt="{{ change.image.alt }}" class="table-image">
                    {% if change.image.caption %}
                    <figcaption class="govuk-body-s govuk-!-margin-top-1">{{ change.image.caption }}</figcaption>
                    {% endif %}
                </figure>
                {% endif %}
            </td>
            {% endif %}
        </tr>
        {% endfor %}
    </tbody>
</table>
```

## Side Navigation

The template includes a side navigation section that shows where the feature fits in the user journey:

```njk
<div class="govuk-grid-column-one-third">
    <div class="app-related-items">
        <h2 class="govuk-heading-s">Where this feature fits</h2>
        <nav role="navigation" aria-labelledby="journey-navigation">
            <ul class="govuk-list govuk-list--spaced">
                {% for step in journeySteps %}
                <li class="govuk-!-margin-top-4">
                    <span class="govuk-heading-s govuk-!-margin-bottom-1{% if not step.isCurrent %} app-secondary-text{% endif %}" style="display: block;">
                        {{ step.number }}. {{ step.title }}
                    </span>
                    <!-- Subtitles and current step indicators -->
                </li>
                {% endfor %}
            </ul>
        </nav>
    </div>
</div>
```

## Required Variables

When using this template, you'll need to provide the following variables in your page data:

- `featureName`: The name of the feature
- `status`: Current status of the feature
- `statusColor`: Color for the status tag (e.g., "blue", "green", "red")
- `description`: Feature description
- `userNeed`: User need statement
- `phase`: Current phase
- `category`: Feature category
- `improvements`: Array of key improvements
- `researchHistory`: Array of research history entries
- `researchSummaries`: Array of detailed research summaries
- `journeySteps`: Array of journey steps
- `breadcrumbs`: Array of breadcrumb items
- `latestVersionLink`: Link to the latest version

## Styling

The template includes custom CSS for various components. Make sure to include the following in your page's head section:

```html
<style>
  .iframe-container {
    border: 5px solid black;
    border-radius: 4px;
    padding: 0;
    overflow: hidden;
    position: relative;
  }
  /* ... other styles ... */
</style>
```

## JavaScript

The template includes JavaScript for handling the iframe maximize/minimize functionality and markdown parsing. Make sure to include:

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
  // ... JavaScript code for markdown parsing and iframe controls ...
</script>
```
