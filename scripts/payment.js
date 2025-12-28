document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("currency-modal");
  const mainSection = document.getElementById("main-payment");
  const currencySelect = document.getElementById("currency-select");
  const convertedAmountInput = document.getElementById("converted-amount");
  const continueBtn = document.getElementById("continue-btn");
  const changeBtn = document.getElementById("change-currency-btn");
  const payBtn = document.getElementById("pay-btn");
  const finalAmount = document.getElementById("final-amount");
  const finalCurrency = document.getElementById("final-currency");
  const toast = document.getElementById("payment-toast");

  const phoneModal = document.getElementById("phone-modal");
  const phoneInput = document.getElementById("phone-input");
  const confirmPayBtn = document.getElementById("confirm-pay-btn");
  const cancelPayBtn = document.getElementById("cancel-pay-btn");

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

  function showToast(msg, success = true) {
    toast.textContent = msg;
    toast.className = `toast ${success ? "success" : "error"}`;
    toast.style.display = "block";
    setTimeout(() => (toast.style.display = "none"), 5000);
  }

  function updateAmount() {
    const cur = currencySelect.value;
    const info = currencies[cur];
    const amount =
      cur === "KSH" ? BASE_KES : (BASE_KES / info.rate).toFixed(2);
    convertedAmountInput.value = `${info.symbol} ${amount}`;
  }

  currencySelect.addEventListener("change", updateAmount);
  updateAmount();

  continueBtn.onclick = () => {
    const cur = currencySelect.value;
    const info = currencies[cur];
    const amount =
      cur === "KSH" ? BASE_KES : (BASE_KES / info.rate).toFixed(2);

    finalAmount.textContent = `${info.symbol} ${amount}`;
    finalCurrency.textContent = `(In ${cur})`;

    modal.style.display = "none";
    mainSection.style.display = "block";
  };

  changeBtn.onclick = () => {
    mainSection.style.display = "none";
    modal.style.display = "flex";
  };

  function normalizePhone(phone) {
    phone = phone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "254" + phone.slice(1);
    if (!phone.startsWith("254") || phone.length !== 12) return null;
    return phone;
  }

  payBtn.onclick = () => {
    phoneModal.style.display = "flex";
  };

  cancelPayBtn.onclick = () => {
    phoneModal.style.display = "none";
    phoneInput.value = "";
  };

  confirmPayBtn.onclick = async () => {
    const phone = normalizePhone(phoneInput.value);

    if (!phone) {
      showToast("Invalid phone number", false);
      return;
    }

    confirmPayBtn.classList.add("loading");
    confirmPayBtn.disabled = true;

    try {
      const res = await fetch(`${BACKEND_URL}/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amountKES: BASE_KES })
      });

      const data = await res.json();

      if (!res.ok || !data.paymentId) {
        throw new Error();
      }

      phoneModal.style.display = "none";
      localStorage.setItem("paymentId", data.paymentId);
      pollPaymentStatus(data.paymentId);
    } catch {
      showToast("Failed to initiate payment", false);
      resetConfirmBtn();
    }
  };

  function pollPaymentStatus(paymentId) {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${BACKEND_URL}/status/${paymentId}`);
        const data = await res.json();

        if (data.status === "success") {
          clearInterval(interval);
          showToast("Payment successful ✔", true);
          payBtn.textContent = "Payment Completed ✔";
          payBtn.disabled = true;
          return;
        }

        if (data.status === "failed") {
          clearInterval(interval);
          showToast("Payment failed", false);
          resetConfirmBtn();
          return;
        }

        if (attempts >= 25) {
          clearInterval(interval);
          showToast("Payment timed out", false);
          resetConfirmBtn();
        }
      } catch {
        clearInterval(interval);
        showToast("Error checking payment status", false);
        resetConfirmBtn();
      }
    }, 3000);
  }

  function resetConfirmBtn() {
    confirmPayBtn.classList.remove("loading");
    confirmPayBtn.disabled = false;
  }
});
