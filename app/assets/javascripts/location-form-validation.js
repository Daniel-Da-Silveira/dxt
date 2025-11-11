/**
 * Location Form Validation
 * Client-side validation for coordinate input forms
 */

import { CoordinateValidator } from "./coordinate-validation.js";

class LocationFormValidator {
  constructor() {
    this.validator = new CoordinateValidator();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Add validation on form submission
    const form = document.querySelector(".form");
    if (form) {
      form.addEventListener("submit", (e) => {
        if (!this.validateForm()) {
          e.preventDefault();
          this.showValidationErrors();
        }
      });
    }

    // Add real-time validation for coordinate inputs
    this.setupCoordinateValidation();
  }

  setupCoordinateValidation() {
    // Decimal degrees validation
    const latDecimal = document.getElementById("location-latitude-decimal");
    const lonDecimal = document.getElementById("location-longitude-decimal");

    if (latDecimal && lonDecimal) {
      [latDecimal, lonDecimal].forEach((input) => {
        input.addEventListener("blur", () => {
          this.validateDecimalDegrees();
        });
      });
    }

    // Degrees and decimal minutes validation
    const decimalMinutesInputs = [
      "location-latitude-decimal-minutes-degree",
      "location-latitude-decimal-minutes-minute",
      "location-latitude-decimal-minutes-direction",
      "location-longitude-decimal-minutes-degree",
      "location-longitude-decimal-minutes-minute",
      "location-longitude-decimal-minutes-direction",
    ];

    decimalMinutesInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", () => {
          this.validateDegreesDecimalMinutes();
        });
      }
    });

    // Degrees, minutes and seconds validation
    const dmsInputs = [
      "location-latitude-degrees-degree",
      "location-latitude-degrees-minute",
      "location-latitude-degrees-second",
      "location-latitude-degrees-direction",
      "location-longitude-degrees-degree",
      "location-longitude-degrees-minute",
      "location-longitude-degrees-second",
      "location-longitude-degrees-direction",
    ];

    dmsInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", () => {
          this.validateDegreesMinutesSeconds();
        });
      }
    });

    // OS Grid reference validation
    const osGridInputs = [
      "location-osgrid-square",
      "location-osgrid-easting",
      "location-osgrid-northing",
    ];

    osGridInputs.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", () => {
          this.validateOSGridRef();
        });
      }
    });

    // OS Grid reference number (single field)
    const osGridRefNumber = document.getElementById("os-grid-reference-number");
    if (osGridRefNumber) {
      osGridRefNumber.addEventListener("blur", () => {
        this.validateOSGridReferenceNumber();
      });
    }

    // Easting/Northing-only alternate IDs
    const enAlt = [
      "location-osgrid-easting-alt",
      "location-osgrid-northing-alt",
    ];
    enAlt.forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", () => {
          this.validateEastingNorthingAlt();
        });
      }
    });

    // National Grid field number
    const ngField = document.getElementById("national-grid-field-number");
    if (ngField) {
      ngField.addEventListener("blur", () => {
        this.validateNationalGridFieldNumber();
      });
    }
  }

  validateForm() {
    // Check if at least one location method is provided
    const hasDecimalDegrees = this.hasDecimalDegrees();
    const hasDecimalMinutes = this.hasDecimalMinutes();
    const hasDegreesMinutesSeconds = this.hasDegreesMinutesSeconds();
    const hasOSGrid = this.hasOSGrid();
    const hasOSGridRefNumber = this.hasOSGridReferenceNumber();
    const hasEastingNorthingAlt = this.hasEastingNorthingAlt();
    const hasNgFieldNumber = this.hasNationalGridFieldNumber();
    const hasMap = this.hasMap();
    const hasTextLocation = this.hasTextLocation();

    const hasAnyLocation =
      hasDecimalDegrees ||
      hasDecimalMinutes ||
      hasDegreesMinutesSeconds ||
      hasOSGrid ||
      hasOSGridRefNumber ||
      hasEastingNorthingAlt ||
      hasNgFieldNumber ||
      hasMap ||
      hasTextLocation;

    if (!hasAnyLocation) {
      this.addError("Please provide at least one location method");
      return false;
    }

    let isValid = true;

    // Validate each provided location method
    if (hasDecimalDegrees) {
      isValid = this.validateDecimalDegrees() && isValid;
    }

    if (hasDecimalMinutes) {
      isValid = this.validateDegreesDecimalMinutes() && isValid;
    }

    if (hasDegreesMinutesSeconds) {
      isValid = this.validateDegreesMinutesSeconds() && isValid;
    }

    if (hasOSGrid) {
      isValid = this.validateOSGridRef() && isValid;
    }

    if (hasOSGridRefNumber) {
      isValid = this.validateOSGridReferenceNumber() && isValid;
    }

    if (hasEastingNorthingAlt) {
      isValid = this.validateEastingNorthingAlt() && isValid;
    }

    if (hasNgFieldNumber) {
      isValid = this.validateNationalGridFieldNumber() && isValid;
    }

    if (hasMap) {
      isValid = this.validateMapInput() && isValid;
    }

    if (hasTextLocation) {
      isValid = this.validateTextLocation() && isValid;
    }

    return isValid;
  }

  hasDecimalDegrees() {
    const lat = document.getElementById("location-latitude-decimal")?.value;
    const lon = document.getElementById("location-longitude-decimal")?.value;
    return lat && lon;
  }

  hasDecimalMinutes() {
    const latDeg = document.getElementById(
      "location-latitude-decimal-minutes-degree"
    )?.value;
    const lonDeg = document.getElementById(
      "location-longitude-decimal-minutes-degree"
    )?.value;
    return latDeg && lonDeg;
  }

  hasDegreesMinutesSeconds() {
    const latDeg = document.getElementById(
      "location-latitude-degrees-degree"
    )?.value;
    const lonDeg = document.getElementById(
      "location-longitude-degrees-degree"
    )?.value;
    return latDeg && lonDeg;
  }

  hasOSGrid() {
    const square = document.getElementById("location-osgrid-square")?.value;
    const easting = document.getElementById("location-osgrid-easting")?.value;
    const northing = document.getElementById("location-osgrid-northing")?.value;
    return square && easting && northing;
  }

  hasOSGridReferenceNumber() {
    const ref = document.getElementById("os-grid-reference-number")?.value;
    return ref && ref.trim().length > 0;
  }

  hasEastingNorthingAlt() {
    const easting = document.getElementById(
      "location-osgrid-easting-alt"
    )?.value;
    const northing = document.getElementById(
      "location-osgrid-northing-alt"
    )?.value;
    return easting && northing;
  }

  hasNationalGridFieldNumber() {
    const field = document.getElementById("national-grid-field-number")?.value;
    return field && field.trim().length > 0;
  }

  hasMap() {
    const mapLat = document.getElementById("map-latitude-input")?.value;
    const mapLon = document.getElementById("map-longitude-input")?.value;
    const mapRadius = document.getElementById("map-radius-input")?.value;
    return mapLat && mapLon && mapRadius;
  }

  hasTextLocation() {
    const textLocation = document.getElementById("text-location")?.value;
    return textLocation && textLocation.trim().length > 0;
  }

  validateDecimalDegrees() {
    const lat = document.getElementById("location-latitude-decimal")?.value;
    const lon = document.getElementById("location-longitude-decimal")?.value;

    const isValid = this.validator.validateDecimalDegrees(lat, lon);

    if (!isValid) {
      this.showFieldErrors(
        "location-latitude-decimal",
        this.validator.getErrors()
      );
      this.showFieldErrors(
        "location-longitude-decimal",
        this.validator.getErrors()
      );
    } else {
      this.clearFieldErrors("location-latitude-decimal");
      this.clearFieldErrors("location-longitude-decimal");
    }

    return isValid;
  }

  validateDegreesDecimalMinutes() {
    const latDeg = document.getElementById(
      "location-latitude-decimal-minutes-degree"
    )?.value;
    const latMin = document.getElementById(
      "location-latitude-decimal-minutes-minute"
    )?.value;
    const latDir = document.getElementById(
      "location-latitude-decimal-minutes-direction"
    )?.value;
    const lonDeg = document.getElementById(
      "location-longitude-decimal-minutes-degree"
    )?.value;
    const lonMin = document.getElementById(
      "location-longitude-decimal-minutes-minute"
    )?.value;
    const lonDir = document.getElementById(
      "location-longitude-decimal-minutes-direction"
    )?.value;

    const isValid = this.validator.validateDegreesDecimalMinutes(
      latDeg,
      latMin,
      latDir,
      lonDeg,
      lonMin,
      lonDir
    );

    if (!isValid) {
      const fieldIds = [
        "location-latitude-decimal-minutes-degree",
        "location-latitude-decimal-minutes-minute",
        "location-latitude-decimal-minutes-direction",
        "location-longitude-decimal-minutes-degree",
        "location-longitude-decimal-minutes-minute",
        "location-longitude-decimal-minutes-direction",
      ];

      fieldIds.forEach((id) => {
        this.showFieldErrors(id, this.validator.getErrors());
      });
    } else {
      const fieldIds = [
        "location-latitude-decimal-minutes-degree",
        "location-latitude-decimal-minutes-minute",
        "location-latitude-decimal-minutes-direction",
        "location-longitude-decimal-minutes-degree",
        "location-longitude-decimal-minutes-minute",
        "location-longitude-decimal-minutes-direction",
      ];

      fieldIds.forEach((id) => {
        this.clearFieldErrors(id);
      });
    }

    return isValid;
  }

  validateDegreesMinutesSeconds() {
    const latDeg = document.getElementById(
      "location-latitude-degrees-degree"
    )?.value;
    const latMin = document.getElementById(
      "location-latitude-degrees-minute"
    )?.value;
    const latSec = document.getElementById(
      "location-latitude-degrees-second"
    )?.value;
    const latDir = document.getElementById(
      "location-latitude-degrees-direction"
    )?.value;
    const lonDeg = document.getElementById(
      "location-longitude-degrees-degree"
    )?.value;
    const lonMin = document.getElementById(
      "location-longitude-degrees-minute"
    )?.value;
    const lonSec = document.getElementById(
      "location-longitude-degrees-second"
    )?.value;
    const lonDir = document.getElementById(
      "location-longitude-degrees-direction"
    )?.value;

    const isValid = this.validator.validateDegreesMinutesSeconds(
      latDeg,
      latMin,
      latSec,
      latDir,
      lonDeg,
      lonMin,
      lonSec,
      lonDir
    );

    if (!isValid) {
      const fieldIds = [
        "location-latitude-degrees-degree",
        "location-latitude-degrees-minute",
        "location-latitude-degrees-second",
        "location-latitude-degrees-direction",
        "location-longitude-degrees-degree",
        "location-longitude-degrees-minute",
        "location-longitude-degrees-second",
        "location-longitude-degrees-direction",
      ];

      fieldIds.forEach((id) => {
        this.showFieldErrors(id, this.validator.getErrors());
      });
    } else {
      const fieldIds = [
        "location-latitude-degrees-degree",
        "location-latitude-degrees-minute",
        "location-latitude-degrees-second",
        "location-latitude-degrees-direction",
        "location-longitude-degrees-degree",
        "location-longitude-degrees-minute",
        "location-longitude-degrees-second",
        "location-longitude-degrees-direction",
      ];

      fieldIds.forEach((id) => {
        this.clearFieldErrors(id);
      });
    }

    return isValid;
  }

  validateOSGridRef() {
    const square = document.getElementById("location-osgrid-square")?.value;
    const easting = document.getElementById("location-osgrid-easting")?.value;
    const northing = document.getElementById("location-osgrid-northing")?.value;

    const isValid = this.validator.validateOSGridRef(square, easting, northing);

    if (!isValid) {
      const fieldIds = [
        "location-osgrid-square",
        "location-osgrid-easting",
        "location-osgrid-northing",
      ];

      fieldIds.forEach((id) => {
        this.showFieldErrors(id, this.validator.getErrors());
      });
    } else {
      const fieldIds = [
        "location-osgrid-square",
        "location-osgrid-easting",
        "location-osgrid-northing",
      ];

      fieldIds.forEach((id) => {
        this.clearFieldErrors(id);
      });
    }

    return isValid;
  }

  validateOSGridReferenceNumber() {
    const value = document.getElementById("os-grid-reference-number")?.value;
    const isValid = this.validator.validateOSGridReferenceNumber(value);

    const fieldId = "os-grid-reference-number";
    if (!isValid) {
      this.showFieldErrors(fieldId, this.validator.getErrors());
    } else {
      this.clearFieldErrors(fieldId);
    }

    return isValid;
  }

  validateEastingNorthingAlt() {
    const easting = document.getElementById(
      "location-osgrid-easting-alt"
    )?.value;
    const northing = document.getElementById(
      "location-osgrid-northing-alt"
    )?.value;

    const isValid = this.validator.validateEastingNorthing(easting, northing);

    const fieldIds = [
      "location-osgrid-easting-alt",
      "location-osgrid-northing-alt",
    ];

    if (!isValid) {
      fieldIds.forEach((id) =>
        this.showFieldErrors(id, this.validator.getErrors())
      );
    } else {
      fieldIds.forEach((id) => this.clearFieldErrors(id));
    }

    return isValid;
  }

  validateNationalGridFieldNumber() {
    const value = document.getElementById("national-grid-field-number")?.value;
    const isValid = this.validator.validateNationalGridFieldNumber(value);
    const fieldId = "national-grid-field-number";

    if (!isValid) {
      this.showFieldErrors(fieldId, this.validator.getErrors());
    } else {
      this.clearFieldErrors(fieldId);
    }

    return isValid;
  }

  validateMapInput() {
    const mapLat = document.getElementById("map-latitude-input")?.value;
    const mapLon = document.getElementById("map-longitude-input")?.value;
    const mapRadius = document.getElementById("map-radius-input")?.value;

    if (!mapLat || !mapLon || !mapRadius) {
      this.addError("Please draw an area on the map");
      return false;
    }

    return true;
  }

  validateTextLocation() {
    const textLocation = document.getElementById("text-location")?.value;

    if (!textLocation || textLocation.trim().length < 10) {
      this.addError(
        "Please provide a detailed location description (at least 10 characters)"
      );
      return false;
    }

    return true;
  }

  showFieldErrors(fieldId, errors) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Add error class to field
    field.classList.add("govuk-input--error");

    // Remove existing error message
    const existingError = field.parentNode.querySelector(
      ".govuk-error-message"
    );
    if (existingError) {
      existingError.remove();
    }

    // Add error message
    if (errors.length > 0) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "govuk-error-message";
      errorDiv.innerHTML = `<span class="govuk-visually-hidden">Error:</span> ${errors[0]}`;

      field.parentNode.insertBefore(errorDiv, field);
    }
  }

  clearFieldErrors(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Remove error class
    field.classList.remove("govuk-input--error");

    // Remove error message
    const existingError = field.parentNode.querySelector(
      ".govuk-error-message"
    );
    if (existingError) {
      existingError.remove();
    }
  }

  showValidationErrors() {
    // Create or update error summary
    let errorSummary = document.querySelector(".govuk-error-summary");

    if (!errorSummary) {
      errorSummary = document.createElement("div");
      errorSummary.className = "govuk-error-summary";
      errorSummary.setAttribute("aria-labelledby", "error-summary-title");
      errorSummary.setAttribute("role", "alert");
      errorSummary.setAttribute("tabindex", "-1");
      errorSummary.setAttribute("data-module", "govuk-error-summary");

      const form = document.querySelector(".form");
      if (form) {
        form.insertBefore(errorSummary, form.firstChild);
      }
    }

    const errorList = this.validator.getErrors();

    if (errorList.length > 0) {
      errorSummary.innerHTML = `
        <h2 class="govuk-error-summary__title" id="error-summary-title">
          There is a problem
        </h2>
        <div class="govuk-error-summary__body">
          <ul class="govuk-list govuk-error-summary__list">
            ${errorList
              .map((error) => `<li><a href="#location-type">${error}</a></li>`)
              .join("")}
          </ul>
        </div>
      `;

      errorSummary.style.display = "block";
    }
  }

  addError(message) {
    this.validator.errors.push(message);
  }
}

// Initialize validation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LocationFormValidator();
});
