// Lottie animation loader
// Using CDN version for compatibility with GOV.UK Prototype Kit

class LottieLoader {
  constructor() {
    this.animations = [];
    this.init();
  }

  init() {
    console.log("LottieLoader.init() called");
    console.log("typeof lottie:", typeof lottie);

    // Wait for Lottie to be available
    if (typeof lottie === "undefined") {
      console.log("Lottie not available, loading from CDN...");
      // Load Lottie from CDN if not already loaded
      this.loadLottieScript()
        .then(() => {
          console.log("Lottie script loaded, initializing animations...");
          this.initAnimations();
        })
        .catch((error) => {
          console.error("Failed to load Lottie script:", error);
        });
    } else {
      console.log("Lottie already available, initializing animations...");
      this.initAnimations();
    }
  }

  loadLottieScript() {
    return new Promise((resolve, reject) => {
      console.log("Loading Lottie script from CDN...");

      if (document.querySelector('script[src*="lottie"]')) {
        console.log("Lottie script already loaded");
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/lottie-web@5.12.2/dist/lottie.min.js";
      script.onload = () => {
        console.log("Lottie script loaded successfully");
        resolve();
      };
      script.onerror = (error) => {
        console.error("Failed to load Lottie script:", error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  initAnimations() {
    console.log("initAnimations() called");

    // Find all elements with data-lottie attribute
    const lottieElements = document.querySelectorAll("[data-lottie]");
    console.log("Found lottie elements:", lottieElements.length);

    lottieElements.forEach((element, index) => {
      const animationPath = element.getAttribute("data-lottie");
      const loop = element.getAttribute("data-loop") !== "false";
      const autoplay = element.getAttribute("data-autoplay") !== "false";

      console.log(`Element ${index}:`, {
        path: animationPath,
        loop: loop,
        autoplay: autoplay,
        element: element,
      });

      if (animationPath) {
        this.loadAnimation(element, animationPath, { loop, autoplay });
      }
    });
  }

  loadAnimation(element, path, options = {}) {
    try {
      console.log("Attempting to load Lottie animation from:", path);

      // Update debug info
      const debugInfo = element.querySelector("#debug-info");
      if (debugInfo) {
        debugInfo.textContent = `Debug: Loading from ${path}...`;
      }

      const animation = lottie.loadAnimation({
        container: element,
        renderer: "svg",
        loop: options.loop !== false,
        autoplay: options.autoplay !== false,
        path: path,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
        },
      });

      // Store reference to animation
      this.animations.push(animation);

      // Add event listeners
      animation.addEventListener("data_ready", () => {
        element.classList.add("lottie-loaded");
        console.log("Lottie animation loaded successfully");
        if (debugInfo) {
          debugInfo.textContent = "Debug: Animation loaded!";
          setTimeout(() => (debugInfo.style.display = "none"), 2000);
        }
      });

      animation.addEventListener("error", (error) => {
        console.error("Lottie animation error:", error);
        element.classList.add("lottie-error");
        if (debugInfo) {
          debugInfo.textContent = `Debug: Error loading animation`;
          debugInfo.style.background = "rgba(220,53,69,0.9)";
        }
      });

      return animation;
    } catch (error) {
      console.error("Error loading Lottie animation:", error);
      element.classList.add("lottie-error");
      if (debugInfo) {
        debugInfo.textContent = `Debug: Exception: ${error.message}`;
        debugInfo.style.background = "rgba(220,53,69,0.9)";
      }
    }
  }

  // Method to pause all animations
  pauseAll() {
    this.animations.forEach((animation) => {
      if (animation.isLoaded) {
        animation.pause();
      }
    });
  }

  // Method to play all animations
  playAll() {
    this.animations.forEach((animation) => {
      if (animation.isLoaded) {
        animation.play();
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Lottie loader...");
  new LottieLoader();
});

// Also try to initialize if DOM is already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing Lottie loader (DOM ready)...");
    new LottieLoader();
  });
} else {
  console.log("Initializing Lottie loader (DOM already ready)...");
  new LottieLoader();
}
