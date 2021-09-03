<template>
  <div class="panel-tab__content">
    <a-table :dataSource="elementPropertyList" size="small" max-height="240" bordered fit>
      <a-table-column title="序号" width="50px" type="index" />
      <a-table-column title="属性名" dataIndex="name" width="100" show-overflow-tooltip />
      <a-table-column title="属性值" dataIndex="value" width="100" show-overflow-tooltip />
      <a-table-column title="操作" width="90px">
        <template slot-scope="{ row, $index }">
          <a-button size="small" type="default" @click="openAttributesForm(row, $index)">编辑</a-button>
          <a-divider direction="vertical" />
          <a-button size="small" type="default" style="color: #ff4d4f" @click="removeAttributes(row, $index)">移除</a-button>
        </template>
      </a-table-column>
    </a-table>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" icon="plus" @click="openAttributesForm(null, -1)">添加属性</a-button>
    </div>

    <a-modal :visible.sync="propertyFormModelVisible" title="属性配置" width="600px" append-to-body destroy-on-close>
      <a-form :model="propertyForm" label-width="80px" size="small" ref="attributeFormRef" @submit.native.prevent>
        <a-form-item label="属性名：" dataIndex="name">
          <a-input v-model="propertyForm.name" allowClear />
        </a-form-item>
        <a-form-item label="属性值：" dataIndex="value">
          <a-input v-model="propertyForm.value" allowClear />
        </a-form-item>
      </a-form>
      <template slot="footer">
        <a-button size="small" @click="propertyFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveAttribute">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: "ElementProperties",
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: "prefix",
    width: "width"
  },
  data() {
    return {
      elementPropertyList: [],
      propertyForm: {},
      editingPropertyIndex: -1,
      propertyFormModelVisible: false
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.resetAttributesList();
      }
    }
  },
  methods: {
    resetAttributesList() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.otherExtensionList = []; // 其他扩展配置
      this.bpmnElementProperties =
        this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
          if (ex.$type !== `${this.prefix}:Properties`) {
            this.otherExtensionList.push(ex);
          }
          return ex.$type === `${this.prefix}:Properties`;
        }) ?? [];

      // 保存所有的 扩展属性字段
      this.bpmnElementPropertyList = this.bpmnElementProperties.reduce((pre, current) => pre.concat(current.values), []);
      // 复制 显示
      this.elementPropertyList = JSON.parse(JSON.stringify(this.bpmnElementPropertyList ?? []));
    },
    openAttributesForm(attr, index) {
      this.editingPropertyIndex = index;
      this.propertyForm = index === -1 ? {} : JSON.parse(JSON.stringify(attr));
      this.propertyFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["attributeFormRef"]) this.$refs["attributeFormRef"].clearValidate();
      });
    },
    removeAttributes(attr, index) {
      this.$confirm("确认移除该属性吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.elementPropertyList.splice(index, 1);
          this.bpmnElementPropertyList.splice(index, 1);
          // 新建一个属性字段的保存列表
          const propertiesObject = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {
            values: this.bpmnElementPropertyList
          });
          this.updateElementExtensions(propertiesObject);
          this.resetAttributesList();
        })
        .catch(() => console.info("操作取消"));
    },
    saveAttribute() {
      // 新建属性字段
      const newPropertyObject = window.bpmnInstances.moddle.create(`${this.prefix}:Property`, this.propertyForm);
      // 新建一个属性字段的保存列表
      const propertiesObject = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {
        values: this.bpmnElementPropertyList.concat([newPropertyObject])
      });

      this.updateElementExtensions(propertiesObject);
      this.propertyFormModelVisible = false;
      this.resetAttributesList();
    },
    updateElementExtensions(properties) {
      const extensions = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
        values: this.otherExtensionList.concat([properties])
      });
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      });
    }
  }
};
</script>
