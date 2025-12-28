// scripts/tracker.js - FINAL 100% WORKING VERSION

// Use delegation for bulletproof click capturing
document.addEventListener('click', function (e) {
    const link = e.target.closest('a[data-country], button[data-country]');
    if (link) {
        const country = link.getAttribute('data-country');
        const category = link.getAttribute('data-category') || 'General Application';

        if (country) {
            localStorage.setItem('selectedCountry', country);
            localStorage.setItem('selectedCategory', category);

            console.log('%cSELECTION SAVED', 'color: lime; font-weight: bold; font-size: 14px;', country, category);
        }
    }
});

// Auto-fill the form when on apply.html
document.addEventListener('DOMContentLoaded', function () {
    console.log('%cTracker ready', 'color: cyan');

    const countryField = document.getElementById('selected-country');
    const jobField = document.getElementById('selected-job');

    if (countryField && jobField) {
        const country = localStorage.getItem('selectedCountry') || 'Not Selected';
        const category = localStorage.getItem('selectedCategory') || 'General Application';

        countryField.value = country;
        jobField.value = category;

        console.log('%cFORM AUTO-FILLED', 'color: orange; font-weight: bold;', country, category);
    }
});