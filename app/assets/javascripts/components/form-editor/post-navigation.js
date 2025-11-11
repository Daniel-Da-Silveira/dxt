document.querySelectorAll(".maximise-button").forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();

    const iframeContainer = this.closest(".iframe-container");
    const iframe = iframeContainer.querySelector(".iframe-content");

    // Toggle fullscreen mode
    if (iframeContainer.classList.contains("fullscreen")) {
      iframeContainer.classList.remove("fullscreen");
      iframe.style.height = "500px"; // Reset iframe height
      button.textContent = "Maximise";
    } else {
      iframeContainer.classList.add("fullscreen");
      iframe.style.height = "calc(100vh - 50px)";
      button.textContent = "Minimise";
    }
  });
});

function updateActiveContentsList(hashOverride) {
  var hash = hashOverride || window.location.hash;
  var allLinks = document.querySelectorAll(".gem-c-contents-list__link");
  var found = false;
  // Remove all active classes first
  allLinks.forEach(function (link) {
    var li = link.closest(".gem-c-contents-list__list-item");
    if (li) li.classList.remove("gem-c-contents-list__list-item--active");
    link.classList.remove("active");
  });
  // Add active to the matching link and its parent if needed
  allLinks.forEach(function (link) {
    if (link.getAttribute("href") === hash) {
      var li = link.closest(".gem-c-contents-list__list-item");
      if (li) {
        li.classList.add("gem-c-contents-list__list-item--active");
        // If this is a sub-item, also activate the parent
        var parentNested = li.closest(".gem-c-contents-list__nested-list");
        if (parentNested) {
          var parentItem = parentNested.closest(
            ".gem-c-contents-list__list-item--parent"
          );
          if (parentItem)
            parentItem.classList.add("gem-c-contents-list__list-item--active");
        }
      }
      link.classList.add("active");
      found = true;
    }
  });
  // If no hash matches, don't highlight anything
  if (!found) {
    // Hide all nested lists
    document
      .querySelectorAll(".gem-c-contents-list__nested-list")
      .forEach(function (list) {
        list.classList.add("gem-c-contents-list__nested-list--hidden");
      });
  }
}
document.addEventListener("DOMContentLoaded", function () {
  // Set initial active state based on URL hash
  var initialHash = window.location.hash;
  if (initialHash) {
    updateActiveContentsList(initialHash);
  } else {
    updateActiveContentsList();
  }

  // Intersection Observer for dynamic section highlighting
  var sectionIds = Array.from(
    document.querySelectorAll(".gem-c-contents-list__link")
  )
    .map(function (link) {
      return link.getAttribute("href");
    })
    .filter(function (href) {
      return href && href.startsWith("#");
    });
  var sections = sectionIds
    .map(function (id) {
      return document.getElementById(id.substring(1));
    })
    .filter(Boolean);

  var lastActive = null;
  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        // Find the section closest to the top (and visible)
        var visible = entries.filter(function (entry) {
          return entry.isIntersecting;
        });
        if (visible.length) {
          // Sort by boundingClientRect.top
          visible.sort(function (a, b) {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });
          var topSection = visible[0].target;
          var hash = "#" + topSection.id;
          if (lastActive !== hash) {
            updateActiveContentsList(hash);
            lastActive = hash;
          }
        }
      },
      {
        rootMargin: "0px 0px -60% 0px", // Trigger when heading is in top 40% of viewport
        threshold: 0.1,
      }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
});
window.addEventListener("hashchange", function () {
  updateActiveContentsList();
});
