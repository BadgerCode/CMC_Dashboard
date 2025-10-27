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
  <div class="relative overflow-x-auto text-white flex flex-col gap-2" v-if="saleData != null">

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Overview
      </h4>

      <!-- <h5 class="mb-2 tracking-tight text-gray-400">
        <span class="mr-2" :title="saleData.type">
          <font-awesome-icon icon="fa-solid fa-shop" v-if="saleData.type == 'Shop'" />
          <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="saleData.type == 'Auction'" />
          <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
        </span>
        <span>{{ formatDate(saleData.occurredAt) }}</span>
      </h5> -->

      <div class="mb-3 font-normal text-gray-400 flex flex-col gap-2">
        <div>
          <span class="mr-2" :title="saleData.type">
            <font-awesome-icon icon="fa-solid fa-shop" v-if="saleData.type == 'Shop'" />
            <font-awesome-icon icon="fa-solid fa-gavel" v-else-if="saleData.type == 'Auction'" />
            <font-awesome-icon icon="fa-solid fa-question" v-else title="Unknown" />
          </span>
          <span>{{ formatDate(saleData.occurredAt) }}</span>
        </div>

        <div>
          {{ saleData.quantity }} {{ formatItemType(saleData.itemType) }} sold for {{ saleData.totalPrice }} diamonds.
        </div>

        <div>
          <div>Price per item: {{ saleData.totalPrice / saleData.quantity }}</div>
          <div>Items per diamond: {{ saleData.quantity / saleData.totalPrice }}</div>
        </div>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Item Attributes
      </h4>

      <div class="mb-3 font-normal text-gray-400">
        <div v-if="Object.keys(saleData.itemAttributes).length === 0">None</div>
        <div v-else v-for="attribute in saleData.itemAttributes">
          {{ attribute.key }} : {{ attribute.value }}
        </div>
      </div>
    </div>

    <div class="p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-sm" v-if="saleData.containedItems.length">
      <h4 class="mb-2 text-2xl font-bold tracking-tight text-white">
        Contents
      </h4>

      <div class="mb-3 font-normal text-gray-400">
        <table class="w-full text-left rtl:text-right text-gray-400 text-xs md:text-base">
          <thead class="text-white">
            <tr>
              <th>Slot</th>
              <th class="p-4">Item</th>
              <th class="p-4">
                <span class="hidden md:inline">Quantity</span><span class="md:hidden">#</span>
              </th>
              <th>Attributes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subItem in saleData.containedItems" class="border-t border-gray-700">
              <td class="p-4">{{ subItem.slot != null ? subItem.slot + 1 : '' }}</td>
              <td class="p-4">{{ formatItemType(subItem.itemType) }}</td>
              <td class="p-4">{{ subItem.quantity }}</td>
              <td class="p-4">
                <div v-for="attribute in subItem.itemAttributes">
                  {{ attribute.key }} : {{ attribute.value }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
