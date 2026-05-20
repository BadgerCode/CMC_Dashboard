<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { computed, onMounted, onUpdated, ref } from "vue";
import { useRoute } from "vue-router";
import { Config } from "./config";
import { serverStore, type ServerOverview } from "./store/server-state";
import * as CustomDiscsAPI from "@/api/customDiscs/api";
import * as VillagerTradesAPI from "@/api/villagerTrades/api";
import { favouritesStore } from "./store/favourites-state";
import { userStore } from "./store/user-state";
import ProfileMenu from "./components/ProfileMenu.vue";
import { itemsStore } from "./store/items-state";
import { retrieveAlchemyConversions } from "./api/alchemyConversions/api";

const route = useRoute();

const path = computed(() => {
  return route.fullPath.replace(route.hash, "");
});

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality

  // Load user data
  userStore.load();
  favouritesStore.load();

  // Get player counts
  await loadServerStats();

  // Load custom music disc pretty names
  await CustomDiscsAPI.retrieveCustomDiscs();

  // Load villager trades
  await VillagerTradesAPI.retrieveVillagerTrades();

  // Alchemy conversions
  await retrieveAlchemyConversions();
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function loadServerStats(): Promise<ServerOverview | null> {
  let httpResponse = await fetch(`${Config.APIURL}/api/serverstats`, { method: "get" });

  if (httpResponse.status !== 200) return null;

  let response = await httpResponse.json();
  let lastResponse = new Date(response.lastResponse);

  serverStore.numPlayers = response.numPlayers;
  serverStore.status = Date.now() - lastResponse.getTime() < 130000 ? "Online" : "Offline";
  serverStore.numSales = response.numSales;
  serverStore.numPaintings = response.numPaintings;
  serverStore.lastUpdated = lastResponse;
  serverStore.loaded = true;

  return serverStore;
}
</script>

<template>
  <div class="min-h-screen">
    <div class="min-h-screen flex flex-col">
      <!-- Navbar -->
      <nav class="bg-white border-gray-200 dark:bg-gray-900">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <!-- Logo and name -->
          <RouterLink :to="{ name: 'home' }" class="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="/enchanting_table.gif" class="h-8" alt="Logo" />
            <div
              class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white flex flex-col lg:flex-row lg:items-center gap-2">
              <div>SMP Online</div>
              <div>Dashboard</div>
              <div class="hint-text">(unofficial)</div>
            </div>
          </RouterLink>

          <!-- Right side mobile buttons -->
          <div class="flex flex-row gap-5 md:hidden">
            <!-- Hamburger menu  for links -->
            <button
              data-collapse-toggle="navbar-default"
              type="button"
              class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-default"
              aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>

            <ProfileMenu></ProfileMenu>
          </div>

          <!-- Links -->
          <div class="hidden w-full md:flex md:w-auto md:space-x-8" id="navbar-default">
            <ul
              class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 md:items-center">
              <li>
                <RouterLink :to="{ name: 'home' }" class="navbarLink"> Home </RouterLink>
              </li>

              <li>
                <RouterLink :to="{ name: 'shops' }" class="navbarLink"> Shops </RouterLink>
              </li>

              <li>
                <RouterLink :to="{ name: 'gallery' }" class="navbarLink"> Gallery </RouterLink>
              </li>

              <li>
                <RouterLink :to="{ name: 'waystones' }" class="navbarLink"> Waystones </RouterLink>
              </li>
            </ul>

            <!-- Profile menu button (desktop) -->
            <ProfileMenu class="hidden md:block"></ProfileMenu>
          </div>
        </div>
      </nav>

      <!-- Page header -->
      <header
        class="relative bg-gray-800 after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-0 after:border-y after:border-white/10">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-row justify-between items-center">
          <h1 class="text-3xl font-bold tracking-tight text-white">
            {{ $route.meta.title }}
          </h1>

          <div v-if="serverStore.loaded" class="text-gray-200 flex flex-col text-right">
            <div>Server {{ serverStore.status }}</div>
            <div>
              <RouterLink :to="{ name: 'playercounts' }" class="hyperlink">{{ serverStore.numPlayers }} players </RouterLink>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-grow">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-white pb-[100px]">
          <router-view :key="path" />
        </div>
      </main>

      <!-- Footer -->
      <footer
        class="relative bg-gray-800 after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-0 after:border-y after:border-white/10">
        <div class="text-center mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-gray-300">
          <div class="">Created by BadgerCode 🦡</div>
          <div class="text-gray-400 text-xs mt-2">
            <span>Server Info: </span>
            <a href="https://callmecarson.live" class="hyperlink" target="_blank">https://callmecarson.live</a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
