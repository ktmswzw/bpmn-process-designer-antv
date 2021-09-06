<template>
  <div class="panel-tab__content">
    <a-form-model :model="flowConditionForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" size="small" @submit.native.prevent>
      <a-form-model-item label="流转类型">
        <a-select v-model="flowConditionForm.type" @change="updateFlowType">
          <a-select-option value="normal" >普通流转路径</a-select-option>
            <a-select-option value="default" >默认流转路径</a-select-option>
            <a-select-option value="condition" >条件流转路径</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="条件格式" v-if="flowConditionForm.type === 'condition'" key="condition">
        <a-select v-model="flowConditionForm.conditionType">
          <a-select-option title="表达式" value="expression" >表达式</a-select-option>
          <a-select-option title="脚本" value="script" >脚本</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="表达式" v-if="flowConditionForm.conditionType && flowConditionForm.conditionType === 'expression'" key="express">
        <a-input v-model="flowConditionForm.body" allowClear @change="updateFlowCondition" />
      </a-form-model-item>
      <template v-if="flowConditionForm.conditionType && flowConditionForm.conditionType === 'script'">
        <a-form-model-item label="脚本语言" key="language">
          <a-input v-model="flowConditionForm.language" allowClear @change="updateFlowCondition" />
        </a-form-model-item>
        <a-form-model-item label="脚本类型" key="scriptType">
          <a-select v-model="flowConditionForm.scriptType">
            <a-select-option title="内联脚本" value="inlineScript" >内联脚本</a-select-option>
            <a-select-option title="外部脚本" value="externalScript" >外部脚本</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="脚本" v-if="flowConditionForm.scriptType === 'inlineScript'" key="body">
          <a-input v-model="flowConditionForm.body" type="textarea" allowClear @change="updateFlowCondition" />
        </a-form-model-item>
        <a-form-model-item label="资源地址" v-if="flowConditionForm.scriptType === 'externalScript'" key="resource">
          <a-input v-model="flowConditionForm.resource" allowClear @change="updateFlowCondition" />
        </a-form-model-item>
      </template>
    </a-form-model>
  </div>
</template>

<script>
export default {
  name: "FlowCondition",
  props: {
    businessObject: Object,
    type: String
  },
  data() {
    return {
      flowConditionForm: {}
    };
  },
  watch: {
    businessObject: {
      immediate: true,
      handler() {
        this.$nextTick(() => this.resetFlowCondition());
      }
    }
  },
  methods: {
    resetFlowCondition() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.bpmnElementSource = this.bpmnElement.source;
      this.bpmnElementSourceRef = this.bpmnElement.businessObject.sourceRef;
      if (this.bpmnElementSourceRef && this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        // 默认
        this.flowConditionForm = { type: "default" };
      } else if (!this.bpmnElement.businessObject.conditionExpression) {
        // 普通
        this.flowConditionForm = { type: "normal" };
      } else {
        // 带条件
        const conditionExpression = this.bpmnElement.businessObject.conditionExpression;
        this.flowConditionForm = { ...conditionExpression, type: "condition" };
        // resource 可直接标识 是否是外部资源脚本
        if (this.flowConditionForm.resource) {
          this.$set(this.flowConditionForm, "conditionType", "script");
          this.$set(this.flowConditionForm, "scriptType", "externalScript");
          return;
        }
        if (conditionExpression.language) {
          this.$set(this.flowConditionForm, "conditionType", "script");
          this.$set(this.flowConditionForm, "scriptType", "inlineScript");
          return;
        }
        this.$set(this.flowConditionForm, "conditionType", "expression");
      }
    },
    updateFlowType(flowType) {
      // 正常条件类
      if (flowType === "condition") {
        this.flowConditionRef = window.bpmnInstances.moddle.create("bpmn:FormalExpression");
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: this.flowConditionRef
        });
        return;
      }
      // 默认路径
      if (flowType === "default") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          conditionExpression: null
        });
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: this.bpmnElement
        });
        return;
      }
      // 正常路径，如果来源节点的默认路径是当前连线时，清除父元素的默认路径配置
      if (this.bpmnElementSourceRef.default && this.bpmnElementSourceRef.default.id === this.bpmnElement.id) {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElementSource, {
          default: null
        });
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        conditionExpression: null
      });
    },
    updateFlowCondition() {
      let { conditionType, scriptType, body, resource, language } = this.flowConditionForm;
      let condition;
      if (conditionType === "expression") {
        condition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body });
      } else {
        if (scriptType === "inlineScript") {
          condition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { body, language });
          this.$set(this.flowConditionForm, "resource", "");
        } else {
          this.$set(this.flowConditionForm, "body", "");
          condition = window.bpmnInstances.moddle.create("bpmn:FormalExpression", { resource, language });
        }
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, { conditionExpression: condition });
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
    this.bpmnElementSource = null;
    this.bpmnElementSourceRef = null;
  }
};
</script>
