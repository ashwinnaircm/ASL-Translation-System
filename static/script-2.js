document.addEventListener("DOMContentLoaded", function () {
    const scrollToTopBtn = document.getElementById("scrollToTop");

    // Show/hide button when scrolling
    window.addEventListener("scroll", function () {
        if (window.scrollY > 200) {
            scrollToTopBtn.style.display = "block"; // Show button
        } else {
            scrollToTopBtn.style.display = "none"; // Hide button
        }
    });

    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    console.log("JavaScript is connected!"); // Debugging log
});
