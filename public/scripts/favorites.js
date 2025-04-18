let modalChart = null;

async function fetchFavorites() {
  const favorites = Object.keys(localStorage)
    .filter(key => key.startsWith("fav-") && localStorage.getItem(key) === "true")
    .map(key => key.replace("fav-", ""));

  const tableBody = document.getElementById("favorites-table-body");
  if (favorites.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No favorites selected yet.</td></tr>';
    return;
  }

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${favorites.join(",")}&order=market_cap_desc&sparkline=false&price_change_percentage=1h,24h,7d,30d`);
    const data = await response.json();
    tableBody.innerHTML = "";

    data.forEach(coin => {
      const formatChange = (val) => {
        if (val === null || val === undefined) return '—';
        const cls = val >= 0 ? 'positive' : 'negative';
        return `<span class="${cls}">${val.toFixed(2)}%</span>`;
      };

      const isFavorited = localStorage.getItem(`fav-${coin.id}`) === "true";
      const starClass = isFavorited ? "fa-solid favorited" : "fa-regular";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <i class="fa-star favorite-icon ${starClass}" data-coin-id="${coin.id}"></i>
          <img class="coin-icon"
              src="${coin.image}"
              alt="${coin.name}"
              width="18"
              height="18"
              style="vertical-align:middle; margin-right:6px;"
              onerror="this.style.display='none'" />
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
        const icon = e.currentTarget;
        const coinId = icon.getAttribute("data-coin-id");
        const isFav = localStorage.getItem(`fav-${coinId}`) === "true";
        const nowFav = !isFav;
        localStorage.setItem(`fav-${coinId}`, nowFav);
        icon.classList.toggle("fa-regular", !nowFav);
        icon.classList.toggle("fa-solid", nowFav);
        icon.classList.toggle("favorited", nowFav);
      });

      row.addEventListener("click", (e) => {
        if (!e.target.classList.contains("star-button")) {
          openCoinModal(coin);
        }
      });
    });
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
}

function formatPrice(price) {
  return price >= 1
    ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 10 });
}

function formatCompact(number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2
  }).format(number);
}

function openCoinModal(coin) {
  document.getElementById("modal-title").innerHTML = `
    <img src="${coin.image}" alt="${coin.symbol}" style="height: 20px; vertical-align: middle; margin-right: 6px;">
    ${coin.name} (${coin.symbol.toUpperCase()})
  `;
  document.getElementById("modal-price").innerText = `$${formatPrice(coin.current_price)}`;
  document.getElementById("modal-change").innerHTML = `<span class="${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">${coin.price_change_percentage_24h.toFixed(2)}%</span>`;
  document.getElementById("modal-cap").innerText = `$${formatCompact(coin.market_cap)}`;
  document.getElementById("modal-volume").innerText = `$${formatCompact(coin.total_volume)}`;
  document.getElementById("coin-modal").classList.remove("hidden");
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

document.addEventListener("DOMContentLoaded", () => {
  fetchFavorites(); // runs only after DOM is ready

  const closeBtn = document.getElementById("close-modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("coin-modal").classList.add("hidden");
    });
  }
});