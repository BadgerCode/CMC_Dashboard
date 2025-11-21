<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { onMounted, ref } from "vue";
import { debounce } from "lodash";
import { Config } from "@/config";
import SearchBox from "./SearchBox.vue";

// TODO: Replace with SearchWithResults

interface Props {
  itemTypes?: string[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "selection", itemType: string | null): void;
}>();

const filterText = ref("");
const filteredItemTypes = ref([] as string[]);
const selection = ref(null as string | null);

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

const filter = debounce(async () => {
  let input = filterText.value;

  // Clear results
  if (!input) {
    filteredItemTypes.value.splice(0);
    return;
  }

  // If item types have been passed in, use them
  if (props.itemTypes != null) {
    let lowerCaseInput = input.toLowerCase();
    filteredItemTypes.value.splice(0);
    filteredItemTypes.value.push(...props.itemTypes.filter((itemType) => itemType.toLocaleLowerCase().includes(lowerCaseInput)));
    return;
  }

  // If item types haven't been passed in, get them via the API
  const params = new URLSearchParams();

  params.append("itemType", input);

  let url = `${Config.APIURL}/api/itemTypes?${params.toString()}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200) return null;

  let response = await httpResponse.json();
  filteredItemTypes.value.splice(0);
  filteredItemTypes.value.push(...response.items);
}, 350);

function makeSelection(item: string | null) {
  // Clear results
  filteredItemTypes.value.splice(0);

  // Let parent know
  emit("selection", item);

  // Store selection
  selection.value = item;
  filterText.value = item || "";
}
</script>

<template>
  <div>
    <label for="table-search" class="sr-only">Search</label>
    <div class="relative group">
      <SearchBox
        :placeholder="'Item types. E.g. Emerald'"
        :model-value="filterText"
        @update:model-value="
          (text) => {
            filterText = text;
            filter();
          }
        "
        @clear="() => makeSelection(null)"
        :disabled="selection != null">
      </SearchBox>

      <!-- Dropdown menu -->
      <div
        id="itemTypeSearch"
        class="absolute inset-y-0 z-10 w-60 mt-[40px] hidden group-focus-within:block"
        v-if="filteredItemTypes.length > 0 && selection == null">
        <ul
          class="max-h-48 p-3 overflow-y-auto text-sm text-gray-200 bg-gray-700 rounded-lg shadow-sm border border-gray-800"
          aria-labelledby="itemTypeSearchButton">
          <li v-for="itemType in filteredItemTypes" class="hyperlink" @click="makeSelection(itemType)">
            <div tabindex="0" class="flex items-center px-4 py-2 ps-2 rounded-sm hover:bg-gray-600 text-gray-300 text-sm font-medium">
              {{ itemType }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
