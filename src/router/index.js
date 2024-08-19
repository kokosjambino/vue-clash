import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NotFound from '@/pages/notFound.vue'
import Item from '@/pages/_itemAlias.vue'
import items from '@/seeders/items'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    { path: '/404', name: 'PageNotFound', component: NotFound },
    {
      path: '/:itemAlias',
      name: 'itemAlias',
      component: Item,
      beforeEnter(to) {
        const valueUrl = to.params.itemAlias

        const valueAlias = items.find(function (item) {
          return item.alias === valueUrl
        })

        if (!valueAlias) {
          return {
            name: '404'
          }
        }
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      redirect: '/404'
    }
  ]
})

export default router
