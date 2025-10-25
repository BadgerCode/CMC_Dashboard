<script setup lang="ts">
import { Config } from "@/config";
import { onMounted, ref } from "vue";

interface Painting {
  id: string;
  data: string;
  size: string;
}

const paintings = ref([] as Painting[]);
const pageNumber = ref(1);
const noMoreResults = ref(false);

onMounted(async () => {
  await loadPaintings();
});

async function loadPaintings() {
  if (noMoreResults.value) return;

  let httpResponse = await fetch(
    `${Config.APIURL}/api/paintings?page=${pageNumber.value}`,
    {
      method: "get",
    }
  );

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve paintings");

  let response = await httpResponse.json();
  paintings.value.push(...response.items);

  noMoreResults.value = response.items.length == 0;
}

async function loadNextPage() {
  pageNumber.value++;
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
    <h1 class="text-3xl font-bold">Paintings</h1>
    <p class="text-gray-300">Created by the players of the server</p>
  </div>

  <div class="flex flex-row flex-wrap w-full gap-4 justify-center">
    <div
      v-for="painting in paintings"
      class="painting flex justify-center items-center"
    >
      <canvas
        :class="[painting.size.toLowerCase()]"
        :ref="(el) => renderPainting(el, painting)"
      ></canvas>
    </div>
  </div>

  <div class="mt-8 text-center">
    <button
      type="button"
      class="button"
      v-on:click="loadNextPage"
      v-if="!noMoreResults"
    >
      More
    </button>
    <div v-else>No more results</div>
  </div>
</template>

<style lang="css" scoped>
.painting {
  width: 256px;
  height: 256px;
}

.painting canvas {
  image-rendering: pixelated;
  width: 100%;
  height: 100%;
}

.painting canvas.tall {
  width: 50%;
}

.painting canvas.wide {
  height: 50%;
}
</style>
