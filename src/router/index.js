import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入组件
// import Login from '@/components/Login.vue'
// import Home from '@/components/Home.vue'
// import Welcome from '@/components/Welcome.vue'
// import Users from '@/components/Users/User.vue'
// import Rights from '@/components/power/Rights.vue'
// import Roles from '@/components/power/Roles.vue'
// import Cate from '@/components/goods/Cate.vue'
// import Params from '@/components/goods/Params.vue'
// import Goods from '@/components/goods/Goods.vue'
// import Add from '@/components/goods/Add.vue'
// import Order from '@/components/order/Order.vue'
// import Report from '@/components/report/Report.vue'

const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '@/components/Login.vue')
// import Login from './components/Login.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '@/components/Home.vue')
// import Home from './components/Home.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '@/components/Welcome.vue')
// import Welcome from './components/Welcome.vue'
const Users = () => import(/* webpackChunkName:"user" */ '@/components/Users/User.vue')
// import Users from './components/user/Users.vue'
const Rights = () => import(/* webpackChunkName:"power" */ '@/components/power/Rights.vue')
// import Rights from './components/power/Rights.vue'
const Roles = () => import(/* webpackChunkName:"power" */ '@/components/power/Roles.vue')
// import Roles from './components/power/Roles.vue'
const Cate = () => import(/* webpackChunkName:"goods" */ '@/components/goods/Cate.vue')
// import Cate from './components/goods/Cate.vue'
const Params = () => import(/* webpackChunkName:"goods" */ '@/components/goods/Params.vue')
// import Params from './components/goods/Params.vue'
const Goods = () => import(/* webpackChunkName:"goods" */ '@/components/goods/Goods.vue')
// import GoodList from './components/goods/List.vue'
const Add = () => import(/* webpackChunkName:"goods" */ '@/components/goods/Add.vue')
// import GoodAdd from './components/goods/Add.vue'
const Order = () => import(/* webpackChunkName:"order" */ '@/components/order/Order.vue')
// import Order from './components/order/Order.vue'
const Report = () => import(/* webpackChunkName:"report" */ '@/components/report/Report.vue')
// import Report from './components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: Goods },
      { path: '/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
