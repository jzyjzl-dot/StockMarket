<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    v-bind="$attrs"
  >
    <slot />
    <template #footer>
      <el-button @click="handleCancel">{{ cancelText }}</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
        :loading="loading"
      >
        {{ confirmText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '对话框',
  },
  width: {
    type: String,
    default: '500px',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmText: {
    type: String,
    default: '确定',
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>
