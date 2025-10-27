<script setup lang="ts">
import { Config } from "@/config";
import { formatDate } from "@/utilities/date-format";
import { formatItemType } from "@/utilities/item-type-format";
import { onMounted, ref } from "vue";

const props = defineProps({
  id: String
});

interface SoldItem {
  id: string;
  itemType: string;
  quantity: number;
  isRenamed: boolean;
  isEnchanted: boolean;
  itemAttributes: ItemAttribute[];
}

interface SaleData extends SoldItem {
  occurredAt: string;
  type: string;
  totalPrice: number;
  containedItems: ContainerItem[];
}

interface ContainerItem extends SoldItem {
  slot: number | null;
}

interface ItemAttribute {
  key: string;
  value: string;
}

let saleData = ref(null as SaleData | null);

onMounted(async () => {
  let url = `${Config.APIURL}/api/sales/${props.id}`;
  let httpResponse = await fetch(url, { method: "get" });

  if (httpResponse.status !== 200)
    throw new Error("Failed to retrieve sale data");

  let response = await httpResponse.json();
  saleData.value = response.result;
});
</script>

<template>
  <div class="mb-8">
    <h1 class="text-3xl font-bold">{{ formatItemType(saleData?.itemType) }}</h1>
  </div>

  <div class="relative overflow-x-auto text-white" v-if="saleData != null">
    <h2 class="text-2xl font-bol">Sale Information</h2>
    <div class="mb-3">
      <div>{{ formatDate(saleData.occurredAt) }}</div>
      <div>Sale Type: {{ saleData.type }}</div>
      <div>Quantity: {{ saleData.quantity }}</div>
      <div>Price: {{ saleData.totalPrice }}</div>
      <div>Renamed: {{ saleData.isRenamed }}</div>
      <div>Enchanted: {{ saleData.isEnchanted }}</div>
    </div>

    <h3 class="text-l font-bold">Attributes</h3>
    <div v-for="attribute in saleData.itemAttributes">
      {{ attribute.key }} : {{ attribute.value }}
    </div>

    <div v-if="saleData.containedItems">
      <h3 class="text-l font-bold">Contents</h3>

      <div v-for="subItem in saleData.containedItems" class="mb-5">
        <div class="mb-3">
          <div>Slot: {{ subItem.slot }}</div>
          <div>{{ formatItemType(subItem.itemType) }}</div>
          <div>Quantity: {{ subItem.quantity }}</div>
          <div>Renamed: {{ subItem.isRenamed }}</div>
          <div>Enchanted: {{ subItem.isEnchanted }}</div>
        </div>

        <h4 class="text-l font-bold">Attributes</h4>
        <div v-for="attribute in subItem.itemAttributes">
          {{ attribute.key }} : {{ attribute.value }}
        </div>
      </div>
    </div>
  </div>
</template>
