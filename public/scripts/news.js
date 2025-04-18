const PROXY_URL = "https://andre-news-proxy.onrender.com/news";

function renderNews(articles) {
  const newsList = document.getElementById("news-list");
  newsList.innerHTML = "";

  articles.forEach(article => {
    const card = document.createElement("div");
    card.className = "news-card";

    card.innerHTML = `
      <div class="news-img-container">
        <img src="${article.IMAGE_URL}" alt="${article.TITLE}" class="news-img"/>
      </div>
      <div class="news-content">
        <h3><a href="${article.URL}" target="_blank">${article.TITLE}</a></h3>
        <p>${article.BODY.slice(0, 200)}...</p>
        <small>${new Date(article.PUBLISHED_ON * 1000).toLocaleString()} • Source: ${article.SOURCE_DATA?.NAME || "Unknown"}</small>
      </div>
    `;

    newsList.appendChild(card);
  });
}

//Fetch Latest News
async function fetchNewsIfNeeded() {
  const newsList = document.getElementById("news-list");
  newsList.innerHTML = `<p id="news-loading">Getting Latest News<span class="dots"></span></p>`;

  if (window.cachedNews && Array.isArray(window.cachedNews)) {
    renderNews(window.cachedNews);
  } else if (window.cachedNews === "error") {
    newsList.innerHTML = "<p>Unable to load news.</p>";
  } else {
    try {
      const res = await fetch(PROXY_URL);
      const result = await res.json();
      renderNews(result.Data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      newsList.innerHTML = "<p>Unable to load news.</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", fetchNewsIfNeeded);