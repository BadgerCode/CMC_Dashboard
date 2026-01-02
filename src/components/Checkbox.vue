<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { onMounted, useId } from "vue";

interface Props {
  label: string;
  disabled?: boolean;
}
const props = defineProps<Props>();
const model = defineModel({ default: false });

const id = useId();

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});
</script>

<template>
  <div
    class="flex items-center px-4 border rounded-base shadow-xs bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-600 cursor-pointer">
    <input
      :id="id"
      type="checkbox"
      v-model="model"
      :disabled="disabled"
      name="bordered-checkbox"
      class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft cursor-pointer" />
    <label :for="id" class="select-none w-full py-2 ms-2 text-sm font-medium text-heading cursor-pointer">
      {{ label }}
    </label>
  </div>
</template>
