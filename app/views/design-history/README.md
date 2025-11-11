# Design History Template Guide

This guide explains how to use the design history template to document the evolution of your features.

## Basic Structure

Each design history page needs these basic details at the top:

```javascript
{% set featureName = "Name of your feature" %}
{% set latestVersionLink = "/path/to/latest/version" %}
{% set status = "Tested" %} // Options: Tested, In progress, Not tested
{% set statusColor = "green" %} // Options: green, blue, grey
{% set userNeed = "What problem does this feature solve?" %}
{% set phase = "Private beta" %} // Options: Private beta, Public beta, Live
{% set category = "Form admin" %} // Options: Form creation, Form editing, Form publishing, Form admin
```

## Research History

Document your research rounds in a table:

```javascript
{% set researchHistory = [
    [
        { text: "1" }, // Round number
        { text: "May 2024" }, // Date
        { text: "What you learned from users" },
        { text: "Changes you made" },
        { html: "<a href='/path/to/prototype' target='_blank'>MVP 1</a>" } // Link to prototype
    ]
] %}
```

## Research Summaries

Create detailed summaries of each research round. Each summary can contain different types of content:

### Content Types

1. **Basic Content**

```javascript
{
    type: "content",
    content: "Your text here. You can use markdown for formatting."
}
```

2. **Objectives**

```javascript
{
    type: "objectives",
    content: [
        "First objective",
        "Second objective"
    ]
}
```

3. **Findings**

```javascript
{
    type: "findings",
    content: [
        "First finding",
        "Second finding"
    ]
}
```

4. **Recommendations**

```javascript
{
    type: "recommendations",
    content: [
        "First recommendation",
        "Second recommendation"
    ]
}
```

5. **Images**

```javascript
{
    type: "images",
    content: {
        src: "/path/to/image.png",
        alt: "Description of the image",
        caption: "Caption for the image",
        width: "two-thirds", // Optional: Controls image width
        classes: "your-custom-classes" // Optional: Add custom CSS classes
    }
}
```

6. **Preview**

```javascript
{
    type: "preview",
    url: "https://example.com/prototype"
}
```

7. **Details Section**

```javascript
{
    type: "details",
    summary: "Click to expand",
    content: "Introduction text",
    items: [
        {
            type: "content",
            content: "Your text here"
        },
        {
            type: "images",
            content: {
                src: "/path/to/image.png",
                alt: "Image description",
                caption: "Image caption"
            }
        },
        {
            type: "preview",
            url: "https://example.com/prototype"
        }
    ]
}
```

## Example: Complete Research Summary

Here's a complete example of a research summary:

```javascript
{% set researchSummaries = [
    {
        title: "Round 1 - May 2024",
        summary: "Initial testing of form creation process",
        sections: [
            {
                type: "content",
                content: "### User research overview\n\nWe tested with 6 content designers from various teams."
            },
            {
                type: "objectives",
                content: [
                    "Test basic form creation flow",
                    "Evaluate field validation"
                ]
            },
            {
                type: "details",
                summary: "View design evolution",
                content: "Here's how the design changed:",
                items: [
                    {
                        type: "content",
                        content: "### Version 1\n\nInitial design with basic fields."
                    },
                    {
                        type: "images",
                        content: {
                            src: "/images/v1.png",
                            alt: "Version 1 design",
                            caption: "Basic form fields"
                        }
                    },
                    {
                        type: "preview",
                        url: "https://example.com/v1"
                    }
                ]
            },
            {
                type: "findings",
                content: [
                    "Users needed clearer validation messages",
                    "Form name field caused confusion"
                ]
            }
        ]
    }
] %}
```

## Tips

1. **Keep it Organized**

   - Use clear headings
   - Group related content together
   - Use details sections for long content

2. **Make it Visual**

   - Include screenshots of each version
   - Add interactive previews when possible
   - Use images to show key changes

3. **Be Clear**

   - Write in plain English
   - Explain technical terms
   - Focus on user impact

4. **Stay Consistent**
   - Use the same structure for each research round
   - Follow the same format for similar content
   - Keep image sizes consistent

## Need Help?

If you're unsure about how to structure your content, look at existing design history pages for examples. You can also ask the design team for guidance.
