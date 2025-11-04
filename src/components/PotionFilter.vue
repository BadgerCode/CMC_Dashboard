<script setup lang="ts">
import { initFlowbite } from 'flowbite';
import { onMounted } from 'vue';

interface Props {
  potionEffects: string[],
  itemType: string
}
defineProps<Props>()

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

</script>

<template>

  <button id="potionEffectButton" data-dropdown-toggle="potionEffectDropdown" data-dropdown-placement="bottom"
    class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-800 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
    type="button">Potion Effect <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
      fill="none" viewBox="0 0 10 6">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
    </svg>
  </button>

  <!-- Dropdown menu -->
  <div id="potionEffectDropdown" class="z-10 hidden bg-gray-700 rounded-lg shadow-sm w-150">
    <ul class="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-200" aria-labelledby="potionEffectButton">
      <li v-for="potion in potionEffects">
        <RouterLink :to="{ name: 'itemSales', params: { itemType: itemType }, query: { potionEffect: potion } }"
          class="hyperlink">
          <div class="flex items-center px-4 py-2 ps-2 rounded-sm hover:bg-gray-600 text-gray-300 text-sm font-medium">
            {{ potion }}
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>
