<template>
  <div class="panel-tab__content">
    <a-table :dataSource="elementPropertyList" rowKey="name"  :columns="propertyColumns" size="small" bordered>
      <span slot="action" slot-scope="text, record, index">
          <a @click="openAttributesForm(record, index)">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeAttributes(record, index)">
            <a>Del</a>
          </a-popconfirm>
        </span>
    </a-table>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" icon="plus" @click="openAttributesForm(null, -1)">添加属性</a-button>
    </div>

    <a-modal :visible.sync="propertyFormModelVisible" title="属性配置" :width="600" >
      <a-form-model :model="propertyForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" size="small"
                    ref="attributeFormRef" @submit.native.prevent>
        <a-form-model-item label="属性名：" prop="name">
          <a-input v-model="propertyForm.name" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="属性值：" prop="value">
          <a-input v-model="propertyForm.value" allowClear/>
        </a-form-model-item>
      </a-form-model>
      <template slot="footer">
        <a-button size="small" @click="propertyFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveAttribute">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import {listenerType} from "../listeners/utilSelf";
import {uuid} from "../../utils";

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
      propertyFormModelVisible: false,
      propertyColumns: [
        {
          title: 'ID',
          dataIndex: 'id',
          key: 'rowIndex',
          width: 40,
          align: "center",
          customRender: function (t, r, index) {
            return parseInt(index) + 1;
          }
        },
        {
          title: '属性名',
          align: "center",
          width: 60,
          dataIndex: 'name'
        },
        {
          title: '属性值',
          align: "center",
          width: 60,
          dataIndex: 'value'
        },
      ]
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
          this.bpmnElement.businessObject.extensionElements.values ?this.bpmnElement.businessObject.extensionElements.values.filter(ex => {
            if (ex.$type !== `${this.prefix}:Properties`) {
              this.otherExtensionList.push(ex);
            }
            return ex.$type === `${this.prefix}:Properties`;
          }) : [];

      // 保存所有的 扩展属性字段
      this.bpmnElementPropertyList = this.bpmnElementProperties.reduce((pre, current) => pre.concat(current.values), []);
      // 复制 显示
      this.elementPropertyList = JSON.parse(JSON.stringify(this.bpmnElementPropertyList ? this.bpmnElementPropertyList : []));
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
      this.$confirm({
        title: '提示',
        content: "确认移除该属性吗？",
        onOk: () => {
          this.elementPropertyList.splice(index, 1);
          this.bpmnElementPropertyList.splice(index, 1);
          // 新建一个属性字段的保存列表
          const propertiesObject = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {
            values: this.bpmnElementPropertyList
          });
          this.updateElementExtensions(propertiesObject);
          this.resetAttributesList();
        }
      })
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
