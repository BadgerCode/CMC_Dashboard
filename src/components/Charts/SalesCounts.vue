<script setup lang="ts">
import { Config } from "@/config";
import Chart, { type ChartData, type ChartOptions } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import Loading from "../Loading.vue";

interface Props {
  itemType?: string;
  sellerUsername?: string;
}
const props = defineProps<Props>();

// Periods
const periods = [
  { value: "24hours", label: "24 hours" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "6months", label: "6 months" },
  { value: "year", label: "Year" },
];

const metrics = computed(() => {
  // When there's an itemType, show numSales, totalQuantity and avgPrice
  if (props.itemType) {
    return [
      { key: "numSales", label: "Sales", color: "#3e63dd" },
      { key: "totalQuantity", label: "Items sold", color: "#30a46c" },
      { key: "avgPrice", label: "Average price", color: "#f5a623" },
    ];
  }

  return [
    { key: "numSales", label: "Sales", color: "#3e63dd" },
    { key: "totalQuantity", label: "Items sold", color: "#30a46c" },
    { key: "totalSpent", label: "Total spent", color: "#e5484d" },
  ];
});

// State
const loading = ref(true);
const period = ref("week");
const metricKey = ref("numSales");
const chart = shallowRef<Chart | null>(null);
const metric = computed(() => metrics.value.find((m) => m.key === metricKey.value));

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

let buckets: SaleCount[] = [];
let cancellationSource = new AbortController();

async function loadChart() {
  // Cancel any in flight requests
  cancellationSource.abort();
  cancellationSource = new AbortController();

  const res = await fetch(
    `${Config.APIURL}/api/salesstats?period=${period.value}&itemType=${props.itemType || ""}&sellerUsername=${props.sellerUsername || ""}`,
    {
      signal: cancellationSource.signal,
    },
  );
  buckets = (await res.json()).items;
  render();
}

function render() {
  const m = metric.value!;
  const key = m.key as keyof SaleCount;

  // Calculate new data
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

  // Calculate reasonable limit, to avoid one high value dominating the chart
  const values = buckets.map(b => b[key] as number).filter(v => v != null && v > 0).sort((a, b) => a - b);
  const p95 = values[Math.floor(values.length * 0.95)] ?? undefined;

  if (chart.value) {
    chart.value.data = data;
    chart.value.options!.scales!.y!.max = p95;
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
          max: p95,
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString() ?? "no sales"}`,
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
