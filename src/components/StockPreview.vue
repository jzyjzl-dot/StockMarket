<template>
  <div class="stock-preview">
    <el-table :data="stocks" style="width: 100%">
      <el-table-column
        prop="name"
        label="股票名称"
        width="200"
        align="center"
        header-align="center"
      ></el-table-column>
      <el-table-column
        prop="symbol"
        label="代码"
        width="100"
        align="center"
        header-align="center"
      ></el-table-column>
      <el-table-column
        prop="price"
        label="价格"
        width="120"
        align="right"
        header-align="right"
      >
        <template #default="scope"> ${{ scope.row.price }} </template>
      </el-table-column>
      <el-table-column
        prop="change"
        label="变动"
        width="120"
        align="right"
        header-align="right"
      >
        <template #default="scope">
          <span
            :class="{
              positive: scope.row.change > 0,
              negative: scope.row.change < 0,
            }"
          >
            {{ scope.row.change > 0 ? '+' : '' }}{{ scope.row.change }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="changePercent"
        label="变动百分比"
        width="150"
        align="right"
        header-align="right"
      >
        <template #default="scope">
          <span
            :class="{
              positive: scope.row.changePercent > 0,
              negative: scope.row.changePercent < 0,
            }"
          >
            {{ scope.row.changePercent > 0 ? '+' : ''
            }}{{ scope.row.changePercent }}%
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120"
        align="center"
        header-align="center"
      >
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            :loading="buyingStockId === scope.row.id"
            @click="buyStock(scope.row)"
          >
            购买
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElTable, ElTableColumn, ElButton, ElMessage } from 'element-plus';
import { useOrderStore } from '@/stores/orderStore';

const stocks = ref([]);
const buyingStockId = ref(null);
const orderStore = useOrderStore();

onMounted(async () => {
  try {
    const response = await fetch('/db.json');
    const data = await response.json();
    stocks.value = data.stocks || [];
  } catch (error) {
    console.error('Failed to load stocks:', error);
  }
});

const buyStock = async (stock) => {
  try {
    buyingStockId.value = stock.id;
    const quantity = 1; // 暂时默认为1股
    await orderStore.buyStock(stock, quantity);
    ElMessage.success(`成功购买 ${stock.name} ${quantity} 股`);
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
    buyingStockId.value = null;
  }
};
</script>

<style scoped>
/* 自定义表格样式 */
:deep(.el-table) {
  background-color: #000;
  color: #fff;
}

:deep(.el-table th) {
  background-color: #111;
  color: #fff;
  border-color: #333;
}

:deep(.el-table td) {
  background-color: #000;
  color: #fff;
  border-color: #333;
}

:deep(.el-table--striped .el-table__row--striped td) {
  background-color: #000;
}

:deep(.el-table tr) {
  background-color: #000;
}

:deep(.el-table tr:hover td) {
  background-color: #222;
}

:deep(.el-table .el-table__row--striped td) {
  background-color: #111;
}

:deep(.el-table .el-table__row--striped:hover td) {
  background-color: #333;
}

.positive {
  color: #4caf50;
  font-weight: 500;
}

.negative {
  color: #f44336;
  font-weight: 500;
}

/* 确保高亮状态下的数据颜色对比度 */
:deep(.el-table tr:hover .positive) {
  color: #4caf50 !important;
}

:deep(.el-table tr:hover .negative) {
  color: #f44336 !important;
}

:deep(.el-table .el-table__row--striped .positive) {
  color: #4caf50 !important;
}

:deep(.el-table .el-table__row--striped .negative) {
  color: #f44336 !important;
}

:deep(.el-table .el-table__row--striped:hover .positive) {
  color: #4caf50 !important;
}

:deep(.el-table .el-table__row--striped:hover .negative) {
  color: #f44336 !important;
}
</style>
