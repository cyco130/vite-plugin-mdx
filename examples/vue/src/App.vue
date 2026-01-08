<script setup lang="ts">
import { ref } from "vue";
import Sample from "./Sample.mdx";

const count = ref(0);
</script>

<template>
  <h1>Test</h1>
  <Sample />
  <p>
    <button type="button" @click="count++">Clicked: {{ count }}</button>
  </p>
</template>
