// 示例：如何在前端应用中使用共享包
import { ref } from 'vue';
import { User, Product, formatCurrency, generateId } from '@stock-market/shared';
import { DataTable, LoadingButton } from '@stock-market/ui';

export default {
  setup() {
    // 使用共享类型
    const user: User = {
      id: generateId(),
      username: 'john_doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'trader'
    };

    const products = ref<Product[]>([]);

    // 使用共享工具函数
    const displayPrice = (price: number) => {
      return formatCurrency(price); // 返回 "¥123.45"
    };

    return {
      user,
      products,
      displayPrice
    };
  },

  // 在模板中使用UI组件
  template: `
    <div>
      <DataTable :data="products" :loading="false">
        <el-table-column prop="name" label="产品名称" />
        <el-table-column prop="price" label="价格">
          <template #default="scope">
            {{ displayPrice(scope.row.price) }}
          </template>
        </el-table-column>
      </DataTable>

      <LoadingButton @click="handleAction" :loading="isLoading">
        执行操作
      </LoadingButton>
    </div>
  `
};
