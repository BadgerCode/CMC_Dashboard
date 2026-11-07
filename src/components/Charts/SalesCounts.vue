<script setup lang="ts">
import { Config } from "@/config";
import Chart, { type ChartData, type ChartOptions } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import Loading from "../Loading.vue";

// TODO: Item type filter

// Periods
const periods = [
  { value: "24hours", label: "24 hours" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "6months", label: "6 months" },
  { value: "year", label: "Year" },
];

const metrics = [
  { key: "numSales", label: "Sales", color: "#3e63dd" },
  { key: "totalQuantity", label: "Items sold", color: "#30a46c" },
  { key: "totalSpent", label: "Total spent", color: "#e5484d" },
];

// State
const loading = ref(true);
const period = ref("week");
const metricKey = ref("numSales");
const chart = shallowRef<Chart | null>(null);
const metric = computed(() => metrics.find((m) => m.key === metricKey.value));

onMounted(async () => {
  await setPeriod("24hours");
});

onBeforeUnmount(() => chart.value?.destroy());

async function setPeriod(newPeriod: string) {
  if (period.value === newPeriod) return;

  period.value = newPeriod;
  loading.value = true;
  await loadChart();
  loading.value = false;
}

// TODO: Buttons for metric
function setMetric(newMetricKey: string) {
  if (metricKey.value === newMetricKey) return;

  metricKey.value = newMetricKey;
  render();
}

// Chart rendering

interface SaleCount {
  bucketStart: string;
  bucketEndExclusive: string;
  numSales: number;
  totalQuantity: number;
  totalSpent: number;
}

function formatLabel(iso: string, periodValue: string): string {
  const date = new Date(iso);
  const text = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return periodValue === "6months" || periodValue === "year" ? `Week of ${text}` : text;
}

let latestRequest = 0;
let buckets: SaleCount[] = [];

async function loadChart() {
  const res = await fetch(`${Config.APIURL}/api/salesstats?period=${period.value}`);
  buckets = (await res.json()).items;
  render();
}

function render() {
  const m = metric.value!;
  const key = m.key as keyof SaleCount;

  const data = {
    labels: buckets.map((b) => formatLabel(b.bucketStart, period.value)),
    datasets: [
      {
        label: m.label,
        data: buckets.map((b) => b[key]),
        backgroundColor: m.color,
        borderRadius: 3,
      },
    ],
  } as ChartData;

  if (chart.value) {
    chart.value.data = data;
    chart.value.update();
    return;
  }

  chart.value = new Chart(document.getElementById("chartOutput") as HTMLCanvasElement, {
    type: "bar",
    data,
    options: {
      responsive: true,
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.15)" },
          ticks: { maxTicksLimit: 12, autoSkip: true },
        },
        y: {
          grid: { color: "rgba(255, 255, 255, 0.15)" },
          beginAtZero: true,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString()}`,
          },
        },
      },
    } as ChartOptions,
  });
}
</script>

<template>
  <div>
    <canvas id="chartOutput" class="max-h-[200px]"></canvas>
    <div class="flex flex-row justify-between">
      <div class="flex flex-row flex-wrap gap-2 mt-2">
        <button
          v-for="p in periods"
          :key="p.value"
          @click="setPeriod(p.value)"
          :class="{ active: period === p.value }"
          class="button-secondary">
          {{ p.label }}
        </button>
      </div>

      <Loading v-if="loading"></Loading>

      <div class="flex flex-row flex-wrap gap-2 mt-2 justify-end">
        <button
          v-for="m in metrics"
          :key="m.key"
          @click="setMetric(m.key)"
          :class="{ active: metric?.key === m.key }"
          class="button-secondary">
          {{ m.label }}
        </button>
      </div>
    </div>
  </div>
</template>
