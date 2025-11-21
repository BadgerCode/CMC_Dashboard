<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { onMounted, ref } from "vue";
import { debounce } from "lodash";
import SearchBox from "./SearchBox.vue";
import type { DropdownOption } from "./DropdownFilter.vue";

interface Props {
  placeholder: string;
  items: DropdownOption[];
}
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "selection", item: DropdownOption | null): void;
}>();

const filterText = ref("");
const filteredItems = ref([] as DropdownOption[]);
const selection = ref(null as DropdownOption | null);

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

const filter = debounce(async () => {
  let input = filterText.value;

  // Clear results
  filteredItems.value.splice(0);

  // No results
  if (!input) return;

  // Filter items
  let lowerCaseInput = input.toLowerCase();
  filteredItems.value.splice(0);
  filteredItems.value.push(...props.items.filter((item) => item.text.toLocaleLowerCase().includes(lowerCaseInput)));
}, 350);

function makeSelection(item: DropdownOption | null) {
  // Clear results
  filteredItems.value.splice(0);

  // Let parent know
  emit("selection", item);

  // Store selection
  selection.value = item;
  filterText.value = selection.value?.text || "";
}
</script>

<template>
  <div>
    <label for="table-search" class="sr-only">Search</label>
    <div class="relative group">
      <SearchBox
        :placeholder="placeholder"
        :model-value="filterText"
        @update:model-value="
          (text) => {
            filterText = text;
            filter();
          }
        "
        @clear="makeSelection(null)"
        :disabled="selection != null">
      </SearchBox>

      <!-- Dropdown menu -->
      <div class="absolute inset-y-0 z-10 w-60 mt-[40px] hidden group-focus-within:block" v-if="filteredItems.length > 0">
        <ul class="max-h-48 p-3 overflow-y-auto text-sm text-gray-200 bg-gray-700 rounded-lg shadow-sm border border-gray-800">
          <li v-for="item in filteredItems" class="hyperlink" @click="makeSelection(item)">
            <div tabindex="0" class="flex items-center px-4 py-2 ps-2 rounded-sm hover:bg-gray-600 text-gray-300 text-sm font-medium">
              {{ item.text }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
