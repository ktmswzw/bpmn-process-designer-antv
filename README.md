# Bpmn Process Designer

A process designer that depends on [bpmn.js](https://github.com/bpmn-io/bpmn-js)  ,  [Vue 2.x](https://github.com/vuejs/vue) and [AntD](https://www.antdv.com/components/modal-cn/). 

一个基于 `bpmn.js`，`Vue 2.x` 和 `Ant Design of Vue` 开发的流程设计器。



You can view and edit `BPMN 2.0` diagrams in the browser.

您可以使用它在浏览器上查看和编辑符合 `BPMN 2.0` 规范的流程文件。

Forked from https://miyuesc.gitee.io/process-designer/


## 1. 安装依赖 Installation

```shell
npm install bpmn-process-designer-antv
```
```shell
import BpmnAntV from "bpmn-process-designer-antv";

export default {
name: "App",
components: {
BpmnAntV
}


<bpmn-ant-v></bpmn-ant-v>

props: {
    xmlString: {
      type: String,
      default: "",
    },
    prefix:{
      type: String,
      default: "camunda", // flowable  activiti
    },
    users: {
      type: Array,
      default: () => []
    },
    roles: {
      type: Array,
      default: () => []
    },
  },
```

