import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'

// 导入公共样式
import '@/assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入小图标
import '@/assets/fonts/iconfont.css'
import '@/assets/fonts2/iconfont.css'
import '@/assets/mouse.js'

// 导入富文本的的样式
import VueQuillEditor from 'vue-quill-editor'

// 导入nprogressd的js和css
import NProgress from 'nprogress'

// 导入axios
import axios from 'axios'
// http://127.0.0.1:8888/api/private/v1/
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

// 请求拦截 在request拦截器中，展示进度条 NProgress.start()
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 在response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)

// 将富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)

// 定义时间过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  // 两位小数 不足补0
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
