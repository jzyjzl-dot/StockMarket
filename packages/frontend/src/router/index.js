import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../components/LoginRegister_new.vue'),
  },
  {
    path: '/user-selection',
    name: 'UserSelection',
    component: () => import('../components/UserSelection.vue'),
  },
  {
    path: '/login',
    name: 'LoginAlt',
    component: () => import('../components/LoginRegister.vue'),
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../components/Main.vue'),
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/products',
        name: 'ProductManagement',
        component: () => import('../views/ProductManagement.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/monitoring',
        name: 'TradeMonitoring',
        component: () => import('../views/TradeMonitoring.vue'),
        meta: { requiresAuth: true, roles: ['trader', 'manager'] },
      },
      {
        path: '/risk',
        name: 'RiskControl',
        component: () => import('../views/RiskControl.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/users',
        name: 'UserManagement',
        component: () => import('../views/UserManagement.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/trade',
        name: 'Trade',
        component: () => import('../views/Trade.vue'),
        meta: { requiresAuth: true, roles: ['trader', 'manager'] },
      },
      {
        path: '/trading/normal',
        name: 'NormalTrade',
        component: () => import('../views/trading/NormalTrade.vue'),
        meta: { requiresAuth: true, roles: ['trader', 'manager'] },
      },
      {
        path: '/trading/algo-multi',
        name: 'AlgoMultiAccount',
        component: () => import('../views/trading/AlgoMultiAccount.vue'),
        meta: { requiresAuth: true, roles: ['trader', 'manager'] },
      },
      {
        path: '/trading/t0-multi',
        name: 'T0MultiAccount',
        component: () => import('../views/trading/T0MultiAccount.vue'),
        meta: { requiresAuth: true, roles: ['trader', 'manager'] },
      },
      {
        path: '/management/account-edit',
        name: 'AccountEdit',
        component: () => import('../views/management/AccountEdit.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/management/account-group-edit',
        name: 'AccountGroupEdit',
        component: () => import('../views/management/AccountGroupEdit.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/management/risk-management',
        name: 'RiskManagement',
        component: () => import('../views/management/RiskManagement.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/management/role-management',
        name: 'RoleManagement',
        component: () => import('../views/management/RoleManagement.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/management/process-management',
        name: 'ProcessManagement',
        component: () => import('../views/management/ProcessManagement.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/management/approval-function',
        name: 'ApprovalFunction',
        component: () => import('../views/management/ApprovalFunction.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
      {
        path: '/management/device-info',
        name: 'DeviceInfo',
        component: () => import('../views/management/DeviceInfo.vue'),
        meta: { requiresAuth: true, roles: ['manager'] },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/');
    return;
  }

  if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo?.role)) {
    alert('无权限访问此页面');
    next('/main');
    return;
  }

  next();
});
export default router;
