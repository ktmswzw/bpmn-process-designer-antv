<template>
  <div style="margin-top: 16px">
    <a-form-model-item label="脚本格式">
      <a-input v-model="scriptTaskForm.scriptFormat" allowClear @input="updateElementTask()" @change="updateElementTask()" />
    </a-form-model-item>
    <a-form-model-item label="脚本类型">
      <a-select v-model="scriptTaskForm.scriptType">
        <a-select-option title="内联脚本" value="inline" >内联脚本</a-select-option>
        <a-select-option title="外部资源" value="external" >外部资源</a-select-option>
      </a-select>
    </a-form-model-item>
    <a-form-model-item label="脚本" v-show="scriptTaskForm.scriptType === 'inline'">
      <a-input
        v-model="scriptTaskForm.script"
        type="textarea"
        resize="vertical"
        :autoSize="{ minRows: 2, maxRows: 4 }"
        allowClear
        @input="updateElementTask()"
        @change="updateElementTask()"
      />
    </a-form-model-item>
    <a-form-model-item label="资源地址" v-show="scriptTaskForm.scriptType === 'external'">
      <a-input v-model="scriptTaskForm.resource" allowClear @input="updateElementTask()" @change="updateElementTask()" />
    </a-form-model-item>
    <a-form-model-item label="结果变量">
      <a-input v-model="scriptTaskForm.resultVariable" allowClear @input="updateElementTask()" @change="updateElementTask()" />
    </a-form-model-item>
  </div>
</template>

<script>
export default {
  name: "ScriptTask",
  props: {
    id: String,
    type: String
  },
  data() {
    return {
      defaultTaskForm: {
        scriptFormat: "",
        script: "",
        resource: "",
        resultVariable: ""
      },
      scriptTaskForm: {}
    };
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        this.$nextTick(() => this.resetTaskForm());
      }
    }
  },
  methods: {
    resetTaskForm() {
      for (let key in this.defaultTaskForm) {
        let value = this.bpmnElement?.businessObject[key] || this.defaultTaskForm[key];
        this.$set(this.scriptTaskForm, key, value);
      }
      this.$set(this.scriptTaskForm, "scriptType", this.scriptTaskForm.script ? "inline" : "external");
    },
    updateElementTask() {
      let taskAttr = Object.create(null);
      taskAttr.scriptFormat = this.scriptTaskForm.scriptFormat || null;
      taskAttr.resultVariable = this.scriptTaskForm.resultVariable || null;
      if (this.scriptTaskForm.scriptType === "inline") {
        taskAttr.script = this.scriptTaskForm.script || null;
        taskAttr.resource = null;
      } else {
        taskAttr.resource = this.scriptTaskForm.resource || null;
        taskAttr.script = null;
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>
