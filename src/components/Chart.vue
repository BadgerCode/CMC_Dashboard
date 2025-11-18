<script setup lang="ts">
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import Chart from "chart.js/auto";
import { onMounted } from "vue";

interface ChartEntry {
  dateTime: Date;
  playerCounts: number[];
  index: number;
  currentTime: boolean;
}

onMounted(async () => {
  let currentDate = new Date();
  let startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  let playerCounts = (await getPlayerCounts(startDate)).sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  // Generate data points for each interval
  let intervalMs = 1 * 60 * 60 * 1000; // Every 1 hour
  let numDataPoints = (currentDate.getTime() - startDate.getTime()) / intervalMs;

  let data = [] as ChartEntry[];
  for (let i = 0; i < numDataPoints; i++) {
    data.push({
      dateTime: new Date(startDate.getTime() + i * intervalMs),
      index: i,
      playerCounts: [],
      currentTime: false,
    });
  }

  // Add a final entry for the current time
  data.push({
    dateTime: currentDate,
    index: data.length,
    playerCounts: [],
    currentTime: true,
  });

  for (const playerCount of playerCounts) {
    let targetIndex = Math.round((new Date(playerCount.dateTime).getTime() - startDate.getTime()) / intervalMs);

    if (data[targetIndex] == undefined) {
      console.log("Failed to get valid index", playerCount, targetIndex, data.length);
      continue;
    }

    data[targetIndex].playerCounts.push(playerCount.count);
  }

  new Chart(document.getElementById("chartOutput") as HTMLCanvasElement, {
    type: "line",
    data: {
      labels: data.map((row) => row.dateTime.getTime()),
      datasets: [
        {
          label: "Players",
          spanGaps: true,
          borderWidth: 1,
          pointRadius: 2,
          pointStyle: "circle",
          data: data.map((row) => {
            // Empty results for times without player counts
            if (row.playerCounts.length == 0) return NaN;

            // For the current time, show the latest value
            if (row.currentTime) return row.playerCounts[row.playerCounts.length - 1];

            // Average of values for time period
            return Math.round(row.playerCounts.reduce((partial, x) => partial + x, 0) / row.playerCounts.length);
          }),
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context) {
              let value = context[0]?.parsed.x;
              if (!value) return "";
              return formatDate(new Date(value));
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: (context) => "rgba(255, 255, 255, 0.2)",
          },
          type: "linear",
          // min: startDate.getTime(),
          max: currentDate.getTime(),
          ticks: {
            stepSize: 6 * 60 * 60 * 1000,
            callback: function (value, index, ticks) {
              return formatDate(new Date(value));
            },
          },
        },
        y: {
          suggestedMin: 0,
          suggestedMax: 30,
          grid: {
            color: (context) => "rgba(255, 255, 255, 0.2)",
          },
        },
      },
    },
  });
});

interface PlayerCount {
  dateTime: string;
  count: number;
}

async function getPlayerCounts(startDate: Date): Promise<PlayerCount[]> {
  let httpResponse = await fetch(`${Config.APIURL}/api/serverstats/playercounts?date=${startDate.toISOString()}`, { method: "get" });

  if (httpResponse.status !== 200) return [];

  let response = await httpResponse.json();
  return response.items;
}
</script>

<template>
  <div class="min-h-[400px]">
    <canvas id="chartOutput"></canvas>
  </div>
</template>
