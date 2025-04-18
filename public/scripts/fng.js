async function fetchFearGreed() {
    try {
      const response = await fetch("https://api.alternative.me/fng/?limit=1&format=json");
      const data = await response.json();
      const today = data?.data?.[0];
      const label = document.querySelector(".fng-label");

      const emoji = today.value_classification.toLowerCase().includes("fear")
        ? "😨"
        : today.value_classification.toLowerCase().includes("greed")
        ? "😄"
        : "😐";

      label.innerHTML = `${emoji} ${today.value_classification} (${today.value})`;

      label.classList.remove("fear", "greedy", "neutral");
      if (today.value_classification.toLowerCase().includes("fear")) {
        label.classList.add("fear");
      } else if (today.value_classification.toLowerCase().includes("greed")) {
        label.classList.add("greedy");
      } else {
        label.classList.add("neutral");
      }
    } catch (error) {
      console.error("Error loading Fear & Greed Index:", error);
      document.querySelector(".fng-label").textContent = "Unable to load index.";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    fetchFearGreed();
  });