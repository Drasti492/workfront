// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Form Step Toggle (for apply pages)
const step1Form = document.getElementById('step1-form');
const step2 = document.getElementById('step2');
if (step1Form) {
    step1Form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulate eligibility check (always pass for demo)
        alert('Eligibility Check Passed! Proceed to full application.');
        document.getElementById('step1').style.display = 'none';
        step2.style.display = 'block';
    });
}

// FAQ Toggle (for faqs.html)
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    });
});