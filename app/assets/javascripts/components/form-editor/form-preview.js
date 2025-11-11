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

        // Check if we're returning from check answers to a specific page
        const storedPageIndex = sessionStorage.getItem("currentPageIndex");
        if (storedPageIndex !== null) {
          this.currentPageIndex = parseInt(storedPageIndex, 10);
          // Clear the stored page index
          sessionStorage.removeItem("currentPageIndex");
        }

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

    // Create form
    const form = document.createElement("form");
    form.setAttribute("action", "#");
    form.setAttribute("method", "post");
    form.setAttribute("novalidate", "");

    // Only show back link after first page
    if (this.currentPageIndex > 0) {
      const backLink = document.createElement("a");
      backLink.href = "javascript:window.history.back()";
      backLink.className =
        "govuk-back-link govuk-!-margin-bottom-8 govuk-!-margin-top-0 govuk-!-padding-top-0";
      backLink.textContent = "Back";
      form.appendChild(backLink);
    }

    // Add notification banner
    const notificationBanner = document.createElement("div");
    notificationBanner.className = "govuk-notification-banner";
    notificationBanner.setAttribute("role", "region");
    notificationBanner.setAttribute(
      "aria-labelledby",
      "govuk-notification-banner-title"
    );
    notificationBanner.setAttribute("data-module", "govuk-notification-banner");
    notificationBanner.setAttribute("data-govuk-notification-banner-init", "");

    const notificationBannerHeader = document.createElement("div");
    notificationBannerHeader.className = "govuk-notification-banner__header";

    const notificationBannerTitle = document.createElement("h2");
    notificationBannerTitle.className = "govuk-notification-banner__title";
    notificationBannerTitle.setAttribute(
      "id",
      "govuk-notification-banner-title"
    );
    notificationBannerTitle.textContent = "Important";

    const notificationBannerContent = document.createElement("div");
    notificationBannerContent.className = "govuk-notification-banner__content";

    const notificationBannerHeading = document.createElement("p");
    notificationBannerHeading.className =
      "govuk-notification-banner__heading govuk-!-margin-bottom-0";
    notificationBannerHeading.textContent =
      "This is a preview of a draft form page you are editing";

    const notificationBannerLinkContainer = document.createElement("p");
    notificationBannerLinkContainer.className =
      "govuk-notification-banner__heading govuk-!-margin-top-1 js-preview-banner-close";

    const notificationBannerLink = document.createElement("a");
    notificationBannerLink.className = "govuk-link--no-visited-state";
    notificationBannerLink.href = this.getBasePath() + "/form-editor/listing";
    notificationBannerLink.textContent = "Go back to the editor";

    const notificationBannerText = document.createElement("p");
    notificationBannerText.className = "govuk-body govuk-!-margin-top-2";
    notificationBannerText.textContent =
      "It depends on answers from earlier pages in the form. In the live version, users will need to complete those questions first.";

    notificationBannerHeader.appendChild(notificationBannerTitle);

    notificationBannerLinkContainer.appendChild(notificationBannerLink);

    notificationBannerContent.appendChild(notificationBannerHeading);
    notificationBannerContent.appendChild(notificationBannerLinkContainer);
    notificationBannerContent.appendChild(notificationBannerText);

    notificationBanner.appendChild(notificationBannerHeader);
    notificationBanner.appendChild(notificationBannerContent);

    form.appendChild(notificationBanner);

    // Add section caption if exists
    if (currentPage.section) {
      const sectionCaption = document.createElement("span");
      sectionCaption.className = "govuk-caption-l";
      sectionCaption.textContent = currentPage.section.name;
      form.appendChild(sectionCaption);
    }

    // Add page heading
    const heading = document.createElement("h1");
    heading.className = "govuk-heading-l";
    heading.textContent = currentPage.pageHeading || currentPage.title || "";
    form.appendChild(heading);

    // Add guidance text if it exists
    if (
      currentPage.pageType === "guidance" &&
      currentPage.guidanceOnlyGuidanceTextInput
    ) {
      const guidance = document.createElement("div");
      guidance.className = "govuk-body";
      guidance.innerHTML = currentPage.guidanceOnlyGuidanceTextInput;
      form.appendChild(guidance);
    }

    // Render questions if they exist
    if (currentPage.questions && currentPage.questions.length > 0) {
      currentPage.questions
        .filter((q) => q)
        .forEach((question) => {
          const questionHtml = this.renderQuestion(question);
          form.innerHTML += questionHtml;
        });
    }

    // Check if current page is a payment page (only if user added a payment question explicitly)
    const isPaymentPage = currentPage.questions && currentPage.questions.some(q => q.type === 'payment');

    // Add continue button if not on last page and not a payment page
    // Payment pages don't show continue button, but they are still part of the page flow
    if (!isPaymentPage) {
      if (this.currentPageIndex < this.formPages.length - 1) {
        const button = document.createElement("button");
        button.className = "govuk-button";
        button.setAttribute("data-module", "govuk-button");
        button.textContent = "Continue";
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleContinue();
        });
        form.appendChild(button);
      } else {
        // Add a "Check your answers" button on the last page
        const button = document.createElement("button");
        button.className = "govuk-button";
        button.setAttribute("data-module", "govuk-button");
        button.textContent = "Continue";
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleContinue();
        });
        form.appendChild(button);
      }
    } else {
      // For payment pages, add a continue button to proceed to next page
      // This allows navigation through the payment page in the preview
      if (this.currentPageIndex < this.formPages.length - 1) {
        const button = document.createElement("button");
        button.className = "govuk-button";
        button.setAttribute("data-module", "govuk-button");
        button.textContent = "Continue";
        button.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleContinue();
        });
        form.appendChild(button);
      }
    }

    // Add the form directly to the container
    this.mainContainer.appendChild(form);
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
      case "address":
        html = this.renderAddress(question, questionId, labelSize);
        break;
      case "location":
        if (question.subType === "address") {
          html = this.renderAddress(question, questionId, labelSize);
        } else {
          html = this.renderCoordinates(question, questionId, labelSize);
        }
        break;
      case "payment":
        html = this.renderPayment(question, questionId, labelSize);
        break;
      case "declaration":
        html = this.renderDeclaration(question, questionId, labelSize);
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

  // Render precise-location variants inside the editor preview
  renderCoordinates(question, id, labelSize) {
    const isOptional = question.isOptional || false;
    const hintHtml = question.hint
      ? `<div id="${id}-hint" class="govuk-hint">${question.hint}</div>`
      : "";

    let inputsHtml = "";
    switch (question.subType) {
      case "easting_northing":
        inputsHtml = `
          <div class="govuk-form-group govuk-!-margin-bottom-2">
            <label class="govuk-label" for="${id}-easting">Easting</label>
            <input class="govuk-input govuk-input--width-10" id="${id}-easting" name="${id}-easting" type="text">
          </div>
          <div class="govuk-form-group govuk-!-margin-bottom-2">
            <label class="govuk-label" for="${id}-northing">Northing</label>
            <input class="govuk-input govuk-input--width-10" id="${id}-northing" name="${id}-northing" type="text">
          </div>
        `;
        break;
      case "os_grid_number":
        inputsHtml = `
          <div class="govuk-form-group govuk-!-margin-bottom-2">
            <input class="govuk-input govuk-input--width-20" id="${id}-os-grid" name="${id}-os-grid" type="text">
          </div>
        `;
        break;
      case "field_number":
        inputsHtml = `
          <div class="govuk-form-group govuk-!-margin-bottom-2">
            <label class="govuk-label" for="${id}-field">National Grid field number</label>
            <input class="govuk-input govuk-input--width-20" id="${id}-field" name="${id}-field" type="text">
          </div>
        `;
        break;
      case "longitude_latitude":
        inputsHtml = `
          <div class="govuk-date-input row-prototype-coordinate-input" role="group" aria-describedby="${id}-hint">
            <div class="govuk-date-input__item govuk-!-margin-bottom-2">
              <div class="govuk-form-group">
                <label class="govuk-label" for="${id}-latitude">Latitude</label>
                <div class="govuk-input__wrapper">
                  <input class="govuk-input govuk-input--width-6" id="${id}-latitude" name="${id}-latitude" type="text" inputmode="numeric">
                  <div class="govuk-input__suffix" aria-hidden="true">°</div>
                </div>
              </div>
            </div>
            <div class="govuk-date-input__item govuk-!-margin-bottom-2">
              <div class="govuk-form-group">
                <label class="govuk-label" for="${id}-longitude">Longitude</label>
                <div class="govuk-input__wrapper">
                  <input class="govuk-input govuk-input--width-9" id="${id}-longitude" name="${id}-longitude" type="text" inputmode="numeric">
                  <div class="govuk-input__suffix" aria-hidden="true">°</div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
      default:
        inputsHtml = `<div class="govuk-body">Enter location</div>`;
    }

    const helpHtml = question.showHelp && question.helpText
      ? `
        <div class="govuk-form-group govuk-!-margin-bottom-2">
          <details class="govuk-details">
            <summary class="govuk-details__summary">
              <span class="govuk-details__summary-text">How to find location details</span>
            </summary>
            <div class="govuk-details__text">
              <div class="govuk-body markdown-content" data-markdown="${String(question.helpText).replace(/"/g, '&quot;')}"></div>
            </div>
          </details>
        </div>
      `
      : "";

    return `
      <div class="govuk-form-group">
        <fieldset class="govuk-fieldset">
          <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
            ${question.label}${isOptional ? ' (optional)' : ''}
          </legend>
          ${hintHtml}
          ${inputsHtml}
          ${helpHtml}
        </fieldset>
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

  renderAddress(question, id, labelSize) {
    if (question.postcodeLookup) {
      // Postcode lookup interface
      return `
        <div class="govuk-form-group">
          <fieldset class="govuk-fieldset">
            <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
              ${question.label}
            </legend>
            ${
              question.hint
                ? `<div id="${id}-hint" class="govuk-hint">${question.hint}</div>`
                : ""
            }
            
            <div class="govuk-form-group">
              <label class="govuk-label" for="${id}-postcode">
                Postcode
              </label>
              <div class="govuk-hint">
                For example, AA3 1AB
              </div>
              <input class="govuk-input govuk-!-width-one-third" id="${id}-postcode" name="${id}-postcode" type="text">
            </div>

            <div class="govuk-form-group">
              <label class="govuk-label" for="${id}-building-name-number">
                Building number or name (optional)
              </label>
              <div class="govuk-hint">
                For example, 15 or Prospect Cottage
              </div>
              <input class="govuk-input govuk-!-width-one-third" id="${id}-building-name-number" name="${id}-building-name-number" type="text">
            </div>

            <div class="govuk-button-group">
              <button class="govuk-button govuk-!-margin-right-1" type="button">
                Find address
              </button>
              <p class="govuk-body">or <a href="#" class="govuk-link">enter address manually</a></p>
            </div>
          </fieldset>
        </div>
      `;
    } else {
      // Manual address entry interface
      return `
        <div class="govuk-form-group">
          <fieldset class="govuk-fieldset">
            <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
              ${question.label}
            </legend>
            ${
              question.hint
                ? `<div id="${id}-hint" class="govuk-hint">${question.hint}</div>`
                : ""
            }
            
            <div class="govuk-form-group">
              <label class="govuk-label" for="${id}-line-1">
                Address line 1
              </label>
              <input class="govuk-input" id="${id}-line-1" name="${id}-line-1" type="text">
            </div>

            <div class="govuk-form-group">
              <label class="govuk-label" for="${id}-line-2">
                Address line 2 (optional)
              </label>
              <input class="govuk-input" id="${id}-line-2" name="${id}-line-2" type="text">
            </div>

            <div class="govuk-form-group">
              <label class="govuk-label" for="${id}-town">
                Town or city
              </label>
              <input class="govuk-input govuk-!-width-two-thirds" id="${id}-town" name="${id}-town" type="text">
            </div>

            <div class="govuk-form-group">
              <label class="govuk-label" for="${id}-postcode">
                Postcode
              </label>
              <input class="govuk-input govuk-input--width-10" id="${id}-postcode" name="${id}-postcode" type="text">
            </div>
          </fieldset>
        </div>
      `;
    }
  }

  renderPayment(question, id, labelSize) {
    const paymentAmount = question.paymentAmount || '0.00';
    const paymentDescription = question.paymentDescription || 'Payment description';
    
    return `
      <div class="payment-summary-wrap">
        <div class="payment-summary">
          <h1 class="govuk-heading-l">Payment required</h1>
          <p class="govuk-body">${paymentDescription}</p>
          <div class="govuk-warning-text govuk-!-margin-bottom-4" data-module="govuk-warning-text">
            <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
            <strong class="govuk-warning-text__text">
              <span class="govuk-warning-text__assistive">Warning</span>
              You must pay before you can send your form
            </strong>
          </div>
          <p class="govuk-body">When your payment is complete, you'll able to continue with your form.</p>
          <p class="govuk-body govuk-!-margin-bottom-0">
            Total amount:
            <span class="amount govuk-!-font-size-36 govuk-!-font-weight-bold">£${paymentAmount}</span>
          </p>
          <button class="govuk-button govuk-button--primary govuk-!-margin-top-4 govuk-!-margin-bottom-0" data-module="govuk-button" type="button">
            Pay now
          </button>
        </div>
      </div>
    `;
  }

  renderDeclaration(question, id, labelSize) {
    const declarationText = question.declarationText || '';
    const isOptional = question.isOptional || false;
    
    return `
      <div class="govuk-form-group">
        <fieldset class="govuk-fieldset">
          <legend class="govuk-fieldset__legend govuk-fieldset__legend--${labelSize}">
            ${question.label}${isOptional ? ' (optional)' : ''}
          </legend>
          ${declarationText ? `
            <div class="govuk-body markdown-content" data-markdown="${declarationText.replace(/"/g, '&quot;')}"></div>
          ` : ''}
          <div class="govuk-checkboxes" data-module="govuk-checkboxes">
            <div class="govuk-checkboxes__item">
              <input class="govuk-checkboxes__input" id="${id}" name="${id}" type="checkbox" value="true">
              <label class="govuk-label govuk-checkboxes__label" for="${id}">
                I understand and agree
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    `;
  }

  handleContinue() {
    // Store the current answers before moving to next page
    const answers = {};
    const form = this.mainContainer.querySelector("form");

    // First, handle date inputs by combining their parts
    const currentPage = this.formPages[this.currentPageIndex];
    if (currentPage.questions) {
      currentPage.questions.forEach((question) => {
        if (question.type === "date") {
          const questionId = `question-${question.questionId}`;
          const day =
            form.querySelector(`[name="${questionId}-day"]`)?.value || "";
          const month =
            form.querySelector(`[name="${questionId}-month"]`)?.value || "";
          const year =
            form.querySelector(`[name="${questionId}-year"]`)?.value || "";

          if (day && month && year) {
            answers[questionId] = `${day} ${month} ${year}`;
          }
        }
      });
    }

    // Then handle all other inputs
    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      // Skip the hidden input for answers-checked and date parts (already handled)
      if (
        input.name === "answers-checked" ||
        input.name.endsWith("-day") ||
        input.name.endsWith("-month") ||
        input.name.endsWith("-year")
      )
        return;

      if (input.type === "radio" || input.type === "checkbox") {
        if (input.checked) {
          answers[input.name] = input.value;
        }
      } else {
        // Only store if there's a value
        if (input.value.trim()) {
          answers[input.name] = input.value.trim();
        }
      }
    });

    // Get existing answers or initialize empty object
    const storedAnswers = JSON.parse(
      sessionStorage.getItem("formAnswers") || "{}"
    );
    // Update with new answers
    Object.assign(storedAnswers, answers);
    // Store back in session storage
    sessionStorage.setItem("formAnswers", JSON.stringify(storedAnswers));
    console.log("Stored answers:", storedAnswers);

    if (this.currentPageIndex < this.formPages.length - 1) {
      this.currentPageIndex++;
      this.renderCurrentPage();
      window.scrollTo(0, 0);
    } else {
      this.showCheckYourAnswers();
    }
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
    // Redirect to the check answers page
    window.location.href = this.getBasePath() + "/form-editor/check-answers";
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

  getBasePath() {
    if (window.location.pathname.includes("/titan-mvp-1.2/")) {
      return "/titan-mvp-1.2";
    } else if (window.location.pathname.includes("/titan-mvp-1/")) {
      return "/titan-mvp-1";
    }
    return "";
  }
}

// Initialize the form preview when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FormPreview();
});
