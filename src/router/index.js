import { createRouter, createWebHistory } from 'vue-router'
import PackageSearch from '../views/PackageSearch.vue'
import PackageInfo from '../views/PackageInfo.vue'
import Payment from '../views/Payment.vue'

const routes = [
  {
    path: '/',
    name: 'PackageSearch',
    component: PackageSearch
  },
  {
    path: '/package-info',
    name: 'PackageInfo',
    component: PackageInfo
  },
  {
    path: '/payment',
    name: 'Payment',
    component: Payment
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

