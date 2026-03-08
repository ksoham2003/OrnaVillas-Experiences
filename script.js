document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lenis
    const lenis = new Lenis({
        smooth: true,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Stop lenis initially to prevent scrolling during intro
    lenis.stop();

    // We register the timeline for GSAP
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { ease: "power4.inOut" } });

    gsap.set(".image-wrapper", { width: "35vw", height: "45vh" });
    gsap.set(".ui-layer", { opacity: 0 });
    gsap.set(".overlay", { opacity: 0 });
    gsap.set("#main-header", { opacity: 0 });
    gsap.set(".slider-section", { display: "none" }); // Hide second section entirely to enforce no scroll and height calculations early

    // --- First Section Hero Animation ---

    // 1. Image wrapper expands to fill screen
    tl.to(".image-wrapper", {
        width: "100%",
        height: "100%",
        duration: 2,
        delay: 1.5 // Initial wait so user sees the starting layout
    })
        // 2. The hero image scale down gracefully during the expansion (parallax effect)
        .to(".hero-image", {
            scale: 1,
            duration: 2
        }, "-=2")
        // 3. Dark overlay fades in for text readability
        .to(".overlay", {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1.2")
        // 4. Fade in the main UI layer container
        .to(".ui-layer", {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
                document.querySelector(".ui-layer").style.pointerEvents = "auto";

                // Show the next section now
                gsap.set(".slider-section", { display: "flex", clearProps: "display" });

                // Initialize the ScrollTrigger timelines NOW that the sections have 
                // proper height and display block
                initRadialWipeScroll();
                initGridRevealScroll();

                // Recalculate ScrollTrigger positions since height just changed
                ScrollTrigger.refresh();

                // Important: Allow user to scroll once hero animation is complete!
                lenis.start();
            }
        }, "-=1")
        // Fade in absolute fixed navbar
        .to("#main-header", {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
                document.querySelector("#main-header").style.pointerEvents = "auto";
            }
        }, "-=1")
        // 5. Staggered reveal of header elements
        .from("#main-header > *, .header-line", {
            y: -20,
            opacity: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power3.out"
        }, "-=1")
        // 6. Slowly float the huge text up slightly for dynamic polished feel
        // .to(".main-title-left, .main-title-right", {
        //     y: "-53%", // Original CSS translateY(-50%)
        //     duration: 2.5,
        //     ease: "power2.out"
        // }, "-=2")
        .to(".main-title-left", {
            y: "-53%", // Float up slightly from -50%
            duration: 2.5,
            ease: "power2.out"
        }, "-=2")
        .to(".main-title-right", {
            y: "47%", // Float down slightly from -50%
            duration: 2.5,
            ease: "power2.out"
        }, "-=2.5")
        // 7. Reveal bottom content
        .from(".content-left > *", {
            y: 30,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out"
        }, "-=1.5")
        .from(".location-widget", {
            x: 30,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        }, "-=1.2")
        // 8. Finally reveal the book button
        .from(".book-btn", {
            x: 30,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
            clearProps: "all" // Clears GSAP inline styles to allow CSS hover effects
        }, "-=1");


    // --- Second Section: Radial Wipe Slider ---

    // Elements
    const numItems = document.querySelectorAll(".nav-num");
    const textItems = document.querySelectorAll(".slide-text");
    const coordItems = document.querySelectorAll(".coord-item");
    const img1 = document.getElementById("img-1");
    const img2 = document.getElementById("img-2");
    const img3 = document.getElementById("img-3");

    // --- Character Splitting Helper (Vanilla alternative to SplitText) ---
    function splitTextToChars(element) {
        const text = element.textContent;
        element.innerHTML = "";
        text.split("").forEach(char => {
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = char === " " ? "\u00A0" : char;
            element.appendChild(span);
        });
        return element.querySelectorAll(".char");
    }

    // Grab all lines and split them
    const h2Lines = document.querySelectorAll(".slide-text h2");
    const pLines = document.querySelectorAll(".slide-text p");

    h2Lines.forEach(line => splitTextToChars(line));
    pLines.forEach(line => splitTextToChars(line));

    // Initialize first active state
    // Update active logic
    function updateActive(index) {
        numItems.forEach((el, i) => {
            if (i === index) el.classList.add("active");
            else el.classList.remove("active");
        });

        textItems.forEach((el, i) => {
            const chars = el.querySelectorAll(".char");
            if (i === index) {
                if (!el.classList.contains("active")) {
                    el.classList.add("active");
                    gsap.killTweensOf([el, chars]);

                    // Instant visibility + Bring to front
                    gsap.set(el, { visibility: "visible", opacity: 1, zIndex: 10 });

                    const depth = -window.innerWidth / 8;
                    gsap.fromTo(chars,
                        { rotationX: -90, opacity: 0 },
                        {
                            rotationX: 0,
                            opacity: 1,
                            stagger: 0.012,
                            duration: 0.6,
                            ease: "power2.out",
                            transformOrigin: `50% 50% ${depth}`
                        }
                    );
                }
            } else {
                if (el.classList.contains("active")) {
                    el.classList.remove("active");
                    gsap.killTweensOf([el, chars]);

                    // Keep visible while animating out + Send to back
                    gsap.set(el, { visibility: "visible", opacity: 1, zIndex: 1 });

                    const depth = -window.innerWidth / 8;
                    gsap.to(chars, {
                        rotationX: 90,
                        opacity: 0,
                        stagger: 0.005,
                        duration: 0.4,
                        ease: "power2.in",
                        transformOrigin: `50% 50% ${depth}`,
                        onComplete: () => {
                            if (!el.classList.contains("active")) {
                                gsap.set(el, { visibility: "hidden", opacity: 0 });
                            }
                        }
                    });
                }
            }
        });

        coordItems.forEach((el, i) => {
            if (i === index) el.classList.add("active");
            else el.classList.remove("active");
        });
    }

    function initRadialWipeScroll() {
        // --- Color Inversion ScrollTrigger ---
        ScrollTrigger.create({
            trigger: ".slider-section",
            start: "top 5%", // Triggers when the white section hits top 5% of viewport
            end: "bottom top",
            onEnter: () => {
                document.getElementById("main-header").classList.add("scrolled");
                gsap.to(".header-stats-wrapper", { opacity: 0, visibility: "hidden", y: -10, duration: 0.3 });
            },
            onLeaveBack: () => {
                document.getElementById("main-header").classList.remove("scrolled");
                gsap.to(".header-stats-wrapper", { opacity: 0.8, visibility: "visible", y: 0, duration: 0.3 });
            }
        });

        // Set initial active state before any scroll
        updateActive(0);

        // Proxy object for animating CSS variables smoothly
        const arcProxy = { val1: 0, val2: 0, val3: 0 };

        const sliderTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".slider-section",
                pin: true,
                scrub: 1, // Smooth scrubbing
                start: "top top",
                end: "+=3000", // Length of the pin/scroll sequence
                onUpdate: (self) => {
                    let p = self.progress;
                    // Switch active text based on overall progress of the timeline
                    if (p < 0.33) {
                        updateActive(0);
                    } else if (p >= 0.33 && p < 0.66) {
                        updateActive(1);
                    } else {
                        updateActive(2);
                    }
                }
            }
        });

        // 1st transition: Wipe empty circle to Image 1
        sliderTl.to(".sweep-line-container", { rotation: 360, ease: "none", duration: 1 }, 0)
            .to(arcProxy, {
                val1: 360,
                ease: "none",
                duration: 1,
                onUpdate: () => {
                    let val = arcProxy.val1;
                    img1.style.maskImage = `conic-gradient(#000 ${val}deg, transparent 0deg)`;
                    img1.style.webkitMaskImage = `conic-gradient(#000 ${val}deg, transparent 0deg)`;
                }
            }, 0)

            // Tiny pause in the timeline (just an empty dummy tween)
            .to({}, { duration: 0.2 })

            // 2nd transition: Wipe Image 1 to Image 2
            .to(".sweep-line-container", { rotation: 720, ease: "none", duration: 1 }, 1.2)
            .to(arcProxy, {
                val2: 360,
                ease: "none",
                duration: 1,
                onUpdate: () => {
                    let val = arcProxy.val2;
                    img2.style.maskImage = `conic-gradient(#000 ${val}deg, transparent 0deg)`;
                    img2.style.webkitMaskImage = `conic-gradient(#000 ${val}deg, transparent 0deg)`;
                }
            }, 1.2)

            .to({}, { duration: 0.2 })

            // 3rd transition: Wipe Image 2 to Image 3
            .to(".sweep-line-container", { rotation: 1080, ease: "none", duration: 1 }, 2.4)
            .to(arcProxy, {
                val3: 360,
                ease: "none",
                duration: 1,
                onUpdate: () => {
                    let val = arcProxy.val3;
                    img3.style.maskImage = `conic-gradient(#000 ${val}deg, transparent 0deg)`;
                    img3.style.webkitMaskImage = `conic-gradient(#000 ${val}deg, transparent 0deg)`;
                }
            }, 2.4);
    }

    // --- Third Section: Grid Reveal ---
    function initGridRevealScroll() {
        const gridTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".grid-section",
                start: "top 80%", // Start animating when the section is entering the bottom of viewport
                end: "center 40%", // End animation when the center of the section hits 40% of viewport
                scrub: 1 // Link animation to scroll progress with a 1-second smoothing delay
                // toggleActions removed because we are scrubbing now
            }
        });

        // 1. Draw horizontal lines from left to right
        gridTl.to(".h-line", {
            width: "100%",
            duration: 1.2,
            stagger: 0.1,
            ease: "power3.inOut"
        }, 0)
            // 2. Draw vertical lines from top to bottom
            .to(".v-line", {
                height: "100%",
                duration: 1.2,
                stagger: 0.1,
                ease: "power3.inOut"
            }, 0.2)
            // 3. Subtle zoom on background
            .to(".grid-bg", {
                scale: 1,
                duration: 2.5,
                ease: "power1.out"
            }, 0)
            // 4. Reveal content within cells
            .to(".grid-item > *", {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power2.out"
            }, 0.8);
    }

    // --- Custom Cursor Logic ---
    const cursor = document.getElementById('custom-cursor');
    const hoverableItems = document.querySelectorAll('.grid-item.hoverable');

    // Initialize cursor offset and scale
    gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });

    // Move cursor with mouse
    window.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
    });

    // Handle hover states
    hoverableItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
            cursor.classList.add('active');
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 0, duration: 0.2, ease: "power2.in" });
            cursor.classList.remove('active');
            cursor.classList.remove('solid');
        });

        // Interactive text inside the grid item
        const textElements = item.querySelectorAll('p, span');
        textElements.forEach(textEl => {
            textEl.addEventListener('mouseenter', () => cursor.classList.add('solid'));
            textEl.addEventListener('mouseleave', () => cursor.classList.remove('solid'));
        });
    });

    // --- Magnetic Effect for Buttons & Icons ---
    function initMagneticButtons() {
        // Targets primary buttons, header icons, logo, and nav items
        const magneticElements = document.querySelectorAll('.book-btn, .icon-circle, .logo-center, .nav-item');

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(el, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // --- Smooth Navigation Scrolling ---
    function initNavigation() {
        const navLinks = document.querySelectorAll('.nav-item');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');

                // Use Lenis scroll method for premium feel
                lenis.scrollTo(targetId, {
                    offset: 0,
                    duration: 1.8,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            });
        });
    }

    // --- Booking Redirection Logic ---
    function initBooking() {
        const bookBtns = document.querySelectorAll('.book-btn');

        bookBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Cinematic exit animation
                gsap.to("body", {
                    opacity: 0,
                    y: -20,
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => {
                        window.location.href = "booking.html";
                    }
                });
            });
        });
    }

    // Launch all interactive components
    initMagneticButtons();
    initNavigation();
    initBooking();

});
