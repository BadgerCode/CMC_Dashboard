<script setup lang="ts">
import { Config } from '@/config';


interface Props {
  method: string;
}
const props = defineProps<Props>();

// Discord redirect back with the query params after the hash instead of ?
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

</script>

<template>
  <div>
    <div><a :href="Config.DISCORD_LOGIN_URL" class="button">Login</a></div>
    <div>Login - {{ props.method }}</div>
    <div>{{ accessToken }}</div>
    <div>{{ tokenType }}</div>
  </div>
</template>
