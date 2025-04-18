let showingAll = false;
let cryptoLimit = 10;
let requestedLimit = 10;

const formatPrice = (price) => {
  return price >= 1
    ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 10 });
};

const formatCompact = (number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2
  }).format(number);
};

async function fetchFearGreed() {
  try {
    const response = await fetch("https://api.alternative.me/fng/?limit=90&format=json");
    const data = await response.json();
    const today = data?.data?.[0];
    const label = document.querySelector(".fng-label");

    const emoji = today.value_classification.toLowerCase().includes("fear") ? "😨"
                 : today.value_classification.toLowerCase().includes("greed") ? "😄"
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

    const ctx = document.getElementById("fng-chart")?.getContext("2d");
    if (ctx) {
      if (fearChart) fearChart.destroy();
      const chartData = data.data.slice().reverse();
      const labels = chartData.map(item => {
        const d = new Date(parseInt(item.timestamp) * 1000);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      const values = chartData.map(item => parseInt(item.value));

      fearChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Fear & Greed (90d)',
            data: values,
            borderColor: '#096BDE',
            backgroundColor: 'rgba(9, 107, 222, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true }, x: { display: false } },
          responsive: true,
          maintainAspectRatio: true
        }
      });
    }
  } catch (error) {
    console.error("Error loading Fear & Greed Index:", error);
    document.querySelector(".fng-label").textContent = "😐 Unable to load index.";
  }
}

// Calculate Volatility Score
function calculateVolatilityScore(coins) {
  const changes = coins
    .map(c => Math.abs(c.price_change_percentage_24h_in_currency || 0) + Math.abs(c.price_change_percentage_7d_in_currency || 0))
    .filter(n => !isNaN(n));

  const avg = changes.reduce((a, b) => a + b, 0) / changes.length;
  const score = Math.min(Math.round(avg * 4), 100); // cap at 100

  let emoji = "🧘 😴 🛌 🪨", label = "Low Volatility";
  if (score >= 70) [emoji, label] = ["🔥 💥 🌋 🚨", "High Volatility"];
  else if (score >= 40) [emoji, label] = ["🌪️ 🌊 ⛅ 🌀", "Moderate Volatility"];

  const labelEl = document.querySelector(".volatility-label");
  if (labelEl) labelEl.innerHTML = `${emoji} ${label} (${score}/100)`;
}

// Volatility Box
// Open volatility modal when the box is clicked
document.querySelector(".volatility-box")?.addEventListener("click", () => {
  document.getElementById("volatility-modal").classList.remove("hidden");
});

// Close modal via X
document.getElementById("close-volatility-modal")?.addEventListener("click", () => {
  document.getElementById("volatility-modal").classList.add("hidden");
});

// Close modal on click-off
window.addEventListener("click", (e) => {
  const modal = document.getElementById("volatility-modal");
  if (e.target === modal) modal.classList.add("hidden");
});

// Close modal on ESC key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("volatility-modal")?.classList.add("hidden");
  }
});

async function fetchAndRenderCryptoData() {
  if (document.hidden) return;

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d"
    );
    const data = await response.json();
    window.cryptoData = data;
    renderTicker();
    calculateVolatilityScore(data);

    // 🌍 Render Top Crypto Table
    const topTable = document.getElementById("crypto-table-body");
    if (topTable) {
      topTable.innerHTML = "";
      renderCoinRows(data.slice(0, showingAll ? 50 : 10), topTable);
    }

    // ⭐ Render Favorites
    const favoriteIds = Object.keys(localStorage)
      .filter(key => key.startsWith("fav-") && localStorage.getItem(key) === "true")
      .map(key => key.replace("fav-", ""));
    const favTable = document.getElementById("favorites-table-body");
    if (favTable) {
      const favCoins = data.filter(c => favoriteIds.includes(c.id));
      favTable.innerHTML = favCoins.length
        ? ""
        : '<tr><td colspan="6">No favorites selected yet.</td></tr>';
      renderCoinRows(favCoins, favTable);
    }

    // 🚀 Gainers & Losers
    const sorted = data.filter(c => typeof c.price_change_percentage_24h_in_currency === "number");
    const gainers = [...sorted].sort((a, b) => b.price_change_percentage_24h_in_currency - a.price_change_percentage_24h_in_currency).slice(0, 5);
    const losers = [...sorted].sort((a, b) => a.price_change_percentage_24h_in_currency - b.price_change_percentage_24h_in_currency).slice(0, 5);

    const gainersList = document.getElementById("top-gainers");
    const losersList = document.getElementById("top-losers");
    if (gainersList && losersList) {
      gainersList.innerHTML = "";
      losersList.innerHTML = "";
      gainers.forEach(coin => gainersList.appendChild(createMoverListItem(coin)));
      losers.forEach(coin => losersList.appendChild(createMoverListItem(coin)));
    }

  } catch (error) {
    console.error("Error loading combined crypto data:", error);
    const tableBody = document.getElementById("crypto-table-body");
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6">⚠️ Couldn’t load data (API limit?). Please refresh in a bit.</td></tr>`;
    }
  }
}

function toggleFavorite(coinId) {
  const key = `fav-${coinId}`;
  const currentlyFavorited = localStorage.getItem(key) === "true";
  const newStatus = !currentlyFavorited;
  localStorage.setItem(key, newStatus);

  // Update all matching icons across the page
  document.querySelectorAll(`.favorite-icon[data-coin-id="${coinId}"]`).forEach(icon => {
    icon.classList.remove("fa-regular", "fa-solid", "fas", "far", "favorited");
    if (newStatus) {
      icon.classList.add("fa-solid", "favorited");
      icon.classList.add("fas");
    } else {
      icon.classList.add("fa-regular");
      icon.classList.add("far");
    }
  });

  fetchAndRenderCryptoData(); // ensures Favorites section updates too
}


function renderCoinRows(coins, tableBody) {
  const formatChange = (val) => {
    if (val === null || val === undefined) return "—";
    const cls = val >= 0 ? "positive" : "negative";
    return `<span class="${cls}">${val.toFixed(2)}%</span>`;
  };

  coins.forEach(coin => {
    const isFavorited = localStorage.getItem(`fav-${coin.id}`) === "true";
    const starIconClass = isFavorited ? "fa-solid favorited" : "fa-regular";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <i class="fa-star favorite-icon ${starIconClass}" data-coin-id="${coin.id}"></i>
        <img class="coin-icon" src="${coin.image}" alt="${coin.name}" width="18" height="18" style="vertical-align:middle; margin-right:6px;" onerror="this.style.display='none'" />
        ${coin.name} (${coin.symbol.toUpperCase()})
      </td>
      <td>$${formatPrice(coin.current_price)}</td>
      <td>${formatChange(coin.price_change_percentage_1h_in_currency)}</td>
      <td>${formatChange(coin.price_change_percentage_24h_in_currency)}</td>
      <td>${formatChange(coin.price_change_percentage_7d_in_currency)}</td>
      <td>${formatChange(coin.price_change_percentage_30d_in_currency)}</td>
    `;
    tableBody.appendChild(row);

    row.querySelector(".favorite-icon").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(coin.id);
    });    

    row.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-icon")) {
        openCoinModal(coin);
      }
    });
  });
}

function createMoverListItem(coin) {
  const li = document.createElement("li");
  li.innerHTML = `
    <img src="${coin.image}" alt="${coin.symbol}" style="height: 18px; vertical-align: middle; margin-right: 6px;">
    <strong>${coin.name}</strong> (${coin.symbol.toUpperCase()}): 
    <span class="${coin.price_change_percentage_24h_in_currency >= 0 ? 'positive' : 'negative'}">
      ${coin.price_change_percentage_24h_in_currency.toFixed(2)}%
    </span>`;
  li.style.cursor = "pointer";
  li.addEventListener("click", () => openCoinModal(coin));
  return li;
}

function openCoinModal(coin) {
  const isFavorited = localStorage.getItem(`fav-${coin.id}`) === "true";
  const starIconClass = isFavorited ? "fas" : "far";

  document.getElementById("modal-title").innerHTML = `
    <i class="fa-star favorite-icon ${starIconClass}" id="modal-fav" data-coin-id="${coin.id}" style="margin-right: 8px; cursor: pointer;"></i>
    <img src="${coin.image}" alt="${coin.symbol}" style="height: 20px; vertical-align: middle; margin-right: 6px;">
    ${coin.name} (${coin.symbol.toUpperCase()})
  `;

  document.getElementById("modal-price").innerText = `$${formatPrice(coin.current_price)}`;
  document.getElementById("modal-change").innerHTML = `<span class="${coin.price_change_percentage_24h_in_currency >= 0 ? 'positive' : 'negative'}">${coin.price_change_percentage_24h_in_currency.toFixed(2)}%</span>`;
  document.getElementById("modal-cap").innerText = `$${formatCompact(coin.market_cap)}`;
  document.getElementById("modal-volume").innerText = `$${formatCompact(coin.total_volume)}`;
  document.getElementById("coin-modal").classList.remove("hidden");

  // Star click handler for modal
  const starIcon = document.getElementById("modal-fav");
  document.getElementById("modal-fav").onclick = () => toggleFavorite(coin.id);
}

// Click-off to close modal
window.addEventListener("click", (e) => {
  const modal = document.getElementById("coin-modal");
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});

// Escape key to close modal
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("coin-modal");
    modal.classList.add("hidden");
  }
});

// Close button to close modal
const closeBtn = document.getElementById("close-modal");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    document.getElementById("coin-modal").classList.add("hidden");
  });
}


// Toggle coins button
const toggleBtn = document.getElementById("toggle-button");
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    showingAll = !showingAll;
    cryptoLimit = showingAll ? 50 : 10;
    fetchAndRenderCryptoData();
    toggleBtn.innerText = showingAll ? "Show Fewer Coins" : "View More Coins";
  });
}

// Auto-refresh every 3 minutes
let refreshInterval = setInterval(() => {
  if (!document.hidden) {
    fetchAndRenderCryptoData();
  }
}, 180000); // 3 minutes

document.addEventListener("DOMContentLoaded", () => {
  fetchFearGreed();
  fetchAndRenderCryptoData();
});
