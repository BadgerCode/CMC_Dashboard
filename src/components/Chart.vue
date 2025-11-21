<script setup lang="ts">
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import Chart from "chart.js/auto";
import { onMounted, ref } from "vue";
import Loading from "./Loading.vue";

const loading = ref(true);

const data = ref([] as ChartEntry[]);
const currentDate = ref(new Date());

interface ChartEntry {
  dateTime: Date;
  playerCounts: number[];
  index: number;
  currentTime: boolean;
}

onMounted(async () => {
  currentDate.value = new Date();
  let startDate = new Date(currentDate.value.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

  let playerCounts = (await getPlayerCounts(startDate)).sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  // Generate data points for each interval
  let intervalMs = 1 * 60 * 60 * 1000; // Every 1 hour
  let numDataPoints = (currentDate.value.getTime() - startDate.getTime()) / intervalMs;

  for (let i = 0; i < numDataPoints; i++) {
    data.value.push({
      dateTime: new Date(startDate.getTime() + i * intervalMs),
      index: i,
      playerCounts: [],
      currentTime: false,
    });
  }

  // Add a final entry for the current time
  data.value.push({
    dateTime: currentDate.value,
    index: data.value.length,
    playerCounts: [],
    currentTime: true,
  });

  for (const playerCount of playerCounts) {
    let targetIndex = Math.round((new Date(playerCount.dateTime).getTime() - startDate.getTime()) / intervalMs);

    if (data.value[targetIndex] == undefined) {
      console.log("Failed to get valid index", playerCount, targetIndex, data.value.length);
      continue;
    }

    data.value[targetIndex].playerCounts.push(playerCount.count);
  }

  renderChart(document.getElementById("chartOutput"));
  loading.value = false;
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

function renderChart(canvas: Element | any) {
  new Chart(canvas as HTMLCanvasElement, {
    type: "line",
    data: {
      labels: data.value.map((row) => row.dateTime.getTime()),
      datasets: [
        {
          label: "Players",
          spanGaps: true,
          borderWidth: 1,
          pointRadius: 2,
          pointStyle: "circle",
          data: data.value.map((row) => {
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
          max: currentDate.value.getTime(),
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
}
</script>

<template>
  <Loading v-if="loading" :fill-space="true"></Loading>
  <div class="min-h-[400px]">
    <canvas id="chartOutput"></canvas>
  </div>
</template>
