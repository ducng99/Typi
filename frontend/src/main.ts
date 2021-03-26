import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueCookies from 'vue-cookies'
import IdleVue from 'idle-vue'
import App from './App.vue'

require('bootstrap/dist/css/bootstrap.css')
require('bootstrap-vue/dist/bootstrap-vue.css')
import styles from '@/style.module.css'

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueCookies);

Vue.prototype.$style = styles;

const app = new Vue({
  render: h => h(App),
}).$mount('#app');

Vue.use(IdleVue, {
  eventEmitter: app,
  idleTime: 60000
});