// workfront/scripts/application-form.js

document.addEventListener("DOMContentLoaded", () => {
  /* ===============================
     PREFILL COUNTRY & JOB
  =============================== */
  const params = new URLSearchParams(window.location.search);
  const country = params.get("country") || "Not Selected";
  const job = params.get("job") || "General Application";

  const countryInput = document.getElementById("selected-country");
  const jobInput = document.getElementById("selected-job");

  if (countryInput) countryInput.value = country;
  if (jobInput) jobInput.value = job;

  /* ===============================
     PASSPORT TOGGLE
  =============================== */
  const passportNA = document.getElementById("passport-na");
  const passportUpload = document.getElementById("passport-upload");

  if (passportNA && passportUpload) {
    passportNA.addEventListener("change", () => {
      passportUpload.disabled = passportNA.checked;
      passportUpload.required = !passportNA.checked;
    });
  }

  /* ===============================
     RESUME TOGGLE
  =============================== */
  const resumeNA = document.getElementById("resume-na");
  const resumeUpload = document.getElementById("resume-upload");

  if (resumeNA && resumeUpload) {
    resumeNA.addEventListener("change", () => {
      resumeUpload.disabled = resumeNA.checked;
      resumeUpload.required = !resumeNA.checked;
    });
  }

  /* ===============================
     LANGUAGE MULTISELECT
  =============================== */
  const selectBox = document.getElementById("languageSelect");
  const display = document.getElementById("selectedLanguages");
  const hiddenInput = document.getElementById("languagesInput");

  if (selectBox && display && hiddenInput) {
    const checkboxes = selectBox.querySelectorAll('input[type="checkbox"]');

    display.addEventListener("click", () => {
      selectBox.classList.toggle("open");
    });

    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        const selected = Array.from(checkboxes)
          .filter(c => c.checked)
          .map(c => c.value);

        display.textContent = selected.length
          ? selected.join(", ")
          : "Select languages you speak";

        hiddenInput.value = selected.join(", ");
      });
    });

    document.addEventListener("click", e => {
      if (!selectBox.contains(e.target)) {
        selectBox.classList.remove("open");
      }
    });
  }

  /* ===============================
     FORM SUBMISSION (REAL CHECK)
  =============================== */
  const form = document.getElementById("application-form");

  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();

      const paymentId = localStorage.getItem("paymentId");
      if (!paymentId) {
        alert("❌ Payment required before submitting application.");
        return;
      }

      try {
        const res = await fetch(
          `https://manual-back.onrender.com/api/payhero/status/${paymentId}`
        );
        const data = await res.json();

        if (data.status !== "success") {
          alert("❌ Payment not completed. Please complete payment first.");
          return;
        }

        alert(
          "✅ Application submitted successfully!\n\n" +
          "We have received your application and payment.\n" +
          "You will receive feedback via email within 3–7 days."
        );

        // TODO: send form data to backend here if needed
        form.reset();
        localStorage.removeItem("paymentId");

      } catch (err) {
        alert("❌ Error verifying payment. Please try again.");
      }
    });
  }
});
