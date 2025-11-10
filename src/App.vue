<script setup lang="ts">
import { initFlowbite } from "flowbite";
import { computed, onMounted, onUpdated, ref } from "vue";
import { useRoute } from "vue-router";
import { Config } from "./config";

interface ServerStats {
  numPlayers: number;
  lastResponse: Date;
  status: string;
}

const route = useRoute();

const path = computed(() => {
  return route.fullPath.replace(route.hash, "");
});

const stats = ref(null as ServerStats | null);

onMounted(async () => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
  stats.value = await loadServerStats();
});

onUpdated(() => {
  initFlowbite(); // Include on any component where you need flowbite JS functionality
});

async function loadServerStats(): Promise<ServerStats | null> {
  let httpResponse = await fetch(`${Config.APIURL}/api/serverstats`, { method: "get" });

  if (httpResponse.status !== 200) return null;

  let response = await httpResponse.json();
  let lastResponse = new Date(response.lastResponse);

  return {
    numPlayers: response.numPlayers,
    lastResponse: lastResponse,
    status: Date.now() - lastResponse.getTime() < 130000 ? "Online" : "Offline",
  } as ServerStats;
}
</script>

<template>
  <div>
    <div class="min-h-full">
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
              <div class="text-gray-500 text-sm">(unofficial)</div>
            </div>
          </RouterLink>

          <!-- Hamburger menu -->
          <div>
            <button
              data-collapse-toggle="navbar-default"
              type="button"
              class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-default"
              aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>

          <!-- Links -->
          <div class="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul
              class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
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

          <div v-if="stats != null" class="text-gray-200 flex flex-col text-right">
            <div>Server {{ stats.status }}</div>
            <div>{{ stats.numPlayers }} players</div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main>
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-white pb-[100px]">
          <router-view :key="path" />
        </div>
      </main>

      <!-- Footer -->
      <footer
        class="relative bg-gray-800 after:pointer-events-none after:absolute after:inset-x-0 after:inset-y-0 after:border-y after:border-white/10">
        <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-gray-300 text-center">Created by BadgerCode 🦡</div>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
