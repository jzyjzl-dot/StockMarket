<template>
  <el-button
    :loading="loading"
    :type="type"
    :size="size"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot />
  </el-button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'default',
  },
});

const emit = defineEmits(['click']);

const handleClick = () => {
  if (!loading) {
    emit('click');
  }
};
</script>
