import BpmnAntV from "./index.vue";

BpmnAntV.install = Vue => Vue.component(BpmnAntV.name, BpmnAntV) // 给组件配置install方法
BpmnAntV.version = "0.0.2"

export default BpmnAntV