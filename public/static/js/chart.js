document.addEventListener("DOMContentLoaded", () => {
    fetch("/predict")
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById("priceChart").getContext("2d");
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
                    datasets: [{
                        label: "Bitcoin Price",
                        data: [30000, 30500, 31000, 31500, data.predicted_price],
                        borderColor: "#4B5C6B",
                        backgroundColor: "rgba(75, 92, 107, 0.2)",
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        })
        .catch(error => console.error("Error fetching prediction:", error));
});