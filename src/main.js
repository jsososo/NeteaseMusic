import Vue from 'vue';
import App from './App.vue';
import router from './router';
import 'element-ui/lib/theme-chalk/index.css';
import Element from 'element-ui';
import './assets/style/icon/iconfont.css';
import PlayerStore from './store/index';


Vue.use(Element, { size: 'small' });

new Vue({
  store: PlayerStore,
  router,
  render: h => h(App)
}).$mount('#app');
