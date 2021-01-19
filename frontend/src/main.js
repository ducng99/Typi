import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueCookies from "vue-cookies"
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(VueCookies)

Vue.prototype.$COOKIE_SESSION_ID = "WebChat_Session_ID"

new Vue({
  render: h => h(App),
}).$mount('#app')
