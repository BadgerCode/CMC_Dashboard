<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import RenderPainting from "@/components/RenderPainting.vue";
import { Config } from "@/config";
import { onMounted, ref } from "vue";

const paintings = ref([] as Painting[]);
const noMoreResults = ref(false);

onMounted(async () => {
  await loadPaintings();
});

async function loadPaintings() {
  if (noMoreResults.value) return;

  let lastItem = paintings.value.slice(-1)[0];

  let url =
    `${Config.APIURL}/api/paintings?` +
    (lastItem != null ? `before=${lastItem.firstSeenAt}&lastID=${lastItem.id}` : "");

  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve paintings");

  let response = await httpResponse.json();
  paintings.value.push(...response.items);

  noMoreResults.value = response.items.length === 0;
}

async function loadNextPage() {
  await loadPaintings();
}

function toRGBA(num: number) {
  num >>>= 0;
  var b = num & 0xff,
    g = (num & 0xff00) >>> 8,
    r = (num & 0xff0000) >>> 16,
    a = (num & 0xff000000) >>> 24;
  return [r, g, b, a];
}

function renderPainting(canvas: Element | any, painting: Painting) {
  if (canvas == null) return; // When the page is unloaded

  console.log(`Rendering painting ${painting.id}`);

  let imageSize = painting.size.toLowerCase(); // Large, Tall, Wide, Small
  // Small: 16x16, Large: 32x32, Tall: 16x32, Wide/Long: 32x16
  let width = imageSize == "large" || imageSize == "wide" ? 32 : 16;
  let height = imageSize == "large" || imageSize == "tall" ? 32 : 16;

  canvas.width = width;
  canvas.height = height;

  let ctx = canvas.getContext("2d");
  let canvasImageData = ctx.createImageData(width, height);

  let imageData = painting.data.split(",");

  for (let i = 0; i < imageData.length; i++) {
    let rgba = toRGBA(Number(imageData[i]));

    // Modify pixel data
    let index = i * 4;
    canvasImageData.data[index + 0] = rgba[0]; // R value
    canvasImageData.data[index + 1] = rgba[1]; // G value
    canvasImageData.data[index + 2] = rgba[2]; // B value
    canvasImageData.data[index + 3] = rgba[3]; // A value
  }

  ctx.putImageData(canvasImageData, 0, 0);
}
</script>

<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Recent</h1>
    <p class="text-gray-300">Paintings created by the players of the server</p>
  </div>

  <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
    <div v-for="painting in paintings" class="painting flex justify-center items-center flex-col gap-2 mb-4">
      <div class="w-full text-center pl-1">
        <div>{{ painting.title }}</div>
      </div>
      <RenderPainting :painting="painting"></RenderPainting>

      <div class="w-full text-center pl-1">
        <div class="text-sm text-gray-300">By {{ painting.authorName }}</div>
      </div>
    </div>
  </div>

  <div class="mt-8 text-center">
    <button type="button" class="button" v-on:click="loadNextPage" v-if="!noMoreResults">
      More
    </button>
    <div v-else>No more results</div>
  </div>
</template>

<style lang="css" scoped>
.painting-wrapper {
  width: 256px;
  height: 256px;
}

.painting-wrapper canvas {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
}

.painting-wrapper canvas.tall {
  width: 50%;
}

.painting-wrapper canvas.wide {
  height: 50%;
}
</style>
