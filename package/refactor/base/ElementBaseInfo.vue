<template>
  <div class="panel-tab__content">
    <a-form size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" @submit.native.prevent>
      <a-form-item label="ID">
        <a-input
          v-model="elementBaseInfo.id"
          :disabled="idEditDisabled || elementBaseInfo.$type === 'bpmn:Process'"
          allowClear
          @change="updateBaseInfo('id')"
        />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model="elementBaseInfo.name" allowClear @change="updateBaseInfo('name')" />
      </a-form-item>
      <!--流程的基础属性-->
      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <a-form-item label="版本标签">
          <a-input v-model="elementBaseInfo.versionTag" allowClear @change="updateBaseInfo('versionTag')" />
        </a-form-item>
        <a-form-item label="可执行">
          <a-switch v-model="elementBaseInfo.isExecutable" checked-children="是" un-checked-children="否" @change="updateBaseInfo('isExecutable')" />
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>
<script>
export default {
  name: "ElementBaseInfo",
  props: {
    businessObject: Object,
    type: String,
    idEditDisabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      elementBaseInfo: {}
    };
  },
  watch: {
    businessObject: {
      immediate: false,
      handler: function(val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo());
        }
      }
    }
  },
  methods: {
    resetBaseInfo() {
      this.bpmnElement = window?.bpmnInstances?.bpmnElement;
      this.elementBaseInfo = JSON.parse(JSON.stringify(this.bpmnElement.businessObject));
    },
    updateBaseInfo(key) {
      const attrObj = Object.create(null);
      attrObj[key] = this.elementBaseInfo[key];
      if (key === "id") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: `${this.elementBaseInfo[key]}_di` }
        });
      } else {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj);
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>
