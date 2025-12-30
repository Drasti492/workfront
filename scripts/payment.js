document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("currency-modal");
  const mainSection = document.getElementById("main-payment");
  const currencySelect = document.getElementById("currency-select");
  const convertedAmountInput = document.getElementById("converted-amount");
  const continueBtn = document.getElementById("continue-btn");
  const changeBtn = document.getElementById("change-currency-btn");
  const payBtn = document.getElementById("pay-btn");

  const phoneModal = document.getElementById("phone-modal");
  const phoneInput = document.getElementById("phone-input");
  const confirmPayBtn = document.getElementById("confirm-pay-btn");

  const loadingModal = document.getElementById("payment-loading-modal");
  const loadingTitle = document.getElementById("loading-title");
  const loadingMessage = document.getElementById("loading-message");
  const paymentResult = document.getElementById("payment-result");
  const resultIcon = document.getElementById("result-icon");
  const resultText = document.getElementById("result-text");

  const BASE_KES = 1500;
  const BACKEND_URL = "https://workback-c5j2.onrender.com/api/payments";

  const currencies = {
    KSH: { symbol: "KSh", rate: 1 },
    USD: { symbol: "$", rate: 130 },
    EUR: { symbol: "€", rate: 140 },
    GBP: { symbol: "£", rate: 165 },
    NGN: { symbol: "₦", rate: 0.08 },
    INR: { symbol: "₹", rate: 1.55 }
  };

  function updateAmount() {
    const cur = currencySelect.value;
    const info = currencies[cur];
    const amount = cur === "KSH" ? BASE_KES : (BASE_KES / info.rate).toFixed(2);
    convertedAmountInput.value = `${info.symbol} ${amount}`;
  }

  updateAmount();
  currencySelect.addEventListener("change", updateAmount);

  continueBtn.onclick = () => {
    modal.style.display = "none";
    mainSection.style.display = "block";
  };

  changeBtn.onclick = () => {
    mainSection.style.display = "none";
    modal.style.display = "flex";
  };

  payBtn.onclick = () => {
    phoneModal.style.display = "flex";
  };

  function normalizePhone(phone) {
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    return phone.length === 12 && phone.startsWith("254") ? phone : null;
  }

  confirmPayBtn.onclick = async () => {
    const phone = normalizePhone(phoneInput.value);
    if (!phone) return;

    phoneModal.style.display = "none";
    loadingModal.style.display = "flex";

    try {
      const res = await fetch(`${BACKEND_URL}/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amountKES: BASE_KES })
      });

      const data = await res.json();
      if (!res.ok || !data.paymentId) throw new Error();

      pollStatus(data.paymentId);
    } catch {
      showFailure();
    }
  };

  function pollStatus(paymentId) {
    let attempts = 0;

    const timer = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${BACKEND_URL}/status/${paymentId}`);
        const data = await res.json();

        if (data.status === "success") {
          clearInterval(timer);
          showSuccess();
        }

        if (data.status === "failed") {
          clearInterval(timer);
          showFailure();
        }

        if (attempts >= 30) {
          clearInterval(timer);
          showFailure();
        }
      } catch {
        clearInterval(timer);
        showFailure();
      }
    }, 3000);
  }

  function showSuccess() {
    loadingTitle.textContent = "Payment Successful";
    loadingMessage.textContent = "";
    paymentResult.style.display = "block";
    resultIcon.className = "fas fa-check-circle success";
    resultText.textContent = "Application submitted successfully ✔";
    payBtn.disabled = true;
    payBtn.textContent = "Application Submitted ✔";
  }

  function showFailure() {
    loadingTitle.textContent = "Payment Failed";
    loadingMessage.textContent = "";
    paymentResult.style.display = "block";
    resultIcon.className = "fas fa-times-circle error";
    resultText.textContent = "Payment was declined. Application not submitted.";
  }
});
