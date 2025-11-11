/**
 * GOV.UK OTP Input Component
 * Provides smart focus management, paste functionality, and accessibility features
 * Following GOV.UK Design System patterns
 */

console.log("GOV.UK OTP Input JavaScript loaded successfully!");

class GovukOtpInput {
  constructor(container) {
    this.container = container;
    this.inputs = container.querySelectorAll(".govuk-otp-input__input");
    this.hiddenInput = container.querySelector(".govuk-otp-input__hidden");
    this.maxLength = parseInt(container.dataset.maxLength) || 6;
    this.pattern = container.dataset.pattern || "[0-9]";
    this.name = container.dataset.name;

    console.log("OTP Input constructor:", {
      container: container,
      inputsFound: this.inputs.length,
      maxLength: this.maxLength,
      pattern: this.pattern,
      name: this.name,
    });

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateHiddenValue();
    this.setupAccessibility();
  }

  setupEventListeners() {
    console.log("Setting up event listeners for", this.inputs.length, "inputs");

    this.inputs.forEach((input, index) => {
      // Handle input events
      input.addEventListener("input", (e) => this.handleInput(e, index));
      input.addEventListener("keydown", (e) => this.handleKeydown(e, index));

      // Add paste event with explicit debugging
      input.addEventListener("paste", (e) => {
        console.log(`Individual paste event on input ${index}`);
        this.handlePaste(e, index);
      });

      input.addEventListener("focus", (e) => this.handleFocus(e, index));
      input.addEventListener("blur", (e) => this.handleBlur(e, index));

      console.log("Event listeners attached to input", index);
    });

    // Handle container focus for keyboard navigation
    this.container.addEventListener("keydown", (e) =>
      this.handleContainerKeydown(e)
    );

    // Add container-level paste handler as fallback
    this.container.addEventListener("paste", (e) => {
      console.log("Container paste event triggered");
      // Find the currently focused input
      const focusedInput = this.container.querySelector(
        ".govuk-otp-input__input:focus"
      );
      if (focusedInput) {
        const index = Array.from(this.inputs).indexOf(focusedInput);
        this.handlePaste(e, index);
      } else {
        // If no input is focused, start from the first one
        this.handlePaste(e, 0);
      }
    });
  }

  setupAccessibility() {
    // Add ARIA attributes for screen readers
    this.container.setAttribute("role", "group");
    this.container.setAttribute("aria-label", "One-time password input");

    // Announce changes to screen readers
    this.container.addEventListener("input", () => {
      this.announceToScreenReader();
    });
  }

  handleInput(event, index) {
    const input = event.target;
    const value = input.value;

    // Validate input against pattern
    if (value && !this.isValidCharacter(value)) {
      input.value = "";
      return;
    }

    // Move to next input if character entered
    if (value && index < this.inputs.length - 1) {
      this.focusInput(index + 1);
    }

    this.updateHiddenValue();
    this.updateVisualState();
  }

  handleKeydown(event, index) {
    const input = event.target;

    switch (event.key) {
      case "Backspace":
        event.preventDefault();
        if (input.value) {
          input.value = "";
        } else if (index > 0) {
          this.focusInput(index - 1);
        }
        this.updateHiddenValue();
        this.updateVisualState();
        break;

      case "Delete":
        event.preventDefault();
        input.value = "";
        this.updateHiddenValue();
        this.updateVisualState();
        break;

      case "ArrowLeft":
        event.preventDefault();
        if (index > 0) {
          this.focusInput(index - 1);
        }
        break;

      case "ArrowRight":
        event.preventDefault();
        if (index < this.inputs.length - 1) {
          this.focusInput(index + 1);
        }
        break;

      case "Home":
        event.preventDefault();
        this.focusInput(0);
        break;

      case "End":
        event.preventDefault();
        this.focusInput(this.inputs.length - 1);
        break;

      case "Tab":
        // Allow default tab behavior
        break;

      default:
        // Handle character input
        if (event.key.length === 1 && this.isValidCharacter(event.key)) {
          event.preventDefault();
          input.value = event.key;
          this.updateHiddenValue();
          this.updateVisualState();

          if (index < this.inputs.length - 1) {
            this.focusInput(index + 1);
          }
        }
        break;
    }
  }

  handlePaste(event, index) {
    console.log("handlePaste called with index:", index);
    event.preventDefault();

    const pastedData = (event.clipboardData || window.clipboardData).getData(
      "text"
    );
    const cleanData = this.cleanPastedData(pastedData);

    console.log("Paste detected:", {
      pastedData,
      cleanData,
      index,
      inputsLength: this.inputs.length,
    });

    if (cleanData.length === 0) {
      console.log("No valid data to paste");
      return;
    }

    // Clear all inputs first to ensure clean state
    this.inputs.forEach((input) => {
      input.value = "";
    });

    // Fill inputs starting from the beginning (auto-distribution)
    let currentIndex = 0;
    for (
      let i = 0;
      i < cleanData.length && currentIndex < this.inputs.length;
      i++
    ) {
      console.log(`Setting input ${currentIndex} to value: ${cleanData[i]}`);
      this.inputs[currentIndex].value = cleanData[i];
      currentIndex++;
    }

    console.log(`Filled ${currentIndex} inputs with pasted data`);

    // Focus the next empty input or the last filled input
    const nextEmptyIndex = this.findNextEmptyInput();
    if (nextEmptyIndex !== -1) {
      this.focusInput(nextEmptyIndex);
    } else {
      this.focusInput(Math.min(cleanData.length - 1, this.inputs.length - 1));
    }

    this.updateHiddenValue();
    this.updateVisualState();
  }

  handleFocus(event, index) {
    // Select all text when focusing
    event.target.select();
    this.updateVisualState();
  }

  handleBlur(event, index) {
    this.updateVisualState();
  }

  handleContainerKeydown(event) {
    // Handle arrow key navigation when container is focused
    if (event.target === this.container) {
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          this.focusInput(0);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          this.focusInput(this.inputs.length - 1);
          break;
      }
    }
  }

  isValidCharacter(char) {
    const regex = new RegExp(this.pattern);
    return regex.test(char);
  }

  cleanPastedData(data) {
    if (!data || typeof data !== "string") return "";

    // Remove whitespace, dashes, spaces, and other common separators
    const cleaned = data.replace(/[\s\-_\s]/g, "");

    // Remove non-matching characters and limit to maxLength
    return cleaned
      .split("")
      .filter((char) => this.isValidCharacter(char))
      .slice(0, this.maxLength);
  }

  focusInput(index) {
    if (index >= 0 && index < this.inputs.length) {
      this.inputs[index].focus();
      this.inputs[index].select();
    }
  }

  findNextEmptyInput() {
    for (let i = 0; i < this.inputs.length; i++) {
      if (!this.inputs[i].value) {
        return i;
      }
    }
    return -1;
  }

  updateHiddenValue() {
    const values = Array.from(this.inputs).map((input) => input.value);
    this.hiddenInput.value = values.join("");

    // Trigger change event for form validation
    this.hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  updateVisualState() {
    // Update visual state based on filled inputs
    this.inputs.forEach((input, index) => {
      const isFilled = input.value !== "";
      const isActive = document.activeElement === input;

      input.classList.toggle("govuk-otp-input__input--filled", isFilled);
      input.classList.toggle("govuk-otp-input__input--active", isActive);
    });
  }

  announceToScreenReader() {
    const currentValue = this.hiddenInput.value;
    const filledCount = currentValue.length;

    // Create or update screen reader announcement
    let announcement = this.container.querySelector(
      ".govuk-otp-input__sr-announcement"
    );
    if (!announcement) {
      announcement = document.createElement("div");
      announcement.className =
        "govuk-otp-input__sr-announcement govuk-visually-hidden";
      announcement.setAttribute("aria-live", "polite");
      this.container.appendChild(announcement);
    }

    if (filledCount === 0) {
      announcement.textContent = "No characters entered";
    } else if (filledCount === this.maxLength) {
      announcement.textContent = `All ${this.maxLength} characters entered`;
    } else {
      announcement.textContent = `${filledCount} of ${this.maxLength} characters entered`;
    }
  }

  // Public methods for external control
  getValue() {
    return this.hiddenInput.value;
  }

  setValue(value) {
    const cleanValue = this.cleanPastedData(value);
    this.inputs.forEach((input, index) => {
      input.value = cleanValue[index] || "";
    });
    this.updateHiddenValue();
    this.updateVisualState();
  }

  clear() {
    this.inputs.forEach((input) => {
      input.value = "";
    });
    this.updateHiddenValue();
    this.updateVisualState();
    this.focusInput(0);
  }

  focus() {
    this.focusInput(0);
  }
}

// Initialize all OTP inputs on the page
function initializeOtpInputs() {
  console.log("Initializing OTP inputs...");
  const otpContainers = document.querySelectorAll(".govuk-otp-input");
  console.log("Found", otpContainers.length, "OTP containers");

  otpContainers.forEach((container, index) => {
    console.log("Initializing OTP container", index);
    const otpInstance = new GovukOtpInput(container);
    container._otpInstance = otpInstance; // Store reference for global handler
    console.log(
      "OTP instance attached to container",
      index,
      ":",
      !!container._otpInstance
    );
  });
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeOtpInputs);
} else {
  // DOM is already loaded
  initializeOtpInputs();
}

// Ensure globals for non-module usage
if (typeof window !== "undefined") {
  window.GovukOtpInput = GovukOtpInput;
  window.initializeOtpInputs = initializeOtpInputs;
}

// Add global paste handler as backup
document.addEventListener("paste", function (event) {
  console.log("Global paste event detected");
  const target = event.target;

  // Check if the paste is happening in an OTP input
  if (target.classList.contains("govuk-otp-input__input")) {
    console.log("Paste in OTP input detected");
    const container = target.closest(".govuk-otp-input");
    if (container) {
      const otpInstance = container._otpInstance;
      if (otpInstance) {
        const index = Array.from(otpInstance.inputs).indexOf(target);
        otpInstance.handlePaste(event, index);
      }
    }
  }
});

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = GovukOtpInput;
}
