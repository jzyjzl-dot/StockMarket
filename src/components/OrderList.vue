<template>
  <div class="order-list">
    <div class="total-investment">
      总投资金额: ${{ totalInvestment.toFixed(2) }}
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchText"
        placeholder="搜索股票名称或代码"
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 表格容器 -->
    <div class="table-container">
      <el-table
        v-if="paginatedOrders.length > 0"
        :data="paginatedOrders"
        style="width: 100%"
        height="300px"
      >
        <el-table-column
          prop="stockName"
          label="股票名称"
          width="200"
          align="center"
          header-align="center"
        ></el-table-column>
        <el-table-column
          prop="stockSymbol"
          label="股票代码"
          width="120"
          align="center"
          header-align="center"
        ></el-table-column>
        <el-table-column
          prop="price"
          label="购买价格"
          width="120"
          align="right"
          header-align="right"
        >
          <template #default="scope">${{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column
          prop="quantity"
          label="数量"
          width="100"
          align="center"
          header-align="center"
        ></el-table-column>
        <el-table-column
          prop="total"
          label="总金额"
          width="120"
          align="right"
          header-align="right"
        >
          <template #default="scope">${{ scope.row.total }}</template>
        </el-table-column>
        <el-table-column
          prop="date"
          label="购买时间"
          width="180"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            {{ new Date(scope.row.date).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
          header-align="center"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'completed' ? 'success' : 'warning'"
            >
              {{ scope.row.status === 'completed' ? '已完成' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 - 固定在底部 -->
    <div v-if="filteredOrders.length > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="filteredOrders.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <div
      v-if="filteredOrders.length === 0 && orders.length > 0"
      class="no-results"
    >
      没有找到匹配的订单记录
    </div>
    <div v-if="orders.length === 0" class="no-orders">暂无订单记录</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  ElTable,
  ElTableColumn,
  ElTag,
  ElInput,
  ElPagination,
} from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { useOrderStore } from '@/stores/orderStore';

const orderStore = useOrderStore();
const orders = computed(() => orderStore.orders);
const totalInvestment = computed(() => orderStore.totalInvestment);

// 搜索相关
const searchText = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 过滤后的订单
const filteredOrders = computed(() => {
  if (!searchText.value) {
    return orders.value;
  }

  const search = searchText.value.toLowerCase();
  return orders.value.filter(
    (order) =>
      order.stockName.toLowerCase().includes(search) ||
      order.stockSymbol.toLowerCase().includes(search)
  );
});

// 分页后的订单
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredOrders.value.slice(start, end);
});

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置到第一页
};

// 分页处理
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
};

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
};
</script>

<style scoped>
.order-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.total-investment {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: bold;
  color: #4caf50;
  flex-shrink: 0;
}

.search-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
}

.table-container {
  /* flex: 1; */
  min-height: 0;
  margin-bottom: 16px;
}

.pagination-container {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  margin-top: 1px;
  padding-top: 1px;
  border-top: 1px solid #333;
}

.no-orders,
.no-results {
  text-align: center;
  color: #666;
  padding: 40px;
  font-size: 16px;
  flex-shrink: 0;
}

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

:deep(.el-input) {
  --el-input-bg-color: #000;
  --el-input-border-color: #333;
  --el-input-text-color: #fff;
}

:deep(.el-input__inner) {
  background-color: #000;
  border-color: #333;
  color: #fff;
}

:deep(.el-input__inner:focus) {
  border-color: #409eff;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: #000;
  --el-pagination-text-color: #fff;
  --el-pagination-border-color: #333;
}

:deep(.el-pagination .el-pager li) {
  background-color: #000;
  border-color: #333;
  color: #fff;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #409eff;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: #409eff;
  color: #fff;
}

:deep(.el-pagination .btn-prev, .el-pagination .btn-next) {
  background-color: #000;
  border-color: #333;
  color: #fff;
}

:deep(.el-pagination .btn-prev:hover, .el-pagination .btn-next:hover) {
  color: #409eff;
}

:deep(.el-pagination .btn-prev.is-disabled),
:deep(.el-pagination .btn-next.is-disabled) {
  background-color: #000;
  border-color: #333;
  color: #666;
  cursor: not-allowed;
}

:deep(.el-pagination .btn-prev.is-disabled:hover),
:deep(.el-pagination .btn-next.is-disabled:hover) {
  background-color: #000;
  border-color: #333;
  color: #666;
}

:deep(.el-pagination .btn-next) {
  background-color: #000 !important;
  border-color: #333 !important;
  color: #fff !important;
}

:deep(.el-pagination .btn-next:hover:not(.is-disabled)) {
  background-color: #000 !important;
  border-color: #409eff !important;
  color: #409eff !important;
}

:deep(.el-pagination .btn-next.is-disabled) {
  background-color: #000 !important;
  border-color: #333 !important;
  color: #666 !important;
}
</style>
