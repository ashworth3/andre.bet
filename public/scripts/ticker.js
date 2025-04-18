function renderTicker() {
  const data = window.cryptoData;
  if (!data || !Array.isArray(data)) return;

  const ticker = document.getElementById("ticker-content");
  const tickerHTML = data.slice(0, 30).map(coin => {
    const priceNumber = coin.current_price;
    const priceFormatted = priceNumber.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const change = coin.price_change_percentage_24h?.toFixed(2) ?? '0.00';
    const isPositive = change >= 0;
    const changeClass = isPositive ? 'positive' : 'negative';
    const arrow = isPositive ? '▲' : '▼';

    return `
      <span style="margin-right: 30px; color: black;">
        <img src="${coin.image}" alt="${coin.name}" style="height:16px; vertical-align:middle; margin-right:6px;">
        ${coin.name}: $${priceFormatted}
        <span class="${changeClass}" style="margin-left: 6px;">${arrow} ${Math.abs(change)}%</span>
      </span>`;
  }).join('');

  // Duplicate content for seamless looping
  ticker.innerHTML = tickerHTML + tickerHTML;
}