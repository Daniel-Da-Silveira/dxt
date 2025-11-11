//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

/**
 * Example component
 *
 * This allows automatic resizing of the iFrame pages contained within Example
 * template wrappers.
 *
 * @param {Element} $module - HTML element to use for example
 */
class Example {
  /**
   * @param {Element} $module - HTML element
   */
  constructor($module) {
    if (
      !($module instanceof HTMLIFrameElement) ||
      !document.body.classList.contains("govuk-frontend-supported")
    ) {
      return;
    }

    this.$module = $module;

    // Initialise asap for eager iframes or browsers which don't support lazy loading
    if (!("loading" in this.$module) || this.$module.loading !== "lazy") {
      return iFrameResize({ scrolling: "omit" }, this.$module);
    }

    this.$module.addEventListener("load", () => {
      try {
        iFrameResize({ scrolling: "omit" }, this.$module);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    });
  }
}

/**
 * The naming of things is a little complicated in here.
 * For reference:
 *
 * - AppTabs - this JS module
 * - app-tabs, js-tabs - groups of classes used by the tabs component
 * - mobile tabs - the controls to show or hide panels on mobile; these are functionally closer to being an accordion than tabs
 * - desktop tabs - the controls to show, hide or switch panels on tablet/desktop
 * - panels - the content that is shown/hidden/switched; same across all breakpoints
 */
class AppTabs {
  /**
   * @param {Element} $module - HTML element
   */
  constructor($module) {
    if (
      !($module instanceof HTMLElement) ||
      !document.body.classList.contains("govuk-frontend-supported")
    ) {
      return this;
    }

    this.$module = $module;
    this.$mobileTabs = this.$module.querySelectorAll(".js-tabs__heading a");
    this.$desktopTabs = this.$module.querySelectorAll(".js-tabs__item a");
    this.$panels = this.$module.querySelectorAll(".js-tabs__container");

    // Enhance mobile tabs into buttons
    this.enhanceMobileTabs();

    // Add bindings to desktop tabs
    this.$desktopTabs.forEach(($tab) => {
      $tab.addEventListener("click", (event) => this.onClick(event));
    });

    // Reset all tabs and panels to closed state
    // We also add all our default ARIA goodness here
    this.resetTabs();

    // Show the first panel already open if the `open` attribute is present
    if (this.$module.hasAttribute("data-open")) {
      this.openPanel(this.$panels[0].id);
    }
  }

  /**
   * Handle tab clicks
   *
   * @param {Event} event - Click event
   */
  onClick(event) {
    event.preventDefault();

    const $currentTab = event.target;
    if (!($currentTab instanceof HTMLElement)) {
      return;
    }

    const panelId = $currentTab.getAttribute("aria-controls");
    if (!panelId) {
      return;
    }

    const $panel = this.getPanel(panelId);
    const isTabAlreadyOpen =
      $currentTab.getAttribute("aria-expanded") === "true";

    if (!$panel) {
      throw new Error(`Invalid example ID given: ${panelId}`);
    }

    // If the panel that's been called is already open, close it.
    // Otherwise, close all panels and open the one requested.
    if (isTabAlreadyOpen) {
      this.closePanel(panelId);
    } else {
      this.resetTabs();
      this.openPanel(panelId);
    }
  }

  /**
   * Enhances mobile tab anchors to buttons elements
   *
   * On mobile, tabs act like an accordion and are semantically more similar to
   * buttons than links, so let's use the appropriate element
   */
  enhanceMobileTabs() {
    // Loop through mobile tabs...
    this.$mobileTabs.forEach(($tab) => {
      // ...construct a button equivalent of each anchor...
      const $button = document.createElement("button");
      $button.setAttribute("aria-controls", $tab.getAttribute("aria-controls"));
      $button.setAttribute("data-track", $tab.getAttribute("data-track"));
      $button.classList.add("app-tabs__heading-button");
      $button.innerHTML = $tab.innerHTML;
      // ...bind controls...
      $button.addEventListener("click", (event) => this.onClick(event));
      // ...and replace the anchor with the button
      $tab.parentElement.appendChild($button);
      $tab.parentElement.removeChild($tab);
    });

    // Replace the value of $mobileTabs with the new buttons
    this.$mobileTabs = this.$module.querySelectorAll(
      ".js-tabs__heading button"
    );
  }

  /**
   * Reset tabs and panels to closed state
   */
  resetTabs() {
    this.$panels.forEach(($panel) => {
      // We don't want to hide the panel if there are no tabs present to show it
      if (!$panel.classList.contains("js-tabs__container--no-tabs")) {
        this.closePanel($panel.id);
      }
    });
  }

  /**
   * Open a panel and set the associated controls and styles
   *
   * @param {string} panelId - Tab panel ID
   */
  openPanel(panelId) {
    if (!panelId) {
      return;
    }

    const $panel = this.getPanel(panelId);
    if (!$panel) {
      return;
    }

    const $mobileTab = this.getMobileTab(panelId);
    const $desktopTab = this.getDesktopTab(panelId);

    // Panels can exist without associated tabs–for example if there's a single
    // panel that's open by default–so make sure they actually exist before use
    if (
      $mobileTab &&
      $mobileTab.parentElement &&
      $desktopTab &&
      $desktopTab.parentElement
    ) {
      $mobileTab.setAttribute("aria-expanded", "true");
      $mobileTab.parentElement.classList.add("app-tabs__heading--current");
      $desktopTab.setAttribute("aria-expanded", "true");
      $desktopTab.parentElement.classList.add("app-tabs__item--current");
    }

    $panel.removeAttribute("hidden");
  }

  /**
   * Close a panel and set the associated controls and styles
   *
   * @param {string} panelId - Tab panel ID
   */
  closePanel(panelId) {
    if (!panelId) {
      return;
    }

    const $panel = this.getPanel(panelId);
    if (!$panel) {
      return;
    }

    const $mobileTab = this.getMobileTab(panelId);
    const $desktopTab = this.getDesktopTab(panelId);

    // Panels can exist without associated tabs–for example if there's a single
    // panel that's open by default–so make sure they actually exist before use
    if (
      $mobileTab &&
      $mobileTab.parentElement &&
      $desktopTab &&
      $desktopTab.parentElement
    ) {
      $mobileTab.setAttribute("aria-expanded", "false");
      $mobileTab.parentElement.classList.remove("app-tabs__heading--current");
      $desktopTab.setAttribute("aria-expanded", "false");
      $desktopTab.parentElement.classList.remove("app-tabs__item--current");
    }

    $panel.setAttribute("hidden", "hidden");
  }

  /**
   * Helper function to get a specific mobile tab by the associated panel ID
   *
   * @param {string} panelId - Tab panel ID
   * @returns {HTMLButtonElement | null} Mobile tab button
   */
  getMobileTab(panelId) {
    let result = null;
    this.$mobileTabs.forEach(($tab) => {
      if ($tab.getAttribute("aria-controls") === panelId) {
        result = $tab;
      }
    });
    return result;
  }

  /**
   * Helper function to get a specific desktop tab by the associated panel ID
   *
   * @param {string} panelId - Tab panel ID
   * @returns {HTMLAnchorElement | null} Desktop tab link
   */
  getDesktopTab(panelId) {
    const $desktopTabContainer = this.$module.querySelector(".app-tabs");
    if ($desktopTabContainer) {
      return $desktopTabContainer.querySelector(`[aria-controls="${panelId}"]`);
    }
    return null;
  }

  /**
   * Helper function to get a specific panel by ID
   *
   * @param {string} panelId - Tab panel ID
   * @returns {HTMLElement | null} Tab panel
   */
  getPanel(panelId) {
    return document.getElementById(panelId);
  }
}

// Find all tabs + initialise
const $tabs = document.querySelectorAll('[data-module="app-tabs"]');
$tabs.forEach(($tabs) => {
  new AppTabs($tabs);
});

// Find all example frames
const $examples = document.querySelectorAll(
  '[data-module="app-example-frame"]'
);

if ($examples.length) {
  import("/plugin-assets/iframe-resizer/js/iframeResizer.min.js").then(() => {
    // Initialise example frames
    $examples.forEach(($example) => {
      new Example($example);
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  var backToTop = document.querySelector(
    ".gem-c-contents-list-with-body__link-wrapper"
  );
  var contents = document.getElementById("contents");
  if (!backToTop || !contents) return;

  function checkBackToTopVisibility() {
    var show = window.scrollY > contents.offsetTop + contents.offsetHeight;
    backToTop.classList.toggle(
      "gem-c-contents-list-with-body__sticky-element--enabled",
      show
    );
    backToTop.classList.toggle(
      "gem-c-contents-list-with-body__sticky-element--stuck-to-window",
      show
    );
    backToTop.classList.toggle(
      "gem-c-contents-list-with-body__sticky-element--hidden",
      !show
    );
  }

  window.addEventListener("scroll", checkBackToTopVisibility);
  window.addEventListener("resize", checkBackToTopVisibility);
  checkBackToTopVisibility();
});

// Handle contents list active state
function updateContentsListActiveState() {
  const contentsLinks = document.querySelectorAll(".app-contents-list__link");
  const sections = Array.from(contentsLinks).map((link) => {
    const id = link.getAttribute("href").substring(1);
    return {
      id,
      element: document.getElementById(id),
      link,
    };
  });

  // Find the current section
  const currentSection = sections.find((section) => {
    if (!section.element) return false;
    const rect = section.element.getBoundingClientRect();
    // Consider a section active when its top is near the top of the viewport
    // and it's still visible in the viewport
    return rect.top <= 100 && rect.bottom >= 100;
  });

  // Update active states
  contentsLinks.forEach((link) => {
    link.classList.remove("active");
  });

  if (currentSection) {
    currentSection.link.classList.add("active");
  } else {
    // If no section is currently in view, find the last section that was above the viewport
    const lastSectionAboveViewport = sections.reverse().find((section) => {
      if (!section.element) return false;
      const rect = section.element.getBoundingClientRect();
      return rect.top < 0;
    });

    if (lastSectionAboveViewport) {
      lastSectionAboveViewport.link.classList.add("active");
    }
  }
}

// Update active state on scroll with throttling
let scrollTimeout;
window.addEventListener("scroll", () => {
  if (scrollTimeout) {
    window.cancelAnimationFrame(scrollTimeout);
  }
  scrollTimeout = window.requestAnimationFrame(updateContentsListActiveState);
});

// Update active state on load
window.addEventListener("load", updateContentsListActiveState);

// Service Header Navigation Toggle
class ServiceHeaderNavigation {
  constructor() {
    this.init();
  }

  init() {
    // Service navigation toggle
    const serviceNavToggle = document.querySelector(
      ".govuk-js-service-navigation-toggle"
    );
    const serviceNavList = document.querySelector(
      ".govuk-service-navigation__list"
    );

    if (serviceNavToggle && serviceNavList) {
      serviceNavToggle.addEventListener("click", () => {
        const isOpen = serviceNavList.classList.contains(
          "govuk-js-service-navigation--open"
        );

        if (isOpen) {
          serviceNavList.classList.remove("govuk-js-service-navigation--open");
          serviceNavToggle.setAttribute("aria-expanded", "false");
          serviceNavToggle.textContent = "Menu";
        } else {
          serviceNavList.classList.add("govuk-js-service-navigation--open");
          serviceNavToggle.setAttribute("aria-expanded", "true");
          serviceNavToggle.textContent = "Hide menu";
        }
      });
    }

    // One Login navigation toggle
    const oneLoginNavToggle = document.querySelector(
      ".cross-service-header__button"
    );
    const oneLoginNavList = document.querySelector(
      ".one-login-header__nav__list"
    );

    if (oneLoginNavToggle && oneLoginNavList) {
      oneLoginNavToggle.addEventListener("click", () => {
        const isOpen = oneLoginNavList.classList.contains(
          "one-login-header__nav--open"
        );

        if (isOpen) {
          oneLoginNavList.classList.remove("one-login-header__nav--open");
          oneLoginNavToggle.classList.remove(
            "cross-service-header__button--open"
          );
          oneLoginNavToggle.setAttribute("aria-expanded", "false");
        } else {
          oneLoginNavList.classList.add("one-login-header__nav--open");
          oneLoginNavToggle.classList.add("cross-service-header__button--open");
          oneLoginNavToggle.setAttribute("aria-expanded", "true");
        }
      });
    }
  }
}

// Initialize service header navigation
document.addEventListener("DOMContentLoaded", () => {
  new ServiceHeaderNavigation();
});
