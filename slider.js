
class ImageSlider {
    constructor(slider) {
        this.slider = slider;
        this.track = slider.querySelector("[data-track]");
        this.prevButton = slider.querySelector("[data-prev]");
        this.nextButton = slider.querySelector("[data-next]");
        this.dotsContainer = slider.querySelector("[data-dots]");
        this.counter = slider.querySelector("[data-counter]");
        this.status = slider.querySelector("[data-status]");

        // Store the original slides.
        this.originalSlides = Array.from(this.track.children);
        this.slideCount = this.originalSlides.length;

        // Index 1 is the first real slide after adding a clone.
        this.currentIndex = 1;
        this.isAnimating = false;

        if (this.slideCount === 0) return;

        this.createClones();
        this.createDots();
        this.addEventListeners();
        this.updatePosition(false);
        this.updateUI();
    }

    // Clone the first and last slides to create an infinite loop.
    createClones() {
        const firstClone = this.originalSlides[0].cloneNode(true);
        const lastClone =
            this.originalSlides[this.slideCount - 1].cloneNode(true);

        firstClone.setAttribute("aria-hidden", "true");
        lastClone.setAttribute("aria-hidden", "true");

        this.track.prepend(lastClone);
        this.track.append(firstClone);
    }

    // Generate one clickable dot for each original slide.
    createDots() {
        this.dots = [];

        this.originalSlides.forEach((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "slider-dot";
            dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
            dot.setAttribute("aria-current", String(index === 0));

            dot.addEventListener("click", () => {
                if (this.isAnimating) return;
                this.goTo(index + 1);
            });

            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });
    }

    // Connect buttons and keyboard navigation.
    addEventListeners() {
        this.nextButton.addEventListener("click", () => {
            this.next();
        });

        this.prevButton.addEventListener("click", () => {
            this.previous();
        });

        // Detect when the sliding animation finishes.
        this.track.addEventListener("transitionend", (event) => {
            if (
                event.target !== this.track ||
                event.propertyName !== "transform"
            ) {
                return;
            }

            this.isAnimating = false;

            // If we reached a clone, jump invisibly to the real slide.
            if (this.currentIndex === 0) {
                this.currentIndex = this.slideCount;
                this.updatePosition(false);
            } else if (this.currentIndex === this.slideCount + 1) {
                this.currentIndex = 1;
                this.updatePosition(false);
            }

            this.updateUI();
        });

        // Recalculate the position when the screen is resized.
        window.addEventListener("resize", () => {
            this.updatePosition(false);
        });

        // Allow left and right arrow keys to navigate.
        this.slider.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") this.next();
            if (event.key === "ArrowLeft") this.previous();
        });
    }

    // Move to the next slide.
    next() {
        if (this.isAnimating || this.slideCount < 2) return;
        this.goTo(this.currentIndex + 1);
    }

    // Move to the previous slide.
    previous() {
        if (this.isAnimating || this.slideCount < 2) return;
        this.goTo(this.currentIndex - 1);
    }

    // Navigate to a specific slide index.
    goTo(index) {
        if (this.isAnimating || this.slideCount < 2) return;

        this.isAnimating = true;
        this.currentIndex = index;
        this.updatePosition(true);
        this.updateUI();
    }

    // Apply the horizontal track movement.
    updatePosition(animate) {
        if (!animate) {
            this.track.style.transition = "none";
        } else {
            this.track.style.transition = "";
        }

        this.track.style.transform =
            `translateX(-${this.currentIndex * 100}%)`;

        if (!animate) {
            // Apply the position immediately without animation.
            this.track.getBoundingClientRect();
            this.track.style.removeProperty("transition");
        }
    }

    // Update the active dot and slide counter.
    updateUI() {
        const realIndex =
            (this.currentIndex - 1 + this.slideCount) % this.slideCount;

        this.dots.forEach((dot, index) => {
            dot.setAttribute(
                "aria-current",
                String(index === realIndex)
            );
        });

        this.counter.textContent =
            `${String(realIndex + 1).padStart(2, "0")} / ` +
            `${String(this.slideCount).padStart(2, "0")}`;

        this.status.textContent =
            `Slide ${realIndex + 1} of ${this.slideCount}`;
    }
}

// Initialize every slider found on the page.
document.querySelectorAll("[data-slider]").forEach((slider) => {
    new ImageSlider(slider);
});
