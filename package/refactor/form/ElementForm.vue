<template>
  <div class="panel-tab__content">
    <a-form-model size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" @submit.native.prevent>
      <a-form-model-item label="表单标识">
        <a-input v-model="formKey" allowClear @change="updateElementFormKey"/>
      </a-form-model-item>
      <a-form-model-item label="业务标识">
        <a-select @change="updateElementBusinessKey" placeholder="请选择业务标识" :trigger-change="true">
          <a-select-option v-for="(item) in fieldList" :key="item.id" :value="item.id">
              <span style="display: inline-block;width: 100%" :title=" item.name">
                {{ item.label}}
              </span>
          </a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>

    <!--字段列表-->
    <div class="element-property list-property">
      <a-table :dataSource="fieldList" rowKey="label" :columns="fieldColumns" size="small"  bordered>
        <span slot="action" slot-scope="text, record, index">
          <a @click="openFieldForm(record, index)">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeField(record, index)">
            <a>Del</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" icon="plus" @click="openFieldForm(null, -1)">添加字段</a-button>
    </div>

    <!--字段配置侧边栏-->
    <a-drawer :visible.sync="fieldModelVisible" title="字段配置" width="450" placement="right" @close="onClose"
              :closable="true">
      <a-form-model :model="formFieldForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" size="small"
                    @submit.native.prevent>
        <a-form-model-item label="字段ID">
          <a-input v-model="formFieldForm.id" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="类型">
          <a-select v-model="formFieldForm.typeType" placeholder="请选择字段类型" allowClear @change="changeFieldTypeType">
              <a-select-option v-for="(value, key) of fieldType" :value="key" :key="key">{{ value }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="类型名称" v-if="formFieldForm.typeType === 'custom'">
          <a-input v-model="formFieldForm.type" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="名称">
          <a-input v-model="formFieldForm.label" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="时间格式" v-if="formFieldForm.typeType === 'date'">
          <a-input v-model="formFieldForm.datePattern" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="默认值">
          <a-input v-model="formFieldForm.defaultValue" allowClear/>
        </a-form-model-item>
      </a-form-model>

      <!-- 枚举值设置 -->
      <template v-if="formFieldForm.type === 'enum'">
        <a-divider key="enum-divider"/>
        <a-row class="listener-filed__title"  key="enum-title">
          <a-col span="20"><span><a-icon type="appstore"/>枚举值列表：</span></a-col>
          <a-col span="4"><a @click="openFieldOptionForm(null, -1, 'enum')">添加枚举值</a></a-col>
        </a-row>
        <a-table :dataSource="fieldEnumList" :columns="fieldEnumColumns" rowKey="id" size="small" key="enum-table"  bordered>
          <span slot="action" slot-scope="text, record, index">
          <a @click="openFieldOptionForm(record, index, 'enum')">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeFieldOptionItem(record, index, 'enum')">
            <a>Del</a>
          </a-popconfirm>
        </span>
        </a-table>
      </template>

      <!-- 校验规则 -->
      <a-divider key="validation-divider"/>
      <a-row class="listener-filed__title"  key="validation-title">
        <a-col span="20"><span><a-icon type="appstore"/>约束条件列表：</span></a-col>
        <a-col span="4"><a @click="openFieldOptionForm(null, -1, 'constraint')">添加约束</a></a-col>
      </a-row>
      <a-table :dataSource="fieldConstraintsList" rowKey="name"   :columns="fieldConstraintsColumns" size="small" key="validation-table" bordered>
        <span slot="action" slot-scope="text, record, index">
          <a @click="openFieldOptionForm(record, index, 'constraint')">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeFieldOptionItem(record, index, 'constraint')">
            <a>Del</a>
          </a-popconfirm>
        </span>
      </a-table>

      <!-- 表单属性 -->
      <a-divider key="property-divider"/>
      <a-row class="listener-filed__title"  key="property-title">
        <a-col span="20"><span><a-icon type="appstore"/>字段属性列表：</span></a-col>
        <a-col span="4"><a @click="openFieldOptionForm(null, -1, 'property')">添加属性</a></a-col>
      </a-row>
      <a-table :dataSource="fieldPropertiesList" rowKey="id"  :columns="fieldPropertiesColumns"  size="small" key="property-table" bordered>
        <span slot="action" slot-scope="text, record, index">
          <a @click="openFieldOptionForm(record, index, 'property')">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeFieldOptionItem(record, index, 'property')">
            <a>Del</a>
          </a-popconfirm>
        </span>
      </a-table>

      <!-- 底部按钮 -->
      <div class="element-drawer__button">
        <a-button size="small">取 消</a-button>
        <a-button size="small" type="primary" @click="saveField">保 存</a-button>
      </div>
    </a-drawer>

    <a-modal :visible.sync="fieldOptionModelVisible" :title="optionModelTitle" :width="600"
             >
      <a-form-model :model="fieldOptionForm" size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" @submit.native.prevent>
        <a-form-model-item label="编号/ID" v-if="fieldOptionType !== 'constraint'" key="option-id">
          <a-input v-model="fieldOptionForm.id" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="名称" v-if="fieldOptionType !== 'property'" key="option-name">
          <a-input v-model="fieldOptionForm.name" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="配置" v-if="fieldOptionType === 'constraint'" key="option-config">
          <a-input v-model="fieldOptionForm.config" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="值" v-if="fieldOptionType === 'property'" key="option-value">
          <a-input v-model="fieldOptionForm.value" allowClear/>
        </a-form-model-item>
      </a-form-model>
      <template slot="footer">
        <a-button size="small" @click="fieldOptionModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveFieldOption">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>

export default {
  name: "ElementForm",
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
      formKey: "",
      businessKey: "",
      optionModelTitle: "",
      fieldList: [],
      formFieldForm: {},
      fieldType: {
        long: "长整型",
        string: "字符串",
        boolean: "布尔类",
        date: "日期类",
        enum: "枚举类",
        custom: "自定义类型"
      },
      formFieldIndex: -1, // 编辑中的字段， -1 为新增
      formFieldOptionIndex: -1, // 编辑中的字段配置项， -1 为新增
      fieldModelVisible: false,
      fieldOptionModelVisible: false,
      fieldOptionForm: {}, // 当前激活的字段配置项数据
      fieldOptionType: "", // 当前激活的字段配置项弹窗 类型
      fieldEnumList: [], // 枚举值列表
      fieldConstraintsList: [], // 约束条件列表
      fieldPropertiesList: [], // 绑定属性列表,
      fieldColumns: [
        {
          title: '名称',
          align: "center",
          width: 60,
          dataIndex: 'label'
        },
        {
          title: '类型',
          align: "center",
          width: 197,
          dataIndex: 'type',
          customRender: (t, row, index) => {
            return this.fieldType[row.type]
          }
        },
        {
          title: '默认值',
          align: "center",
          width: 80,
          dataIndex: 'defaultValue'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 80,
          scopedSlots: {customRender: 'action'}
        }
      ],
      fieldPropertiesColumns: [
        {
          title: '属性编号',
          align: "center",
          dataIndex: 'id'
        },
        {
          title: '属性值',
          align: "center",
          dataIndex: 'value'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 80,
          scopedSlots: {customRender: 'action'}
        }
      ],
      fieldConstraintsColumns: [
        {
          title: '约束名称',
          align: "center",
          dataIndex: 'name'
        },
        {
          title: '约束配置',
          align: "center",
          dataIndex: 'config'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 80,
          scopedSlots: {customRender: 'action'}
        }
      ],
      fieldEnumColumns: [
        {
          title: '枚举值编号',
          align: "center",
          dataIndex: 'id'
        },
        {
          title: '枚举值名称',
          align: "center",
          dataIndex: 'name'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 80,
          scopedSlots: {customRender: 'action'}
        }
      ],
      bpmnELement: {},
      elExtensionElements: {},
      otherExtensions: {},
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.$nextTick(() => this.resetFormList());
      }
    }
  },
  methods: {
    resetFormList() {
      this.bpmnELement = window.bpmnInstances.bpmnElement;
      this.formKey = this.bpmnELement.businessObject.formKey;
      // 获取元素扩展属性 或者 创建扩展属性
      if (this.bpmnELement.businessObject.get("extensionElements")) {
        this.elExtensionElements = this.bpmnELement.businessObject.get("extensionElements")
      } else {
        this.elExtensionElements = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {values: []})
      }

      const bpmnType = `${this.prefix}:FormData`

      // 获取元素表单配置 或者 创建新的表单配置
      this.formData = this.elExtensionElements.values.filter(ex => ex.$type === bpmnType)?.[0] || window.bpmnInstances.moddle.create(bpmnType, {fields: []});

      // 业务标识 businessKey， 绑定在 formData 中
      this.businessKey = this.formData.businessKey;

      // 保留剩余扩展元素，便于后面更新该元素对应属性
      this.otherExtensions = this.elExtensionElements.values.filter(ex => ex.$type !== bpmnType);

      // 复制原始值，填充表格
      this.fieldList = JSON.parse(JSON.stringify(this.formData.fields || []));
      // 更新元素扩展属性，避免后续报错
      this.updateElementExtensions();
    },
    updateElementFormKey() {
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, {formKey: this.formKey});
    },
    onClose() {
      this.fieldModelVisible = false;
    },
    updateElementBusinessKey() {
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnELement, this.formData, {businessKey: this.businessKey});
    },
    // 根据类型调整字段type
    changeFieldTypeType(type) {
      this.$set(this.formFieldForm, "type", type === "custom" ? "" : type);
    },

    // 打开字段详情侧边栏
    openFieldForm(field, index) {
      this.formFieldIndex = index;
      if (index !== -1) {
        const FieldObject = this.formData.fields[index];
        this.formFieldForm = JSON.parse(JSON.stringify(field));
        // 设置自定义类型
        this.$set(this.formFieldForm, "typeType", !this.fieldType[field.type] ? "custom" : field.type);
        // 初始化枚举值列表
        field.type === "enum" && (this.fieldEnumList = JSON.parse(JSON.stringify(FieldObject?.values || [])));
        // 初始化约束条件列表
        this.fieldConstraintsList = JSON.parse(JSON.stringify(FieldObject?.validation?.constraints || []));
        // 初始化自定义属性列表
        this.fieldPropertiesList = JSON.parse(JSON.stringify(FieldObject?.properties?.values || []));
      } else {
        this.formFieldForm = {};
        // 初始化枚举值列表
        this.fieldEnumList = [];
        // 初始化约束条件列表
        this.fieldConstraintsList = [];
        // 初始化自定义属性列表
        this.fieldPropertiesList = [];
      }
      this.fieldModelVisible = true;
    },
    // 打开字段 某个 配置项 弹窗
    openFieldOptionForm(option, index, type) {
      this.fieldOptionModelVisible = true;
      this.fieldOptionType = type;
      this.formFieldOptionIndex = index;
      if (type === "property") {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = "属性配置");
      }
      if (type === "enum") {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = "枚举值配置");
      }
      if (type === "constraint") {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = "约束条件配置");
      }
    },

    // 保存字段 某个 配置项
    saveFieldOption() {
      if (this.formFieldOptionIndex === -1) {
        if (this.fieldOptionType === "property") {
          this.fieldPropertiesList.push(this.fieldOptionForm);
        }
        if (this.fieldOptionType === "constraint") {
          this.fieldConstraintsList.push(this.fieldOptionForm);
        }
        if (this.fieldOptionType === "enum") {
          this.fieldEnumList.push(this.fieldOptionForm);
        }
      } else {
        this.fieldOptionType === "property" && this.fieldPropertiesList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
        this.fieldOptionType === "constraint" && this.fieldConstraintsList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
        this.fieldOptionType === "enum" && this.fieldEnumList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
      }
      this.fieldOptionModelVisible = false;
      this.fieldOptionForm = {};
    },
    // 保存字段配置
    saveField() {
      const {id, type, label, defaultValue, datePattern} = this.formFieldForm;
      const Field = window.bpmnInstances.moddle.create(`${this.prefix}:FormField`, {id, type, label});
      defaultValue && (Field.defaultValue = defaultValue);
      datePattern && (Field.datePattern = datePattern);
      // 构建属性
      if (this.fieldPropertiesList && this.fieldPropertiesList.length) {
        const fieldPropertyList = this.fieldPropertiesList.map(fp => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Property`, {id: fp.id, value: fp.value});
        });
        Field.properties = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {values: fieldPropertyList});
      }
      // 构建校验规则
      if (this.fieldConstraintsList && this.fieldConstraintsList.length) {
        const fieldConstraintList = this.fieldConstraintsList.map(fc => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Constraint`, {name: fc.name, config: fc.config});
        });
        Field.validation = window.bpmnInstances.moddle.create(`${this.prefix}:Validation`, {constraints: fieldConstraintList});
      }
      // 构建枚举值
      if (this.fieldEnumList && this.fieldEnumList.length) {
        Field.values = this.fieldEnumList.map(fe => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Value`, {name: fe.name, id: fe.id});
        });
      }
      // 更新数组 与 表单配置实例
      if (this.formFieldIndex === -1) {
        this.fieldList.push(this.formFieldForm);
        this.formData.fields.push(Field);
      } else {
        this.fieldList.splice(this.formFieldIndex, 1, this.formFieldForm);
        this.formData.fields.splice(this.formFieldIndex, 1, Field);
      }
      this.updateElementExtensions();
      this.fieldModelVisible = false;
    },

    // 移除某个 字段的 配置项
    removeFieldOptionItem(option, index, type) {
      if (type === "property") {
        this.fieldPropertiesList.splice(index, 1);
        return;
      }
      if (type === "enum") {
        this.fieldEnumList.splice(index, 1);
        return;
      }
      this.fieldConstraintsList.splice(index, 1);
    },
    // 移除 字段
    removeField(field, index) {
      this.fieldList.splice(index, 1);
      this.formData.fields.splice(index, 1);
      this.updateElementExtensions();
    },

    updateElementExtensions() {
      // 更新回扩展元素
      const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
        values: this.otherExtensions.concat(this.formData)
      });
      // 更新到元素上
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, {
        extensionElements: newElExtensionElements
      });
    }
  }
};
</script>
