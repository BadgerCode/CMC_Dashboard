<script setup lang="ts">
import type { Painting } from "@/api/paintings/painting";
import { initFlowbite } from "flowbite";
import { computed, onMounted, onUpdated, ref } from "vue";
import RenderPainting from "./RenderPainting.vue";
import { Config } from "@/config";
import { toNumber } from "lodash";
import DropdownFilter, { type DropdownOption } from "./DropdownFilter.vue";
import Checkbox from "./Checkbox.vue";

// Saved collections
export interface SavedCollection {
  id: string;
  title: string;
  author: string;
  numPaintings: number;
}

interface Props {
  paintings: Painting[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "collectionCreated", collection: SavedCollection): void;
  (e: "clear"): void;
}>();

// Collection info
const title = ref("");
const author = ref("");
const showModal = ref(false);
const positions = ref({} as { [paintingId: string]: string });

// Editor
const selectedPaintingId = ref("");

// Automatic ordering
const widthBlocks = ref(8);
const startAtBottom = ref(false);
const sortOptions = [
  { text: "Order of selection", value: "selection" },
  { text: "'Painting Name 1'", value: "simpleNumber" },
  { text: "'Painting Name 1/x'", value: "fractions" },
  { text: "A-Z", value: "nameAsc" },
  { text: "Z-A", value: "nameDesc" },
  { text: "Oldest first", value: "createdAtAsc" },
  { text: "Newest first", value: "createdAtDesc" },
] as DropdownOption[];
const sortOrder = ref(sortOptions[0]!.value);
const sortOrderText = computed(() => sortOptions.find((o) => o.value == sortOrder.value)?.text);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  title.value = props.paintings[0]!.title;
  author.value = props.paintings[0]!.authorName;
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

function startEditor() {
  // default automatic sorting options
  sortOrder.value = sortOptions[0]!.value;
  widthBlocks.value = 8;
  startAtBottom.value = false;
  selectedPaintingId.value = "";
  positions.value = {};

  // Automatically arrange the paintings
  arrangePaintings();

  // Show the modal
  showModal.value = true;
}

interface PaintingRow {
  paintings: Painting[];
  height: number;
  width: number;
}

const fractionNameRegex = new RegExp(/.*[^\d](\d+)\/\d+.*/);
const simpleNumberNameRegex = new RegExp(/.*[^\d](\d+)[\s.]*/);
function arrangePaintings() {
  // Order paintings
  let orderedPaintings = props.paintings.slice();
  if (sortOrder.value == "simpleNumber" || sortOrder.value == "fractions") {
    let regex = simpleNumberNameRegex;
    if (sortOrder.value == "fractions") regex = fractionNameRegex;

    orderedPaintings.sort((a, b) => {
      let aPosition = parseInt(a.title.match(regex)?.[1] ?? "");
      let bPosition = parseInt(b.title.match(regex)?.[1] ?? "");

      // TODO: Handle just aPosition or just bPosition being null/not a number
      if (Number.isNaN(aPosition) || Number.isNaN(bPosition)) return a.title.localeCompare(b.title);

      return aPosition - bPosition;
    });
  } else if (sortOrder.value == "createdAtAsc" || sortOrder.value == "createdAtDesc") {
    orderedPaintings.sort((a, b) => {
      let first = sortOrder.value == "createdAtAsc" ? a.createdAt : b.createdAt;
      let second = sortOrder.value == "createdAtAsc" ? b.createdAt : a.createdAt;

      return new Date(first).getTime() - new Date(second).getTime();
    });
  } else if (sortOrder.value == "nameAsc" || sortOrder.value == "nameDesc") {
    orderedPaintings.sort((a, b) => {
      let first = sortOrder.value == "nameAsc" ? a.title : b.title;
      let second = sortOrder.value == "nameAsc" ? b.title : a.title;

      return first.localeCompare(second);
    });
  }

  // Determine rows
  let rows = [] as PaintingRow[];
  let currentRow = { paintings: [], height: 0, width: 0 } as PaintingRow;
  rows.push(currentRow);

  for (const painting of orderedPaintings) {
    let size = painting.size.toLowerCase();
    let width = size == "large" || size == "wide" ? 2 : 1;
    let height = size == "large" || size == "tall" ? 2 : 1;

    // If the painting won't fit, start a new row
    if (currentRow.width + width > widthBlocks.value) {
      currentRow = { paintings: [], height: 0, width: 0 };
      rows.push(currentRow);
    }

    // Add the painting to the row
    currentRow.width += width;
    currentRow.paintings.push(painting);
    currentRow.height = Math.max(currentRow.height, height);
  }

  //
  // Determine positions
  if (startAtBottom.value) rows.reverse();

  let x = 0;
  let y = 0;
  for (const row of rows) {
    for (const painting of row.paintings) {
      positions.value[painting.id] = `${x},${y}`;

      let size = painting.size.toLowerCase();
      let width = size == "large" || size == "wide" ? 2 : 1;

      // Increase x position
      x += width;
    }

    // Increase y position, move to next row
    x = 0;
    y += row.height;
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
  emit("collectionCreated", { id: request.id, title: request.title, author: request.author, numPaintings: Object.keys(mappings).length });
  emit("clear");
  positions.value = {};
  showModal.value = false;
}

// Selection
function selectPainting(paintingId: string) {
  if (selectedPaintingId.value == paintingId) selectedPaintingId.value = "";
  else selectedPaintingId.value = paintingId;
}

// Swap tool
function swapPaintings(firstPaintingId: string, secondPaintingId: string) {
  // Swap
  let firstPos = positions.value[firstPaintingId]!;
  let secondPos = positions.value[secondPaintingId]!;

  positions.value[firstPaintingId] = secondPos;
  positions.value[secondPaintingId] = firstPos;

  // Reset selection
  selectedPaintingId.value = "";
}
</script>

<template>
  <div>
    <!-- Toast notification -->
    <div
      id="collection-start"
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
            <button type="button" data-dismiss-target="#collection-start" class="w-full button-secondary" @click="$emit('clear')">
              Clear
            </button>
            <button type="button" class="w-full button-primary" @click="startEditor()">Create</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor modal -->
    <div
      id="collection-editor-modal"
      v-if="showModal"
      data-modal-backdrop="static"
      tabindex="-1"
      aria-hidden="true"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 bottom-0 z-200 justify-center items-center w-full md:inset-0 h-full bg-gray-950/60">
      <div class="relative p-4 w-full h-full">
        <!-- Modal content -->
        <div class="flex flex-col h-full relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
          <!-- Modal header -->
          <div class="flex items-center justify-between border-b border-default pb-4 md:pb-5">
            <h3 class="text-lg font-medium text-heading">Collection Editor</h3>
          </div>

          <!-- Modal body -->
          <div class="space-y-4 md:space-y-6 py-4 md:py-6 flex-1 overflow-y-auto">
            <div class="flex flex-row">
              <!-- Title -->
              <div class="max-w-sm mx-auto">
                <label class="block mb-2.5 text-sm font-medium text-heading">Title</label>
                <input type="text" class="textbox w-80" placeholder="Painting title (e.g. shulker box name)" v-model="title" />
              </div>

              <!-- Author -->
              <div class="max-w-sm mx-auto">
                <label class="block mb-2.5 text-sm font-medium text-heading">Author</label>
                <input type="text" class="textbox w-80" placeholder="Painting author" v-model="author" />
              </div>
            </div>

            <div class="flex flex-row">
              <!-- Paintings -->
              <div class="flex-1 relative z-0">
                <div
                  v-for="painting in paintings"
                  class="flex absolute justify-center items-center flex-col cursor-pointer"
                  :style="getStyle(painting)"
                  @click="selectPainting(painting.id)">
                  <div class="painting relative" :class="[painting.size.toLowerCase(), { selected: selectedPaintingId == painting.id }]">
                    <RenderPainting :painting-id="painting.id"></RenderPainting>

                    <div class="overlay absolute top-0 bottom-0 left-0 right-0 flex flex-col bg-gray-950/60 justify-between text-xs">
                      <div>
                        <RouterLink :to="{ name: 'painting', params: { id: painting.id } }" class="hyperlink" target="_blank">
                          {{ painting.title }}
                        </RouterLink>
                      </div>

                      <div class="flex flex-row justify-center">
                        <button
                          v-if="selectedPaintingId && selectedPaintingId != painting.id"
                          @click="swapPaintings(selectedPaintingId, painting.id)"
                          type="button"
                          class="button-secondary mt-4">
                          Swap
                        </button>
                      </div>

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
                    <button
                      type="button"
                      class="accordion-header-button"
                      data-accordion-target="#collection-controls-auto"
                      aria-expanded="true"
                      aria-controls="collection-controls-auto">
                      <span>Automatic</span>
                      <font-awesome-icon data-accordion-icon icon="fa-solid fa-angle-up" class="w-5 h-5 rotate-180 shrink-0" />
                    </button>
                  </h2>

                  <div id="collection-controls-auto" class="accordion-body hidden" aria-labelledby="collection-controls-auto-heading">
                    <div class="text-body flex flex-col gap-4">
                      <!-- Number of columns -->
                      <div class="flex flex-col gap-2">
                        <label class="block mb-2.5 text-sm font-medium text-heading"> Total width (blocks) </label>
                        <input type="text" class="textbox w-full" placeholder="E.g. 2 large paintings is 4 blocks" v-model="widthBlocks" />
                      </div>

                      <!-- Sorting -->
                      <div class="flex flex-col gap-2">
                        <label class="block text-sm font-medium text-heading"> Sort by: {{ sortOrderText }} </label>

                        <DropdownFilter
                          :placeholder="'Sort by'"
                          :icon="'fa-solid fa-arrow-down-1-9'"
                          :options="sortOptions"
                          v-model="sortOrder"
                          :single-selection="true">
                        </DropdownFilter>

                        <Checkbox :label="'Start at bottom'" v-model="startAtBottom"></Checkbox>
                      </div>

                      <!-- Apply -->
                      <div class="flex flex-row gap-2 justify-center">
                        <button @click="arrangePaintings()" type="button" class="button-secondary mt-4">Apply</button>
                      </div>
                    </div>
                  </div>

                  <!-- Manual ordering -->
                  <h2 id="collection-controls-manual-heading">
                    <button
                      type="button"
                      class="accordion-header-button"
                      data-accordion-target="#collection-controls-manual"
                      aria-expanded="false"
                      aria-controls="collection-controls-manual">
                      <span>Manual</span>
                      <font-awesome-icon data-accordion-icon icon="fa-solid fa-angle-up" class="w-5 h-5 rotate-180 shrink-0" />
                    </button>
                  </h2>

                  <div id="collection-controls-manual" class="accordion-body hidden" aria-labelledby="collection-controls-manual-heading">
                    <div class="text-body">
                      <!-- Positions -->
                      <div class="max-h-[400px] overflow-x-scroll">
                        <div v-for="painting in paintings" class="mb-2">
                          <!-- Painting name -->
                          <label
                            :for="`painting-pos-${painting.id}`"
                            class="block mb-1 text-sm font-medium"
                            :class="{
                              'text-blue-600': selectedPaintingId == painting.id,
                              'text-heading': selectedPaintingId != painting.id,
                            }">
                            {{ painting.title }}
                          </label>

                          <!-- Position -->
                          <input
                            type="text"
                            :id="`painting-pos-${painting.id}`"
                            v-model="positions[painting.id]"
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
            <button type="button" class="button-primary" @click="saveCollection()">Save</button>
            <button @click="showModal = false" type="button" class="button-secondary">Cancel</button>
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

.painting.selected {
  border: 2px solid #00a2ff;
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
