<script setup lang="ts">
import { Config } from "@/config";
import Chart, { type ChartData, type ChartOptions } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { onMounted, ref, shallowRef } from "vue";
import Loading from "../Loading.vue";

// State
const loading = ref(true);
const period = ref("6months"); // "24hours", "week", "month", "6months", "year"
const chart = shallowRef<Chart | null>(null);

onMounted(async () => {
  await setPeriod("24hours");
});

async function setPeriod(newPeriod: string) {
  if (period.value === newPeriod) return;

  period.value = newPeriod;
  loading.value = true;
  await loadChart();
  loading.value = false;
}

// Chart rendering
// Periods
const periods = [
  { value: "24hours", label: "24 hours" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "6months", label: "6 months" },
  { value: "year", label: "Year" },
];

const labelFormats = {
  "24hours": { hour: "2-digit", minute: "2-digit" },
  week: { weekday: "short", hour: "2-digit" },
  month: { day: "numeric", month: "short" },
  "6months": { day: "numeric", month: "short" },
  year: { day: "numeric", month: "short" },
} as Record<string, Intl.DateTimeFormatOptions>;

interface PlayerCount {
  bucketStart: string;
  bucketEndExclusive: string;
  minPlayerCount?: number;
  maxPlayerCount?: number;
  avgPlayerCount?: number;
}

async function loadChart() {
  const res = await fetch(`${Config.APIURL}/api/v2/serverstats/playercounts?period=${period.value}`);
  const buckets: PlayerCount[] = (await res.json()).items;

  const labels = buckets.map((b) => new Date(b.bucketStart).toLocaleString(undefined, labelFormats[period.value]));

  const data = {
    labels,
    datasets: [
      {
        label: "Max",
        data: buckets.map((b) => b.maxPlayerCount), // null = gap in the line
        borderColor: "#e5484d",
        backgroundColor: "#e5484d",
      },
      {
        label: "Average",
        data: buckets.map((b) => b.avgPlayerCount),
        borderColor: "#3e63dd",
        backgroundColor: "#3e63dd",
      },
      {
        label: "Min",
        data: buckets.map((b) => b.minPlayerCount),
        borderColor: "#30a46c",
        backgroundColor: "#30a46c",
      },
    ],
  } as ChartData;

  // If 24hours, only show the average (the others will have the exact same values)
  if (period.value === "24hours") {
    data.datasets = data.datasets.filter((d) => d.label === "Average");
  }

  if (chart.value) {
    chart.value.data = data;
    chart.value.update();
    return;
  }

  chart.value = new Chart(document.getElementById("chartOutput") as HTMLCanvasElement, {
    type: "line",
    data,
    options: {
      responsive: true,
      interaction: { mode: "index", intersect: false }, // tooltip shows all 3 values
      spanGaps: false, // leave gaps where data is null
      elements: {
        line: { borderWidth: 2, tension: 0.2 },
        point: { radius: 0, hitRadius: 8 }, // hide dots, keep hover easy
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.15)" },
          ticks: { maxTicksLimit: 12, autoSkip: true },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.15)" },
          beginAtZero: true,
          title: { display: true, text: "Players" },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            // Show the average to 1 decimal place
            label: (ctx) =>
              `${ctx.dataset.label}: ${
                ctx.dataset.label === "Average" && ctx.parsed.y != null ? ctx.parsed.y.toFixed(1) : (ctx.parsed.y ?? "no data")
              }`,
          },
        },
      },
    } as ChartOptions,
  });
}
</script>

<template>
  <div>
    <canvas id="chartOutput"></canvas>
    <div class="flex flex-row gap-2 mt-2" id="periodButtons">
      <button
        v-for="p in periods"
        :key="p.value"
        @click="setPeriod(p.value)"
        :class="{ active: period === p.value }"
        class="button-secondary">
        {{ p.label }}
      </button>
      <Loading v-if="loading"></Loading>
    </div>
  </div>
</template>

<style scoped>
/* .period-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.period-buttons button {
  padding: 6px 14px;
  border: 1px solid #c9ced6;
  border-radius: 6px;
  background: #fff;
  color: #333;
  font: inherit;
  cursor: pointer;
}

.period-buttons button:hover {
  background: #f2f4f7;
}

.period-buttons button.active {
  background: #3e63dd;
  border-color: #3e63dd;
  color: #fff;
} */
</style>
