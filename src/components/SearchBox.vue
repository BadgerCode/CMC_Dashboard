<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { onMounted, useId } from "vue";

interface Props {
  placeholder: string;
  disabled?: boolean;
}
defineProps<Props>();

const model = defineModel({ default: "" });

const emit = defineEmits<{
  (e: "clear"): void;
}>();

const id = useId();

onMounted(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  clear();
});

function clear() {
  model.value = "";
  emit("clear");
}
</script>

<template>
  <div>
    <label :for="`search-${id}`" class="sr-only">Search</label>
    <div class="relative group">
      <div class="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
        <font-awesome-icon icon="fa-solid fa-magnifying-glass" class="w-5 h-5 text-gray-400" />
      </div>
      <input type="text" :id="`search-${id}`" class="textbox withicon" :placeholder="placeholder" v-model="model" :disabled="disabled" />

      <div class="absolute inset-y-0 right-0 rtl:inset-l-0 rtl:left-0 flex items-center pe-3 cursor-pointer" tabindex="0" @click="clear()">
        <font-awesome-icon icon="fa-solid fa-xmark" class="w-5 h-5 text-gray-400" />
      </div>
    </div>
  </div>
</template>
