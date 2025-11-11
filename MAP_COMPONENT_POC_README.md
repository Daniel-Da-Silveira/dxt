# Map Component Proof of Concept

## Overview

This proof of concept demonstrates the pitfalls of creating separate map components for each location output type versus implementing a unified map component approach. The demonstration addresses concerns raised about whether extending individual location components with map functionality would be sufficient for form team requirements.

## Problem Statement

During a call, it was agreed to extend/enhance each individual location component with a "select location on a map" option. However, concerns were raised about whether this approach would be sufficient or even jarring for form teams with complex requirements.

### Real-world Requirements Examples

**NEWLS**: Interactive Map that returns OS grid reference and/or Lat/Lng (decimal places only)

**APHA Contact Form**: "The animals' location – include the address or postcode, an OS grid reference, what3words or any common landmarks"

**Habitat Reporting**: Capturing location details (OS grid reference) by selecting a particular location or drawing a polygon

## The Problem with Separate Components

If we implemented separate map components for each output type, forms would become:

- **Overwhelming and cluttered** - Multiple map instances on the same page
- **Confusing for users** - Different interactions for the same location
- **Inconsistent** - Different styling and behavior across components
- **Performance-heavy** - Multiple map instances loading simultaneously
- **Mobile-unfriendly** - Poor experience on smaller screens

## The Solution: Unified Map Component

A unified map component based on the proven design pattern from the [Flood Map for Planning service](https://flood-map-for-planning.service.gov.uk/location) that allows form designers to configure which location output formats they need provides:

- **Multiple location input methods** (place/postcode, NGR, easting/northing)
- **Single interactive map** for visual selection
- **Clean, uncluttered form design**
- **Consistent user experience**
- **Configurable outputs** based on requirements
- **Better performance** with single map instance
- **Mobile-friendly design**
- **Proven government service pattern**

## Proof of Concept Pages

### 1. Main Overview Page
**URL**: `/titan-mvp-1.2/form-editor/location/map-component-poc`

- Overview of the problem and solution
- Real-world requirements from form teams
- High-level comparison of approaches
- Links to detailed examples

### 2. Separate Components Example
**URL**: `/titan-mvp-1.2/form-editor/location/separate-components-example`

- Realistic APHA Contact Form showing separate map components
- Demonstrates the cluttered, overwhelming user experience
- Shows 4 different map components for the same location
- Highlights specific problems with this approach

### 3. Unified Component Example
**URL**: `/titan-mvp-1.2/form-editor/location/unified-component-example`

- Same APHA Contact Form with unified map component
- Clean, efficient user experience
- Single map interaction generating multiple outputs
- Shows how form designers can configure required outputs

## Key Benefits of Unified Approach

### For Form Designers
- Drag-and-drop map component
- Checkbox configuration for outputs
- Preview of selected formats
- Consistent styling and behavior
- Accessibility built-in

### For Users
- Single map interaction
- Clean, uncluttered forms
- Consistent experience
- Mobile-friendly
- Reduced cognitive load

### For Developers
- Single component to maintain
- Consistent validation logic
- Better performance
- Easier testing
- Unified accessibility features

## Technical Implementation

The unified map component (based on Flood Map for Planning design) would include:

- Multiple location input methods (place/postcode, NGR, easting/northing)
- Single interactive map instance
- Configurable output selection for form designers
- Real-time coordinate conversion
- Polygon drawing capabilities
- Address reverse geocoding
- What3Words integration
- OS Grid Reference calculation
- Proven accessibility patterns from existing government services

## Form Team Configuration Examples

### NEWLS Configuration
- ✅ OS Grid Reference
- ✅ Lat/Lng (decimal)
- ❌ What3Words
- ❌ Address

### APHA Configuration
- ✅ OS Grid Reference
- ✅ What3Words
- ✅ Address
- ❌ Lat/Lng

### Habitat Reporting Configuration
- ✅ OS Grid Reference
- ✅ Polygon drawing
- ✅ Lat/Lng (decimal)
- ❌ What3Words

## Recommendation

Implement a unified map component based on the proven design pattern from the [Flood Map for Planning service](https://flood-map-for-planning.service.gov.uk/location) that allows form designers to configure which location output formats they need. This approach provides the flexibility required by different form teams while maintaining a clean, consistent user experience and leveraging a proven government service design pattern.

## Accessing the Proof of Concept

1. Navigate to the main overview page: `/titan-mvp-1.2/form-editor/location/map-component-poc`
2. Review the problem statement and real-world requirements
3. Click through to the detailed examples to see the difference
4. Compare the user experience between separate and unified approaches

This proof of concept clearly demonstrates why a unified approach is superior to separate map components for each output type.
