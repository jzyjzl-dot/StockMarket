import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginRegister.vue'),
  },
  {
    path: '/',
    name: 'Main',
    component: () => import('../components/Main.vue'),
    children: [
      {
        path: '',
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
    next('/login');
    return;
  }

  if (to.meta.roles && !to.meta.roles.includes(userStore.userInfo?.role)) {
    alert('无权限访问此页面');
    next('/');
    return;
  }

  next();
});
export default router;
