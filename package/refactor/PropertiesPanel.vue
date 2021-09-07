<template>
  <div class="process-panel__container" :style="{ width: `${this.width}px` }">
    <a-collapse v-model="activeTab" accordion :bordered="false" expand-icon-position="right">
      <a-collapse-panel key="base" :style="customStyle" >
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="info-circle" />常规</div>
        <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel v-if="elementType === 'Process'" key="message" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="message" />消息与信号</div>
        <signal-and-massage />
      </a-collapse-panel>
      <a-collapse-panel v-if="conditionFormVisible" key="condition" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="control" />流转条件</div>
        <flow-condition :business-object="elementBusinessObject" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel  v-if="formVisible" key="form" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="file-done" />表单</div>
        <element-form :id="elementId" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel  v-if="elementType.indexOf('Task') !== -1" key="task" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="schedule" />任务</div>
        <element-task :id="elementId" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel v-if="elementType.indexOf('Task') !== -1" key="multiInstance" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="apartment" />多实例</div>
        <element-multi-instance :business-object="elementBusinessObject" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel key="listeners" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="code" />执行监听器</div>
        <element-listeners :id="elementId" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel v-if="elementType === 'UserTask'" key="taskListeners" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="bell" />任务监听器</div>
        <user-task-listeners :id="elementId" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel key="extensions" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="plus-circle" />扩展属性</div>
        <element-properties :id="elementId" :type="elementType" />
      </a-collapse-panel>
      <a-collapse-panel key="other" :style="customStyle">
        <div slot="header" class="panel-tab__title"><a-icon slot="extra" type="tags" />其他</div>
        <element-other-config :id="elementId" />
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script>
import ElementBaseInfo from "./base/ElementBaseInfo";
import ElementOtherConfig from "./other/ElementOtherConfig";
import ElementTask from "./task/ElementTask";
import ElementMultiInstance from "./multi-instance/ElementMultiInstance";
import FlowCondition from "./flow-condition/FlowCondition";
import SignalAndMassage from "./signal-message/SignalAndMessage";
import ElementListeners from "./listeners/ElementListeners";
import ElementProperties from "./properties/ElementProperties";
import ElementForm from "./form/ElementForm";
import UserTaskListeners from "./listeners/UserTaskListeners";

export default {
  name: "PropertiesPanel",
  components: {
    UserTaskListeners,
    ElementForm,
    ElementProperties,
    ElementListeners,
    SignalAndMassage,
    FlowCondition,
    ElementMultiInstance,
    ElementTask,
    ElementOtherConfig,
    ElementBaseInfo
  },
  componentName: "PropertiesPanel",
  props: {
    bpmnModeler: Object,
    prefix: {
      type: String,
      default: "camunda"
    },
    width: {
      type: Number,
      default: 480
    },
    idEditDisabled: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      prefix: this.prefix,
      width: this.width
    };
  },
  data() {
    return {
      customStyle: 'background: #f7f7f7;border-radius: 4px;margin-bottom: 0px;border: 0;overflow: hidden',
      activeTab: "base",
      elementId: "",
      elementType: "",
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false, // 流转条件设置
      formVisible: false // 表单配置
    };
  },
  watch: {
    elementId: {
      handler() {
        this.activeTab = "base";
      }
    }
  },
  created() {
    this.initModels();
  },
  methods: {
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10);
        return;
      }
      if (this.timer) clearTimeout(this.timer);
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get("modeling"),
        moddle: this.bpmnModeler.get("moddle"),
        eventBus: this.bpmnModeler.get("eventBus"),
        bpmnFactory: this.bpmnModeler.get("bpmnFactory"),
        elementRegistry: this.bpmnModeler.get("elementRegistry"),
        replace: this.bpmnModeler.get("replace"),
        selection: this.bpmnModeler.get("selection")
      };
      this.getActiveElement();
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null);
      this.bpmnModeler.on("import.done", e => {
        this.initFormOnChanged(null);
      });
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on("selection.changed", ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null);
      });
      this.bpmnModeler.on("element.changed", ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element);
        }
      });
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element;
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration");
      }
      if (!activatedElement) return;
      console.log(`
              ----------
      select element changed:
                id:  ${activatedElement.id}
              type:  ${activatedElement.businessObject.$type}
              ----------
              `);
      console.log("businessObject: ", activatedElement.businessObject);
      window.bpmnInstances.bpmnElement = activatedElement;
      this.bpmnElement = activatedElement;
      this.elementId = activatedElement.id;
      this.elementType = activatedElement.type.split(":")[1] || "";
      this.elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject));
      this.conditionFormVisible = !!(
        this.elementType === "SequenceFlow" &&
        activatedElement.source &&
        activatedElement.source.type.indexOf("StartEvent") === -1
      );
      this.formVisible = this.elementType === "UserTask" || this.elementType === "StartEvent";
    },
    beforeDestroy() {
      window.bpmnInstances = null;
    }
  }
};
</script>
