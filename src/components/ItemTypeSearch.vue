<script setup lang="ts">
import { initFlowbite } from 'flowbite';
import { onMounted, ref } from 'vue';
import { debounce } from 'lodash'
import { Config } from '@/config';

interface Props {
  itemTypes?: string[]
}
const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'selection', itemType: string): void
}>();

const filteredItemTypes = ref([] as string[]);

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

const filter = debounce(async (input: string) => {
  // Clear results
  if (!input) {
    filteredItemTypes.value.splice(0);
    return;
  }

  // If item types have been passed in, use them
  if (props.itemTypes != null) {
    let lowerCaseInput = input.toLowerCase();
    filteredItemTypes.value.splice(0);
    filteredItemTypes.value.push(...props.itemTypes.filter(itemType => itemType.toLocaleLowerCase().includes(lowerCaseInput)));
    return;
  }


  // If item types haven't been passed in, get them via the API
  const params = new URLSearchParams();

  params.append("itemType", input);

  let url = `${Config.APIURL}/api/itemTypes?${params.toString()}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    return null;

  let response = await httpResponse.json();
  filteredItemTypes.value.splice(0);
  filteredItemTypes.value.push(...response.items);
}, 350);

</script>

<template>

  <button id="itemTypeSearchButton" data-dropdown-toggle="itemTypeSearch" data-dropdown-placement="bottom"
    class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
    type="button">Search <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 10 6">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
    </svg>
  </button>

  <!-- Dropdown menu -->
  <div id="itemTypeSearch" class="z-10 hidden bg-gray-700 rounded-lg shadow-sm w-60">
    <div class="p-3">
      <label for="input-group-search" class="sr-only">Search</label>
      <div class="relative">
        <div class="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
          <font-awesome-icon icon="fa-solid fa-magnifying-glass" />
        </div>
        <input type="text" id="input-group-search"
          class="block w-full p-2 ps-10 text-sm text-white border border-gray-500 rounded-lg bg-gray-600 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          placeholder="Item Type" @input="event => filter((event.target as HTMLInputElement).value)">
      </div>
    </div>
    <ul class="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-200" aria-labelledby="itemTypeSearchButton">
      <li v-for="itemType in filteredItemTypes" class="hyperlink" @click="emit('selection', itemType)">
        <div class="flex items-center px-4 py-2 ps-2 rounded-sm hover:bg-gray-600 text-gray-300 text-sm font-medium">
          {{ itemType }}
        </div>
      </li>
    </ul>
  </div>
</template>
