import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'Home', component: () => import('../views/HomeView.vue') },
    { path: '/academy', name: 'Academy', component: () => import('../views/AcademyView.vue') },
    { path: '/pathway', name: 'Pathway', component: () => import('../views/PathwayView.vue') },
    { path: '/academy/course/:id', name: 'CourseDetail', component: () => import('../views/CourseDetailView.vue') },
    { path: '/events', name: 'Events', component: () => import('../views/EventsView.vue') },
    { path: '/events/archive/:id', name: 'PastEventDetail', component: () => import('../views/PastEventDetailView.vue') },
    { path: '/events/active/:type/:id', name: 'ActiveEvent', component: () => import('../views/ActiveEventView.vue') },
    { path: '/events/reserve/:type/:id', name: 'EventReservation', component: () => import('../views/EventReservationView.vue') },
    { path: '/checkout', name: 'Checkout', component: () => import('../views/CheckoutView.vue') },
    { path: '/products', name: 'Products', component: () => import('../views/ProductsView.vue') },
    { path: '/global-trade', name: 'GlobalTrade', component: () => import('../views/GlobalTradeView.vue') },
    { path: '/global-trade/report/:id', name: 'TradeReportDetail', component: () => import('../views/TradeReportDetailView.vue') },
    { path: '/partners', name: 'Partners', component: () => import('../views/PartnersView.vue') },
    { path: '/about', name: 'About', component: () => import('../views/AboutView.vue') },
    { path: '/contact', name: 'Contact', component: () => import('../views/ContactView.vue') },
    { path: '/admin', name: 'Admin', component: () => import('../views/AdminPanel.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
