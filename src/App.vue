<script setup lang="ts"></script>

<template>
  <div>
    <div class="navbar-start">
      <RouterLink to="/" class="navbar-item">Home</RouterLink>
      <RouterLink to="/gallery" class="navbar-item">Gallery</RouterLink>
    </div>
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped></style>
