<template>
  <div style="text-align: center">
    <h2>产品管理</h2>
    <el-button type="primary" @click="loadProducts">加载产品</el-button>
    <el-table :data="products" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="price" label="价格"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../utils/api.js';

const products = ref([]);

const loadProducts = async () => {
  try {
    const response = await api.get('/products');
    products.value = response.data;
  } catch (error) {
    alert('加载产品失败: ' + error.message);
  }
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped></style>
