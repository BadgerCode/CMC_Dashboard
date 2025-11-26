<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import { initFlowbite } from "flowbite";
import { onMounted, onUpdated, ref } from "vue";
import RenderPainting from "./RenderPainting.vue";
import { Config } from "@/config";
import { toNumber } from "lodash";

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "clear"): void;
}>();

const title = ref("");
const author = ref("");
const showModal = ref(false);

const selectedPaintingId = ref("");
const positions = ref({} as { [paintingId: string]: string });

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  title.value = props.paintings[0]!.title;
  author.value = props.paintings[0]!.authorName;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

function startEditor() {
  arrangePaintings();
  showModal.value = true;
}

function arrangePaintings() {
  // Setup positions
  let x = 0;
  let y = 0;

  let rowHeight = 1;
  for (const painting of props.paintings) {
    positions.value[painting.id] = `${x},${y}`;

    let size = painting.size.toLowerCase();
    x += size == "large" || size == "wide" ? 2 : 1;
    rowHeight = Math.max(rowHeight, size == "large" || size == "tall" ? 2 : 1);

    if (x >= 8) {
      x = 0;
      y += rowHeight;
    }
  }
}

function getStyle(painting: Painting) {
  let pos = (positions.value[painting.id] ?? "0,0").split(",");

  return {
    transform: `translate(${toNumber(pos[0]) * 96}px, ${toNumber(pos[1]) * 96}px)`,
    "transform-origin": "top left",
  };
}

async function saveCollection() {
  // Create mappings
  let firstSeenAt = new Date();
  let createdAt = new Date(0);
  let mappings = {} as { [paintingId: string]: string };
  for (const painting of props.paintings) {
    let pos = positions.value[painting.id]!.split(",");
    console.log(`${pos[0]},${pos[1]} - ${painting.title}`);

    // Use the newest painting's first seen at for the collection
    let paintingFirstSeenAt = new Date(painting.firstSeenAt);
    if (paintingFirstSeenAt < firstSeenAt) firstSeenAt = paintingFirstSeenAt;

    // Use the oldest painting's created at for the collection
    let paintingCreatedAt = new Date(painting.createdAt);
    if (paintingCreatedAt > createdAt) createdAt = paintingCreatedAt;

    mappings[painting.id] = `${pos[0]},${pos[1]}`;
  }

  // Generate request
  let request = {
    id: self.crypto.randomUUID(),
    title: title.value,
    author: author.value,
    createdAt: createdAt.toISOString(),
    firstSeenAt: firstSeenAt.toISOString(),
    paintingIdToPosition: mappings,
  };
  console.log(request);

  // Send request
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Functions-Key", Config.COLLECTIONS_KEY!);

  let httpResponse = await fetch(`${Config.APIURL}/api/paintingCollections`, {
    method: "post",
    headers: requestHeaders,
    body: JSON.stringify(request),
  });
  if (httpResponse.status !== 200) throw new Error("Failed to update painting collection");

  console.log("Saved collection");
  emit("clear");
  positions.value = {};
  showModal.value = false;
}
</script>

<template>
  <div>
    <!-- Toast notification -->
    <div id="toast-interactive"
      class="fixed z-100 bottom-5 right-5 space-y-4 p-3 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
      role="alert">
      <div class="flex">
        <div class="inline-flex items-center justify-center shrink-0 w-9 h-9 text-fg-brand bg-brand-softer rounded">
          <font-awesome-icon icon="fa-solid fa-grip-vertical" class="w-5 h-5" aria-hidden="true" />
          <span class="sr-only">Refresh icon</span>
        </div>
        <div class="ms-3 text-sm font-normal text-body">
          <span class="mb-1 text-base font-medium text-heading">Collection Editor</span>
          <div class="mb-3">{{ paintings.length }} paintings selected</div>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" data-dismiss-target="#toast-interactive" class="w-full button-secondary"
              @click="$emit('clear')">
              Clear
            </button>
            <button type="button" class="w-full button-primary" @click="startEditor()">Create</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor modal -->
    <div id="collection-editor-modal" v-if="showModal" data-modal-backdrop="static" tabindex="-1" aria-hidden="true"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-200 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-950/60">
      <div class="relative p-4 w-full max-w-7xl max-h-full">
        <!-- Modal content -->
        <div
          class="flex flex-col max-h-full relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
          <!-- Modal header -->
          <div class="flex items-center justify-between border-b border-default pb-4 md:pb-5">
            <h3 class="text-lg font-medium text-heading">Collection Editor</h3>
          </div>

          <!-- Modal body -->
          <div class="space-y-4 md:space-y-6 py-4 md:py-6 h-[600px] overflow-y-auto">
            <div class="flex flex-row">
              <!-- Title -->
              <div class="max-w-sm mx-auto">
                <label class="block mb-2.5 text-sm font-medium text-heading">Title</label>
                <input type="text" class="textbox" placeholder="Painting title (e.g. shulker box name)"
                  v-model="title" />
              </div>

              <!-- Author -->
              <div class="max-w-sm mx-auto">
                <label class="block mb-2.5 text-sm font-medium text-heading">Author</label>
                <input type="text" class="textbox" placeholder="Painting author" v-model="author" />
              </div>
            </div>

            <div class="flex flex-row">
              <!-- Paintings -->
              <div class="flex-1 relative z-0">
                <div v-for="painting in paintings" class="flex absolute justify-center items-center flex-col cursor-pointer"
                  :style="getStyle(painting)" @click="selectedPaintingId = painting.id">
                  <div class="painting relative" :class="painting.size.toLowerCase()">
                    <RenderPainting :painting-id="painting.id"></RenderPainting>

                    <div
                      class="overlay absolute top-0 bottom-0 left-0 right-0 flex flex-col bg-gray-950/60 justify-between text-xs">
                      <div>{{ painting.title }}</div>

                      <div class="text-xs">{{ painting.authorName }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SIDE BAR -->
              <div class="z-100 p-2 w-[300px]">

                <div id="collection-controls" data-accordion="collapse" class="accordion">

                  <!-- Automatic ordering -->
                  <h2 id="collection-controls-auto-heading">
                    <button type="button" class="accordion-header-button"
                      data-accordion-target="#collection-controls-auto" aria-expanded="true"
                      aria-controls="collection-controls-auto">
                      <span>Automatic</span>
                      <font-awesome-icon data-accordion-icon icon="fa-solid fa-angle-up"
                        class="w-5 h-5 rotate-180 shrink-0" />
                    </button>
                  </h2>

                  <div id="collection-controls-auto" class="accordion-body hidden"
                    aria-labelledby="collection-controls-auto-heading">
                    <div class="text-body">

                      <!-- Apply -->
                      <button @click="arrangePaintings()" type="button" class="button-secondary">
                        Apply
                      </button>
                    </div>
                  </div>

                  <!-- Manual ordering -->
                  <h2 id="collection-controls-manual-heading">
                    <button type="button" class="accordion-header-button"
                      data-accordion-target="#collection-controls-manual" aria-expanded="false"
                      aria-controls="collection-controls-manual">
                      <span>Manual</span>
                      <font-awesome-icon data-accordion-icon icon="fa-solid fa-angle-up"
                        class="w-5 h-5 rotate-180 shrink-0" />
                    </button>
                  </h2>

                  <div id="collection-controls-manual" class="accordion-body hidden"
                    aria-labelledby="collection-controls-manual-heading">
                    <div class="text-body">
                      <!-- Positions -->
                      <div class="max-h-[400px] overflow-x-scroll">
                        <div v-for="painting in paintings" class="mb-2">
                          <!-- Painting name -->
                          <label :for="`painting-pos-${painting.id}`" class="block mb-1 text-sm font-medium"
                            :class="{ 'text-blue-600': selectedPaintingId == painting.id, 'text-heading': selectedPaintingId != painting.id }">
                            {{ painting.title }}
                          </label>

                          <!-- Position -->
                          <input type="text" :id="`painting-pos-${painting.id}`" v-model="positions[painting.id]"
                            class="block px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end border-t border-default space-x-4 pt-4 md:pt-5">
            <button type="button" class="button-primary" @click="saveCollection()">
              Save
            </button>
            <button @click="showModal = false" type="button" class="button-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.painting .overlay {
  visibility: hidden;
}

.painting:hover .overlay {
  visibility: visible;
}

.painting {
  width: 192px;
  height: 192px;
}

.painting.small {
  width: 96px;
  height: 96px;
}

.painting.tall {
  width: 96px;
  height: 192px;
}

.painting.wide {
  width: 192px;
  height: 96px;
}
</style>
