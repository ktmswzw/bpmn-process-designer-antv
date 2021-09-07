<template>
  <div id="app">
    <process-designer
        :key="`designer-${reloadIndex}`"
        v-model="xmlString"
        v-bind="controlForm"
        :header-button-size="controlForm.headerButtonSize"
        keyboard
        ref="processDesigner"
        @element-click="elementClick"
        @init-finished="initModeler"
    />
    <properties-panel :key="`penal-${reloadIndex}`" :bpmn-modeler="modeler" :prefix="prefix"
                      class="process-panel"/>
    <div class="demo-control-bar">
      <div class="open-control-dialog" @click="controlDrawerVisible = true">
        <a-icon type="setting"/>
      </div>
    </div>
    <a-drawer :visible.sync="controlDrawerVisible" width="410" title="偏好设置" placement="right" @close="onClose"
              :closable="true">
      <a-form-model :model="controlForm" size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }"
                    class="control-form" @submit.native.prevent :rules="formRules">
        <a-form-model-item label="流程ID" prop="processId">
          <a-input v-model="controlForm.processId" @change="reloadProcessDesigner"/>
        </a-form-model-item>
        <a-form-model-item label="流程名称" prop="processName">
          <a-input v-model="controlForm.processName" @change="reloadProcessDesigner"/>
        </a-form-model-item>
        <a-form-model-item label="流转模拟" prop="simulation">
          <a-switch v-model="controlForm.simulation" un-checked-children="停用" checked-children="启用"
                    @change="reloadProcessDesigner"/>
        </a-form-model-item>
        <a-form-model-item label="禁用双击" prop="labelEditing">
          <a-switch v-model="controlForm.labelEditing" un-checked-children="停用" checked-children="启用"
                    @change="changeLabelEditingStatus"/>
        </a-form-model-item>
        <a-form-model-item label="隐藏label" prop="labelVisible">
          <a-switch v-model="controlForm.labelVisible" un-checked-children="停用" checked-children="启用"
                    @change="changeLabelVisibleStatus"/>
        </a-form-model-item>
        <a-form-model-item label="流程引擎" prop="prefix">
          <a-radio-group v-model="prefix" @change="reloadProcessDesigner">
            <a-radio value="camunda">camunda</a-radio>
            <a-radio value="flowable">flowable</a-radio>
            <a-radio value="activiti">activiti</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="工具栏" prop="processId">
          <a-radio-group v-model="controlForm.headerButtonSize">
            <a-radio value="large">
              Large
            </a-radio>
            <a-radio value="default">
              Default
            </a-radio>
            <a-radio value="small">
              Small
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
    </a-drawer>
  </div>
</template>

<script>
import ProcessDesigner from "../package/process-designer";
import PropertiesPanel from "../package/refactor";

import translations from "../package/translations";
// 自定义渲染（隐藏了 label 标签）
import CustomRenderer from "../package/modules/custom-renderer";
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from "../package/process-designer/plugins/content-pad";
// 自定义左侧菜单（修改 默认任务 为 用户任务）
import CustomPaletteProvider from "../package/process-designer/plugins/palette";

import Vue from "vue";
import axios from "axios";

Vue.prototype.$axios = axios;

// 加载基础ant-design-vue
import Antd from "ant-design-vue";

Vue.use(Antd);
import "ant-design-vue/dist/antd.min.css";
import {vuePlugin} from "../package/highlight";
import "highlight.js/styles/atom-one-dark-reasonable.css";

Vue.use(vuePlugin);
import "../package/theme/index.scss";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";

export default {
  name: "BpmnAntV",
  components: {
    ProcessDesigner,
    PropertiesPanel
  },
  props: {
    xmlString: {
      type: String,
      default: "",
    },
    prefix:{
      type: String,
      default: "camunda",
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
  data() {
    return {
      modeler: null,
      reloadIndex: 0,
      controlDrawerVisible: false,
      translationsSelf: translations,
      controlForm: {
        processId: "",
        processName: "",
        simulation: true,
        labelEditing: false,
        labelVisible: false,
        headerButtonSize: "small",
        // additionalModel: []
        additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
      },
      addis: {},
      formRules: {
        processName: [
          {required: true, message: '请输入名称!'},
        ],
        processId: [
          {required: true, message: '请输入Id!'},
        ],
      },
    };
  },
  created() {
    // console.log(this.translationsSelf);
    this.requestUserInfo();
  },
  methods: {
    initModeler(modeler) {
      setTimeout(() => {
        this.modeler = modeler;
      }, 10);
    },
    onClose() {
      this.controlDrawerVisible = false;
    },
    reloadProcessDesigner() {
      this.controlForm.additionalModel = [];
      for (let key in this.addis) {
        if (this.addis[key]) {
          this.controlForm.additionalModel.push(this.addis[key]);
        }
      }
      this.reloadIndex += 1;
      this.modeler = null; // 避免 panel 异常
    },
    changeLabelEditingStatus(status) {
      this.addis.labelEditing = status ? {labelEditingProvider: ["value", ""]} : false;
      this.reloadProcessDesigner();
    },
    changeLabelVisibleStatus(status) {
      this.addis.customRenderer = status ? CustomRenderer : false;
      this.reloadProcessDesigner();
    },
    elementClick(element) {
      this.element = element;
    },
    requestUserInfo() {
      // this.$axios.get("/user/userInfo").then(res => {
      //   console.log(res);
      // });
    }
  }
};
</script>

<style lang="scss">
body {
  overflow: hidden;
  margin: 0;
  box-sizing: border-box;
}

#app {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: inline-grid;
  grid-template-columns: auto max-content;
}

.demo-control-bar {
  position: fixed;
  right: 8px;
  bottom: 8px;
  z-index: 1;

  .open-control-dialog {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 32px;
    background: rgba(64, 158, 255, 1);
    color: #ffffff;
    cursor: pointer;
  }
}

.control-form {
  .a-radio {
    width: 100%;
    line-height: 32px;
  }
}

body,
body * {
  /* 滚动条 */
  &::-webkit-scrollbar-track-piece {
    background-color: #fff; /*滚动条的背景颜色*/
    -webkit-border-radius: 0; /*滚动条的圆角宽度*/
  }

  &::-webkit-scrollbar {
    width: 10px; /*滚动条的宽度*/
    height: 8px; /*滚动条的高度*/
  }

  &::-webkit-scrollbar-thumb:vertical {
    /*垂直滚动条的样式*/
    height: 50px;
    background-color: rgba(153, 153, 153, 0.5);
    -webkit-border-radius: 4px;
    outline: 2px solid #fff;
    outline-offset: -2px;
    border: 2px solid #fff;
  }

  &::-webkit-scrollbar-thumb {
    /*滚动条的hover样式*/
    background-color: rgba(159, 159, 159, 0.3);
    -webkit-border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    /*滚动条的hover样式*/
    background-color: rgba(159, 159, 159, 0.5);
    -webkit-border-radius: 4px;
  }
}
</style>
