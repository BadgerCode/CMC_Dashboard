<script setup lang="ts">
import { Config } from "@/config";
import Chart, { type ChartData, type ChartOptions, type ChartType } from "chart.js/auto";
import "chartjs-adapter-date-fns";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import Loading from "../Loading.vue";
import { formatItemType } from "@/utilities/item-type-format.ts";

interface Props {
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

const labelFormats = {
  "24hours": { hour: "2-digit", minute: "2-digit" },
  week: { weekday: "short", hour: "2-digit", minute: "2-digit" },
  month: { day: "numeric", month: "short" },
  "6months": { day: "numeric", month: "short" },
  year: { day: "numeric", month: "short" },
} as Record<string, Intl.DateTimeFormatOptions>;

const rankOptions = [
  // TODO: Support other metrics
  // { value: 'quantity', label: 'Items sold',  metricKey: 'totalQuantity' },
  { value: "sales", label: "Sales", metricKey: "numSales" },
  // { value: 'spent',    label: 'Total spent', metricKey: 'totalSpent' },
];

// Evenly scatters hues around the colour wheel using the golden angle (~137.5°),
// so neighbouring items always get clearly different colours, for any count.
function generateColors(count: number) {
  const goldenAngle = 137.508;
  return Array.from({ length: count }, (_, i) => {
    const hue = (i * goldenAngle) % 360;
    const lightness = 50 + (i % 3) * 7; // 50 / 57 / 64: extra separation when there are many items
    return `hsl(${hue.toFixed(1)}, 70%, ${lightness}%)`;
  });
}

// State
const loading = ref(true);
const period = ref("week");
const metricKey = ref("numSales");
const canvas = ref(null as HTMLCanvasElement | null);
const chart = shallowRef<Chart | null>(null);

onMounted(async () => {
  await setPeriod("24hours");
});

onBeforeUnmount(() => chart.value?.destroy());

// Change period
async function setPeriod(newPeriod: string) {
  if (period.value === newPeriod) return;

  period.value = newPeriod;
  loading.value = true;
  await loadChart();
  loading.value = false;
}

// Change metric
function setMetric(newMetricKey: string) {
  if (metricKey.value === newMetricKey) return;

  metricKey.value = newMetricKey;
  render();
}

// Chart rendering

interface TopItemBucket {
  bucketStart: string;
  bucketEndExclusive: string;
  itemType: string;
  rank: number;
  numSales: number;
  totalQuantity: number;
  totalSpent: number;
}

let buckets: TopItemBucket[] = [];
let cancellationSource = new AbortController();

async function loadChart() {
  // Cancel any in flight requests
  cancellationSource.abort();
  cancellationSource = new AbortController();

  const res = await fetch(`${Config.APIURL}/api/salesstats/topitems?period=${period.value}&sellerUsername=${props.sellerUsername || ""}`, {
    signal: cancellationSource.signal,
  });
  buckets = (await res.json()).items;
  render();
}

function render() {
  // Calculate new data
  const { labels, datasets } = buildTopItemsData();
  const data = {
    labels: labels,
    datasets: datasets,
  } as ChartData;

  // Re-use existing chart
  if (chart.value) {
    chart.value.data = data;
    chart.value.update();
    return;
  }

  // Default colours
  Chart.defaults.color = "#d1d5dc";

  // Create a new chart
  chart.value = new Chart(canvas.value as HTMLCanvasElement, {
    type: "bar",
    data,
    options: {
      responsive: true,
      interaction: { mode: "nearest", intersect: true }, // hover a segment to see that item
      scales: {
        x: {
          stacked: true,
          grid: { color: "rgba(255, 255, 255, 0.15)" },
          ticks: { maxTicksLimit: 12, autoSkip: true },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: "rgba(255, 255, 255, 0.15)" },
        },
      },
      plugins: {
        legend: {
          position: "right",
          labels: {
            // Datasets are sorted by popularity, so this keeps the top 16 only
            filter: (item) => item.datasetIndex! < 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString() ?? "no data"}`,
          },
        },
      },
    } as ChartOptions,
  });
}

function buildTopItemsData() {
  const key = metricKey.value as keyof TopItemBucket;

  // Unique buckets, in order (rows arrive sorted by bucketStart, then rank)
  const bucketStarts = [...new Set(buckets.map((r) => r.bucketStart))];
  const bucketIndex = new Map(bucketStarts.map((b, i) => [b, i]));
  const labels = bucketStarts.map((b) => new Date(b).toLocaleString(undefined, labelFormats[period.value]));

  // One series per item that appears in any bucket, zero-filled elsewhere
  const items = new Map();
  for (const r of buckets) {
    if (!items.has(r.itemType)) {
      items.set(r.itemType, { data: new Array(bucketStarts.length).fill(0), total: 0 });
    }
    const entry = items.get(r.itemType);
    entry.data[bucketIndex.get(r.bucketStart)!] = r[key] as number;
    entry.total += r[key] as number;
  }

  // Most popular overall first, so the legend is ordered by popularity
  const sorted = [...items.entries()].sort((a, b) => b[1].total - a[1].total);
  const colors = generateColors(sorted.length);

  const datasets = sorted.map(([itemType, entry], i) => ({
    label: formatItemType(itemType),
    data: entry.data,
    borderColor: "rgba(0, 0, 0, 0.25)", // subtle separator between stacked segments
    borderWidth: 1,
    backgroundColor: colors[i],
  }));

  return { labels, datasets };
}
</script>

<template>
  <div>
    <canvas ref="canvas" class="max-h-[200px]"></canvas>
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
          v-for="m in rankOptions"
          :key="m.value"
          @click="setMetric(m.value)"
          :class="{ active: metricKey === m.value }"
          class="button-secondary">
          {{ m.label }}
        </button>
      </div>
    </div>
  </div>
</template>
