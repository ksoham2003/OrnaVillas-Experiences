document.addEventListener('DOMContentLoaded', () => {

    // --- GSAP Entrance Animation ---
    const tl = gsap.timeline();

    tl.to(".booking-bg", {
        scale: 1,
        duration: 2,
        ease: "power2.out"
    })
        .to(".booking-header", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=1.5")
        .to(".booking-reveal-text", {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power4.out"
        }, "-=1.2")
        .to(".booking-card", {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "elastic.out(1, 0.8)"
        }, "-=0.8")
        .to(".booking-footer", {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.5");

    // --- Form Interactivity ---
    const minusBtn = document.querySelector('.minus');
    const plusBtn = document.querySelector('.plus');
    const guestInput = document.querySelector('.number-input input');

    minusBtn.addEventListener('click', () => {
        let val = parseInt(guestInput.value);
        if (val > 1) guestInput.value = val - 1;
    });

    plusBtn.addEventListener('click', () => {
        let val = parseInt(guestInput.value);
        if (val < 10) guestInput.value = val + 1;
    });

    // --- Confirm Button Flair ---
    const confirmBtn = document.querySelector('.confirm-btn');
    confirmBtn.addEventListener('click', () => {
        gsap.to(confirmBtn, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                alert("Searching for your perfect villa...");
            }
        });
    });

    // --- Back Link Transition ---
    const backBtn = document.querySelector('.back-link');
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        gsap.to(".booking-container", {
            opacity: 0,
            y: -20,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                window.location.href = "index.html";
            }
        });
    });

});
