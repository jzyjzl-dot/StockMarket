<template>
  <el-table
    v-loading="loading"
    :data="data"
    :height="height"
    style="width: 100%"
    v-bind="$attrs"
  >
    <slot />
  </el-table>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  height: {
    type: [String, Number],
    default: 'auto',
  },
});
</script>

<style scoped>
.el-table {
  border-radius: 8px;
  overflow: hidden;
}
</style>
