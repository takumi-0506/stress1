import { createRouter, createWebHistory } from 'vue-router'
import HomeScreen from '@/components/HomeScreen.vue'
import ColumnChart from '@/components/ColumnChart.vue'
import StressBattle from '@/components/StressBattle.vue'

const routes = [
  { path: '/', name: 'HomeScreen', component: HomeScreen },
  { path: '/ColumnChart/', name: 'ColumnChart', component: ColumnChart },
  // {
  //   path: '/progress',
  //   name: 'Progress',
  //   component: () => import('@/views/Progress.vue'),
  // },
  { path: '/StressBattle', name: 'StressBattle', component: StressBattle },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
