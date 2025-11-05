<script setup lang="ts">
import { initFlowbite } from 'flowbite';
import { onMounted, useId } from 'vue';

export interface DropdownOption {
  text: string;
  value: string;
}

interface Props {
  placeholder: string;
  icon: string;
  options: DropdownOption[];
}
defineProps<Props>()

const model = defineModel({ default: [] as string[] })

const id = useId()

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

</script>

<template>
  <div>
    <button :id="`${id}Button`" :data-dropdown-toggle="id"
      class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
      type="button">
      <font-awesome-icon :icon="icon" class="w-3 h-3 text-gray-400 me-3" />
      {{ placeholder }}
      <font-awesome-icon icon="fa-solid fa-chevron-down" class="w-2.5 h-2.5 ms-2.5" />
    </button>

    <!-- Dropdown menu -->
    <div :id="id"
      class="z-10 hidden w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
      data-popper-reference-hidden="" data-popper-escaped="" data-popper-placement="top"
      style="position: absolute; inset: auto auto 0px 0px; margin: 0px; transform: translate3d(522.5px, 3847.5px, 0px);">
      <ul class="max-h-48 overflow-y-auto p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200" :aria-labelledby="`${id}Button`">
        <li v-for="option in options">
          <div class="flex items-center p-2 rounded-sm hover:bg-gray-600">
            <input :id="`${id}-${option.value}`" type="checkbox" :value="option.value" v-model="model" class="checkbox">
            <label :for="`${id}-${option.value}`"
              class="w-full ms-2 text-sm font-medium text-gray-300 rounded-sm p-2 wrap-anywhere">{{
                option.text }}</label>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>