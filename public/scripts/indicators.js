// indicators.js

async function updateNavIndicators(forceRefresh = false) {
    const FNG_KEY = 'fngData';
    const MCAP_KEY = 'marketCapData';
    const TTL = 5 * 60 * 1000; // 5 minutes
  
    const now = Date.now();
    const cachedFng = JSON.parse(localStorage.getItem(FNG_KEY));
    const cachedMcap = JSON.parse(localStorage.getItem(MCAP_KEY));
  
    if (!forceRefresh && cachedFng && now - cachedFng.timestamp < TTL) {
      setFng(cachedFng.value);
    } else {
      try {
        const fngRes = await fetch("https://api.alternative.me/fng/?limit=1&format=json");
        const fngData = await fngRes.json();
        const fngValue = fngData?.data?.[0]?.value || "--";
        setFng(fngValue);
        localStorage.setItem(FNG_KEY, JSON.stringify({ value: fngValue, timestamp: now }));
      } catch (err) {
        console.error("F&G error:", err);
      }
    }
  
    if (!forceRefresh && cachedMcap && now - cachedMcap.timestamp < TTL) {
      setMcap(cachedMcap.value);
    } else {
      try {
        const marketRes = await fetch("https://api.coingecko.com/api/v3/global");
        const marketData = await marketRes.json();
        const marketCap = marketData?.data?.total_market_cap?.usd;
        if (marketCap) {
          const formatted = `$${(marketCap >= 1e12)
            ? (marketCap / 1e12).toFixed(2) + "T"
            : (marketCap / 1e9).toFixed(2) + "B"}`;
          setMcap(formatted);
          localStorage.setItem(MCAP_KEY, JSON.stringify({ value: formatted, timestamp: now }));
        }
      } catch (err) {
        console.error("MCap error:", err);
      }
    }
  }
  
  function setFng(value) {
    const el = document.getElementById("nav-fng");
    el.textContent = value;
    const val = parseInt(value);
    if (!isNaN(val)) {
      el.style.color = val <= 25 ? "#e74c3c" : val <= 50 ? "#f39c12" : "#27ae60";
    }
  }
  
  function setMcap(value) {
    document.getElementById("nav-mcap").textContent = value;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    updateNavIndicators();
  });
  
  // Navigation Highlighting
  const links = document.querySelectorAll('.nav-links a');
  const current = window.location.pathname.split('/').pop();

  links.forEach(link => {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });