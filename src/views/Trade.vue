<template>
  <div class="trade-page">
    <div class="top-section">
      <div class="market-panel panel">行情界面</div>
      <div class="order-panel panel">下单界面</div>
      <div class="preview-panel panel">
        <StockPreview />
      </div>
    </div>

    <div class="bottom-section panel">
      <OrderList />
    </div>
  </div>
</template>

<script setup>
import StockPreview from '@/components/StockPreview.vue';
import OrderList from '@/components/OrderList.vue';
</script>

<style scoped>
.trade-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
  /* overflow: auto; */
}

.top-section {
  display: grid;
  grid-template-columns: 240px 320px 1fr;
  gap: 12px;
  align-items: stretch;
  min-height: 220px;
}

.bottom-section.panel {
  height: 500px;
  margin-top: 12px;
}

.panel {
  background: #0f0f0f;
  color: #fff;
  border: 1px solid #444;
  padding: 12px;
  box-sizing: border-box;
  height: 100%;
  /* min-height: 200px; */
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  border-radius: 6px;
}

.market-panel {
  /* 行情左侧窄列 */
  overflow: auto;
}

.order-panel {
  /* 下单面板 */
  overflow: auto;
}

.preview-panel {
  /* 预览面板，占据剩余宽度 */
  overflow: auto;
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stock-item {
  background: #1a1a1a;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #555;
}

.stock-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.stock-price {
  color: #ccc;
}

.stock-change {
  font-size: 0.9em;
}

.positive {
  color: #4caf50;
}

.negative {
  color: #f44336;
}

@media (max-width: 900px) {
  .top-section {
    grid-template-columns: 1fr;
  }
  .bottom-section {
    height: 240px;
  }
}
</style>
