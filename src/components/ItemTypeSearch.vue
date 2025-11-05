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
  <div>
    <label for="table-search" class="sr-only">Search</label>
    <div class="relative group">
      <div class="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
        <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-5 h-5 text-gray-400" />
      </div>
      <input type="text" id="table-search" class="textbox" placeholder="Search item types. E.g. Diamond"
        @input="event => filter((event.target as HTMLInputElement).value)">

      <!-- Dropdown menu -->
      <div id="itemTypeSearch" class="absolute inset-y-0 z-10 w-60 mt-[40px] hidden group-focus-within:block">

        <ul class="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-200 bg-gray-700 rounded-lg shadow-sm"
          aria-labelledby="itemTypeSearchButton">
          <li v-for="itemType in filteredItemTypes" class="hyperlink" @click="emit('selection', itemType)">
            <div tabindex="0"
              class="flex items-center px-4 py-2 ps-2 rounded-sm hover:bg-gray-600 text-gray-300 text-sm font-medium">
              {{ itemType }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
