async function fetchFearGreed() {
    try {
      const response = await fetch("https://api.alternative.me/fng/?limit=90&format=json");
      const data = await response.json();

      const today = data?.data?.[0];
      const label = document.querySelector(".fng-label");

      const emoji = today.value_classification.toLowerCase().includes("fear")
        ? "😨"
        : today.value_classification.toLowerCase().includes("greed")
        ? "😄"
        : "😐";

      label.innerHTML = `${emoji} ${today.value_classification} (${today.value})`;

      if (today.value_classification.toLowerCase().includes("fear")) {
        label.classList.add("fear");
      } else if (today.value_classification.toLowerCase().includes("greed")) {
        label.classList.add("greedy");
      } else {
        label.classList.add("neutral");
      }

      const ctx = document.getElementById("fng-chart").getContext("2d");
      const chartData = data.data.reverse();

      const labels = chartData.map(item => {
        const d = new Date(item.timestamp * 1000);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });

      const values = chartData.map(item => parseInt(item.value));

      new Chart(ctx, {
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
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
              mode: 'index',
              intersect: false
          },
          plugins: {
              legend: { display: false },
              tooltip: {
              enabled: true,
              callbacks: {
                  label: function(context) {
                  return `Fear & Greed: ${context.raw}`;
                  }
              }
              }
          },
          scales: {
              y: {
              beginAtZero: true,
              title: {
                  display: true,
                  text: 'Index Value'
              }
              },
              x: {
              display: true,
              title: {
                  display: true,
                  text: 'Date',
                  font: {
                  weight: 'bold'
                  }
              },
              ticks: {
                  autoSkip: true,
                  maxRotation: 45,
                  minRotation: 0
              }
              }
          }
          }
      });
    } catch (error) {
      console.error("Error loading Fear & Greed Index:", error);
      document.querySelector(".fng-label").textContent = "Unable to load index.";
    }
  }

  fetchFearGreed();