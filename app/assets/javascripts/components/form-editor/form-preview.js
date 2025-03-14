class FormPreview {
  constructor() {
    this.currentPageIndex = 0;
    this.formPages = [];
    this.mainContainer = document.getElementById("form-preview-container");
    this.initialize();
  }

  initialize() {
    // Get form pages from session storage
    const pagesData = sessionStorage.getItem("formPages");
    if (pagesData) {
      try {
        this.formPages = JSON.parse(pagesData);
        console.log("Loaded form pages:", this.formPages);
        this.renderCurrentPage();
      } catch (error) {
        console.error("Error parsing form pages:", error);
        this.showError("Error loading form data");
      }
    } else {
      this.showError("No form data found");
    }
  }

  renderCurrentPage() {
    if (!this.mainContainer) return;

    const currentPage = this.formPages[this.currentPageIndex];
    if (!currentPage) {
      this.showError("Page not found");
      return;
    }

    // Clear existing content
    this.mainContainer.innerHTML = "";

    // Create page container
    const pageContainer = document.createElement("div");
    pageContainer.className = "govuk-width-container";

    // Add back link if not on first page
    if (this.currentPageIndex > 0) {
      const backLink = document.createElement("a");
      backLink.href = "#";
      backLink.className = "govuk-back-link";
      backLink.textContent = "Back";
      backLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToPreviousPage();
      });
      pageContainer.appendChild(backLink);
    }

    // Add page heading
    const heading = document.createElement("h1");
    heading.className = "govuk-heading-l";
    heading.textContent = currentPage.pageHeading || currentPage.title || "";
    pageContainer.appendChild(heading);

    // Add guidance text if it exists
    if (
      currentPage.pageType === "guidance" &&
      currentPage.guidanceOnlyGuidanceTextInput
    ) {
      const guidance = document.createElement("div");
      guidance.className = "govuk-body";
      guidance.innerHTML = currentPage.guidanceOnlyGuidanceTextInput;
      pageContainer.appendChild(guidance);
    }

    // Render questions if they exist
    if (currentPage.questions && currentPage.questions.length > 0) {
      const formGroup = document.createElement("div");
      formGroup.className = "govuk-form-group";

      currentPage.questions.forEach((question) => {
        const questionHtml = this.renderQuestion(question);
        formGroup.innerHTML += questionHtml;
      });

      pageContainer.appendChild(formGroup);
    }

    // Add continue button if not on last page
    if (this.currentPageIndex < this.formPages.length - 1) {
      const button = document.createElement("button");
      button.className = "govuk-button";
      button.setAttribute("data-module", "govuk-button");
      button.textContent = "Continue";
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToNextPage();
      });
      pageContainer.appendChild(button);
    } else {
      // Add a "Check your answers" button on the last page
      const button = document.createElement("button");
      button.className = "govuk-button";
      button.setAttribute("data-module", "govuk-button");
      button.textContent = "Check your answers";
      button.addEventListener("click", (e) => {
        e.preventDefault();
        this.showCheckYourAnswers();
      });
      pageContainer.appendChild(button);
    }

    this.mainContainer.appendChild(pageContainer);
  }

  renderQuestion(question) {
    let html = "";
    const questionId = `question-${question.questionId}`;
    const currentPage = this.formPages[this.currentPageIndex];

    // Update logic to check for both conditions:
    // 1. If page has a heading, use --m
    // 2. If no heading but multiple questions, use --m
    // 3. If no heading and single question, use --l
    const labelSize = currentPage.pageHeading
      ? "m"
      : currentPage.questions.length === 1
      ? "l"
      : "m";

    switch (question.type) {
      case "text":
        if (question.subType === "long-answer") {
          html = this.renderTextarea(question, questionId, labelSize);
        } else {
          html = this.renderTextInput(question, questionId, labelSize);
        }
        break;
      case "list":
        if (question.subType === "radios") {
          html = this.renderRadios(question, questionId, labelSize);
        } else if (question.subType === "checkboxes") {
          html = this.renderCheckboxes(question, questionId, labelSize);
        } else if (question.subType === "yes-no") {
          html = this.renderYesNo(question, questionId, labelSize);
        }
        break;
      case "date":
        html = this.renderDate(question, questionId, labelSize);
        break;
      case "email":
        html = this.renderEmail(question, questionId, labelSize);
        break;
      case "phone":
        html = this.renderPhone(question, questionId, labelSize);
        break;
      case "file":
        html = this.renderFileUpload(question, questionId, labelSize);
        break;
      default:
        html = this.renderTextInput(question, questionId, labelSize);
    }

    return html;
  }

  renderTextInput(question, id, labelSize) {
    return `
            <div class="govuk-form-group">
                <label class="govuk-label govuk-label--${labelSize}" for="${id}">
                    ${question.label}
                </label>
                ${
                  question.hint
                    ? `<div class="govuk-hint">${question.hint}</div>`
                    : ""
                }
                <input class="govuk-input" id="${id}" name="${id}" type="text">
            </div>
        `;
  }

  renderTextarea(question, id, labelSize) {
    return `
            <div class="govuk-form-group">
                <label class="govuk-label govuk-label--${labelSize}" for="${id}">
                    ${question.label}
                </label>
                ${
                  question.hint
                    ? `<div class="govuk-hint">${question.hint}</div>`
                    : ""
                }
                <textarea class="govuk-textarea" id="${id}" name="${id}" rows="5"></textarea>
            </div>
        `;
  }

  renderRadios(question, id, labelSize) {
    const options = question.options || [];
    return `
            <div class="govuk-form-group">
                <fieldset class="govuk-fieldset">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
                        ${question.label}
                    </legend>
                ${
                  question.hint
                    ? `<div class="govuk-hint">${question.hint}</div>`
                    : ""
                }
                    <div class="govuk-radios">
                        ${options
                          .map(
                            (option, index) => `
                            <div class="govuk-radios__item">
                                <input class="govuk-radios__input" id="${id}-${index}" name="${id}" type="radio" value="${
                              option.value
                            }">
                                <label class="govuk-label govuk-radios__label" for="${id}-${index}">
                                    ${option.label}
                    </label>
                                ${
                                  option.hint
                                    ? `<div class="govuk-hint govuk-radios__hint">${option.hint}</div>`
                                    : ""
                                }
                </div>
                        `
                          )
                          .join("")}
                </div>
                </fieldset>
            </div>
        `;
  }

  renderCheckboxes(question, id, labelSize) {
    const options = question.options || [];
    return `
                <div class="govuk-form-group">
                    <fieldset class="govuk-fieldset">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
                        ${question.label}
                        </legend>
                        ${
                          question.hint
                            ? `<div class="govuk-hint">${question.hint}</div>`
                            : ""
                        }
                    <div class="govuk-checkboxes">
                        ${options
                          .map(
                            (option, index) => `
                                <div class="govuk-checkboxes__item">
                                <input class="govuk-checkboxes__input" id="${id}-${index}" name="${id}" type="checkbox" value="${
                              option.value
                            }">
                                <label class="govuk-label govuk-checkboxes__label" for="${id}-${index}">
                                    ${option.label}
                                    </label>
                                    ${
                                      option.hint
                                        ? `<div class="govuk-hint govuk-checkboxes__hint">${option.hint}</div>`
                                        : ""
                                    }
                                </div>
                            `
                          )
                          .join("")}
                        </div>
                    </fieldset>
                </div>
            `;
  }

  renderYesNo(question, id, labelSize) {
    return `
                <div class="govuk-form-group">
                    <fieldset class="govuk-fieldset">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
                        ${question.label}
                        </legend>
                        ${
                          question.hint
                            ? `<div class="govuk-hint">${question.hint}</div>`
                            : ""
                        }
                    <div class="govuk-radios govuk-radios--inline">
                                <div class="govuk-radios__item">
                            <input class="govuk-radios__input" id="${id}-yes" name="${id}" type="radio" value="yes">
                            <label class="govuk-label govuk-radios__label" for="${id}-yes">
                                Yes
                                    </label>
                                </div>
                        <div class="govuk-radios__item">
                            <input class="govuk-radios__input" id="${id}-no" name="${id}" type="radio" value="no">
                            <label class="govuk-label govuk-radios__label" for="${id}-no">
                                No
                            </label>
                        </div>
                        </div>
                    </fieldset>
                </div>
            `;
  }

  renderDate(question, id, labelSize) {
    return `
                <div class="govuk-form-group">
                <fieldset class="govuk-fieldset" role="group" aria-describedby="${id}-hint">
                    <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
                        ${question.label}
                        </legend>
                        ${
                          question.hint
                            ? `<div id="${id}-hint" class="govuk-hint">${question.hint}</div>`
                            : ""
                        }
                    <div class="govuk-date-input" id="${id}">
                        <div class="govuk-date-input__item">
                            <div class="govuk-form-group">
                                <label class="govuk-label govuk-date-input__label" for="${id}-day">
                                    Day
                                </label>
                                <input class="govuk-input govuk-date-input__input govuk-input--width-2" id="${id}-day" name="${id}-day" type="text" pattern="[0-9]*" inputmode="numeric">
                            </div>
                        </div>
                        <div class="govuk-date-input__item">
                            <div class="govuk-form-group">
                                <label class="govuk-label govuk-date-input__label" for="${id}-month">
                                    Month
                                </label>
                                <input class="govuk-input govuk-date-input__input govuk-input--width-2" id="${id}-month" name="${id}-month" type="text" pattern="[0-9]*" inputmode="numeric">
                            </div>
                        </div>
                        <div class="govuk-date-input__item">
                            <div class="govuk-form-group">
                                <label class="govuk-label govuk-date-input__label" for="${id}-year">
                                    Year
                                </label>
                                <input class="govuk-input govuk-date-input__input govuk-input--width-4" id="${id}-year" name="${id}-year" type="text" pattern="[0-9]*" inputmode="numeric">
                            </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            `;
  }

  renderEmail(question, id, labelSize) {
    return `
            <div class="govuk-form-group">
                <label class="govuk-label govuk-label--${labelSize}" for="${id}">
                    ${question.label}
                </label>
                ${
                  question.hint
                    ? `<div class="govuk-hint">${question.hint}</div>`
                    : ""
                }
                <input class="govuk-input" id="${id}" name="${id}" type="email" spellcheck="false" autocomplete="email">
            </div>
        `;
  }

  renderPhone(question, id, labelSize) {
    return `
            <div class="govuk-form-group">
                <label class="govuk-label govuk-label--${labelSize}" for="${id}">
                    ${question.label}
                </label>
                ${
                  question.hint
                    ? `<div class="govuk-hint">${question.hint}</div>`
                    : ""
                }
                <input class="govuk-input govuk-input--width-20" id="${id}" name="${id}" type="tel" autocomplete="tel">
            </div>
        `;
  }

  renderFileUpload(question, id, labelSize) {
    return `
            <div class="govuk-form-group">
                <label class="govuk-label govuk-label--${labelSize}" for="${id}">
                    ${question.label}
                </label>
                ${
                  question.hint
                    ? `<div class="govuk-hint">${question.hint}</div>`
                    : ""
                }
                <input class="govuk-file-upload" id="${id}" name="${id}" type="file">
          </div>
        `;
  }

  goToNextPage() {
    if (this.currentPageIndex < this.formPages.length - 1) {
      this.currentPageIndex++;
      this.renderCurrentPage();
      window.scrollTo(0, 0);
    }
  }

  goToPreviousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.renderCurrentPage();
      window.scrollTo(0, 0);
    }
  }

  showCheckYourAnswers() {
    // Implementation for check your answers page
    console.log("Show check your answers page");
  }

  showError(message) {
    if (!this.mainContainer) return;

    this.mainContainer.innerHTML = `
            <div class="govuk-width-container">
            <div class="govuk-error-summary" role="alert" tabindex="-1">
                    <h2 class="govuk-error-summary__title">
                        There is a problem
                    </h2>
                <div class="govuk-error-summary__body">
                    <p>${message}</p>
                    </div>
                </div>
            </div>
        `;
  }
}

// Initialize the form preview when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FormPreview();
});
