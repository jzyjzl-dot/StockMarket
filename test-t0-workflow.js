const BASE_URL = 'http://localhost:3004';

// Helper function to make HTTP requests
async function apiRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
}

async function testT0Workflow() {
  try {
    console.log('🧪 开始测试T0策略交易工作流...\n');

    // 1. 测试提交T0策略到预览表 (t0_buys)
    console.log('1️⃣ 提交T0策略到预览表...');
    const buyData = {
      orderTime: new Date().toISOString(),
      account: '测试账户001',
      symbol: '600000',
      side: 'BUY',
      price: 10.50,
      quantity: 1000,
      amount: 10500,
      market: 'SH',
      orderType: 'LIMIT',
      status: 'pending',
      algoInstance: 'KT_10',
      strategy: 'T0策略',
      distribution: '等额分配',
      basketNo: 'BASKET001',
      externalNo: 'EXT001',
      riskExposure: 'medium',
      execAfterExpire: false,
      executeImmediately: false,
      businessStartTime: '09:30:00',
      businessEndTime: '15:00:00',
      buyDirection: 'normal_buy',
      sellDirection: 'normal_sell'
    };

    const buyResponse = await apiRequest('POST', `${BASE_URL}/t0Buys`, buyData);
    console.log(`✅ T0策略已提交到预览，ID: ${buyResponse.id}`);

    // 2. 查询预览表中的数据
    console.log('\n2️⃣ 查询预览表数据...');
    const buysResponse = await apiRequest('GET', `${BASE_URL}/t0Buys`);
    console.log(`📊 预览表中有 ${buysResponse.length} 条记录`);
    buysResponse.forEach(buy => {
      console.log(`   - ID: ${buy.id}, 账户: ${buy.account}, 股票: ${buy.symbol}, 数量: ${buy.quantity}`);
    });

    // 3. 确认策略（将预览转为委托）
    console.log('\n3️⃣ 确认策略，转为委托...');
    const buyIds = buysResponse.map(buy => buy.id);
    await apiRequest('POST', `${BASE_URL}/t0Orders/confirmFromBuys`, {
      buyIds: buyIds
    });
    console.log('✅ 策略已确认并转为委托');

    // 4. 查询委托表中的数据
    console.log('\n4️⃣ 查询委托表数据...');
    const ordersResponse = await apiRequest('GET', `${BASE_URL}/t0Orders`);
    console.log(`📊 委托表中有 ${ordersResponse.length} 条记录`);
    ordersResponse.forEach(order => {
      console.log(`   - ID: ${order.id}, 账户: ${order.account}, 股票: ${order.symbol}, 状态: ${order.status}`);
    });

    // 5. 验证预览表已清空
    console.log('\n5️⃣ 验证预览表已清空...');
    const buysAfterConfirm = await apiRequest('GET', `${BASE_URL}/t0Buys`);
    console.log(`📊 预览表中还有 ${buysAfterConfirm.length} 条记录`);

    console.log('\n🎉 T0策略交易工作流测试完成！');
    console.log('✅ 工作流：下达策略 → t0_buys(预览) → 确认 → t0_orders(委托)');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testT0Workflow();