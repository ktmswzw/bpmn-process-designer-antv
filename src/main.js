import Vue from "vue";
import App from "./App.vue";

import axios from "axios";
Vue.prototype.$axios = axios;

// 加载基础ant-design-vue
import Antd from "ant-design-vue";

Vue.use(Antd)
import "ant-design-vue/dist/antd.min.css";

import { vuePlugin } from "../package/highlight";
import "highlight.js/styles/atom-one-dark-reasonable.css";
Vue.use(vuePlugin);

import "../package/theme/process-designer.css";
import "../package/theme/process-panel.css";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";

new Vue({
  render: h => h(App)
}).$mount("#app");
