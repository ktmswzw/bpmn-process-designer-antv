<template>
  <div class="panel-tab__content">
    <a-table :dataSource="elementListenersList" size="small" border>
      <a-table-column title="#"  :width="50">
        <template slot-scope="t,r,i" >
          <span> {{i+1}} </span>
        </template>
      </a-table-column>
      <a-table-column title="事件类型" min-width="80px" show-overflow-tooltip :formatter="row => listenerEventTypeObject[row.event]" />
      <a-table-column title="事件id" min-width="80px" dataIndex="id" show-overflow-tooltip />
      <a-table-column title="监听器类型" min-width="80px" show-overflow-tooltip :formatter="row => listenerTypeObject[row.listenerType]" />
      <a-table-column title="操作" width="90px">
        <template slot-scope="{ row, $index }">
          <a-button size="small" type="default" @click="openListenerForm(row, $index)">编辑</a-button>
          <a-divider direction="vertical" />
          <a-button size="small" type="default" style="color: #ff4d4f" @click="removeListener(row, $index)">移除</a-button>
        </template>
      </a-table-column>
    </a-table>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" icon="plus" @click="openListenerForm(null)">添加监听器</a-button>
    </div>

    <!-- 监听器 编辑/创建 部分 -->
    <a-drawer :visible.sync="listenerFormModelVisible" title="任务监听器" :size="`${width}px`" append-to-body destroy-on-close>
      <a-form size="small" :model="listenerForm" label-width="96px" ref="listenerFormRef" @submit.native.prevent>
        <a-form-item label="事件类型" dataIndex="event" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.event">
            <a-select-option v-for="i in Object.keys(listenerEventTypeObject)" :key="i" :label="listenerEventTypeObject[i]" :value="i" />
          </a-select>
        </a-form-item>
        <a-form-item label="监听器ID" dataIndex="id" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-input v-model="listenerForm.id" allowClear />
        </a-form-item>
        <a-form-item label="监听器类型" dataIndex="listenerType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.listenerType">
            <a-select-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :label="listenerTypeObject[i]" :value="i" />
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'classListener'"
          label="Java类"
          dataIndex="class"
          key="listener-class"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model="listenerForm.class" allowClear />
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'expressionListener'"
          label="表达式"
          dataIndex="expression"
          key="listener-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model="listenerForm.expression" allowClear />
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'delegateExpressionListener'"
          label="代理表达式"
          dataIndex="delegateExpression"
          key="listener-delegate"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model="listenerForm.delegateExpression" allowClear />
        </a-form-item>
        <template v-if="listenerForm.listenerType === 'scriptListener'">
          <a-form-item
            label="脚本格式"
            dataIndex="scriptFormat"
            key="listener-script-format"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
          >
            <a-input v-model="listenerForm.scriptFormat" allowClear />
          </a-form-item>
          <a-form-item
            label="脚本类型"
            dataIndex="scriptType"
            key="listener-script-type"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
          >
            <a-select v-model="listenerForm.scriptType">
              <a-select-option label="内联脚本" value="inlineScript" />
              <a-select-option label="外部脚本" value="externalScript" />
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="listenerForm.scriptType === 'inlineScript'"
            label="脚本内容"
            dataIndex="value"
            key="listener-script"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
          >
            <a-input v-model="listenerForm.value" allowClear />
          </a-form-item>
          <a-form-item
            v-if="listenerForm.scriptType === 'externalScript'"
            label="资源地址"
            dataIndex="resource"
            key="listener-resource"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
          >
            <a-input v-model="listenerForm.resource" allowClear />
          </a-form-item>
        </template>

        <template v-if="listenerForm.event === 'timeout'">
          <a-form-item label="定时器类型" dataIndex="eventDefinitionType" key="eventDefinitionType">
            <a-select v-model="listenerForm.eventDefinitionType">
              <a-select-option label="日期" value="date" />
              <a-select-option label="持续时长" value="duration" />
              <a-select-option label="循环" value="cycle" />
              <a-select-option label="无" value="null" />
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="!!listenerForm.eventDefinitionType && listenerForm.eventDefinitionType !== 'null'"
            label="定时器"
            dataIndex="eventTimeDefinitions"
            key="eventTimeDefinitions"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写定时器配置' }"
          >
            <a-input v-model="listenerForm.eventTimeDefinitions" allowClear />
          </a-form-item>
        </template>
      </a-form>

      <a-divider />
      <p class="listener-filed__title">
        <span><i class="el-icon-menu"></i>注入字段：</span>
        <a-button size="small" type="primary" @click="openListenerFieldForm(null)">添加字段</a-button>
      </p>
      <a-table :dataSource="fieldsListOfListener" size="small" max-height="240" bordered fit style="flex: none">
        <a-table-column title="#"  :width="50">
          <template slot-scope="t,r,i" >
            <span> {{i+1}} </span>
          </template>
        </a-table-column>
        <a-table-column title="字段名称" width="100" dataIndex="name" />
        <a-table-column title="字段类型" min-width="80px" show-overflow-tooltip :formatter="row => fieldTypeObject[row.fieldType]" />
        <a-table-column title="字段值/表达式" width="100" show-overflow-tooltip :formatter="row => row.string || row.expression" />
        <a-table-column title="操作" width="100px">
          <template slot-scope="{ row, $index }">
            <a-button size="small" type="default" @click="openListenerFieldForm(row, $index)">编辑</a-button>
            <a-divider direction="vertical" />
            <a-button size="small" type="default" style="color: #ff4d4f" @click="removeListenerField(row, $index)">移除</a-button>
          </template>
        </a-table-column>
      </a-table>

      <div class="element-drawer__button">
        <a-button size="small" @click="listenerFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerConfig">保 存</a-button>
      </div>
    </a-drawer>

    <!-- 注入西段 编辑/创建 部分 -->
    <a-modal title="字段配置" :visible.sync="listenerFieldFormModelVisible" width="600px" append-to-body destroy-on-close>
      <a-form :model="listenerFieldForm" size="small" label-width="96px" ref="listenerFieldFormRef" style="height: 136px" @submit.native.prevent>
        <a-form-item label="字段名称：" dataIndex="name" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-input v-model="listenerFieldForm.name" allowClear />
        </a-form-item>
        <a-form-item label="字段类型：" dataIndex="fieldType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerFieldForm.fieldType">
            <a-select-option v-for="i in Object.keys(fieldTypeObject)" :key="i" :label="fieldTypeObject[i]" :value="i" />
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="listenerFieldForm.fieldType === 'string'"
          label="字段值："
          dataIndex="string"
          key="field-string"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model="listenerFieldForm.string" allowClear />
        </a-form-item>
        <a-form-item
          v-if="listenerFieldForm.fieldType === 'expression'"
          label="表达式："
          dataIndex="expression"
          key="field-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model="listenerFieldForm.expression" allowClear />
        </a-form-item>
      </a-form>
      <template slot="footer">
        <a-button size="small" @click="listenerFieldFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerFiled">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import { createListenerObject, updateElementExtensions } from "../../utils";
import { initListenerForm, initListenerType, eventType, listenerType, fieldType } from "./utilSelf";

export default {
  name: "UserTaskListeners",
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
      elementListenersList: [],
      listenerEventTypeObject: eventType,
      listenerTypeObject: listenerType,
      listenerFormModelVisible: false,
      listenerForm: {},
      fieldTypeObject: fieldType,
      fieldsListOfListener: [],
      listenerFieldFormModelVisible: false, // 监听器 注入字段表单弹窗 显示状态
      editingListenerIndex: -1, // 监听器所在下标，-1 为新增
      editingListenerFieldIndex: -1, // 字段所在下标，-1 为新增
      listenerFieldForm: {} // 监听器 注入字段 详情表单
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.$nextTick(() => this.resetListenersList());
      }
    }
  },
  methods: {
    resetListenersList() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.otherExtensionList = [];
      this.bpmnElementListeners = this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type === `${this.prefix}:TaskListener`) ?? [];
      this.elementListenersList = this.bpmnElementListeners.map(listener => initListenerType(listener));
    },
    openListenerForm(listener, index) {
      if (listener) {
        this.listenerForm = initListenerForm(listener);
        this.editingListenerIndex = index;
      } else {
        this.listenerForm = {};
        this.editingListenerIndex = -1; // 标记为新增
      }
      if (listener && listener.fields) {
        this.fieldsListOfListener = listener.fields.map(field => ({ ...field, fieldType: field.string ? "string" : "expression" }));
      } else {
        this.fieldsListOfListener = [];
        this.$set(this.listenerForm, "fields", []);
      }
      // 打开侧边栏并清楚验证状态
      this.listenerFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["listenerFormRef"]) this.$refs["listenerFormRef"].clearValidate();
      });
    },
    // 移除监听器
    removeListener(listener, index) {
      this.$confirm("确认移除该监听器吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.bpmnElementListeners.splice(index, 1);
          this.elementListenersList.splice(index, 1);
          updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
        })
        .catch(() => console.info("操作取消"));
    },
    // 保存监听器
    async saveListenerConfig() {
      let validateStatus = await this.$refs["listenerFormRef"].validate();
      if (!validateStatus) return; // 验证不通过直接返回
      const listenerObject = createListenerObject(this.listenerForm, true, this.prefix);
      if (this.editingListenerIndex === -1) {
        this.bpmnElementListeners.push(listenerObject);
        this.elementListenersList.push(this.listenerForm);
      } else {
        this.bpmnElementListeners.splice(this.editingListenerIndex, 1, listenerObject);
        this.elementListenersList.splice(this.editingListenerIndex, 1, this.listenerForm);
      }
      // 保存其他配置
      this.otherExtensionList = this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${this.prefix}:TaskListener`) ?? [];
      updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
      // 4. 隐藏侧边栏
      this.listenerFormModelVisible = false;
      this.listenerForm = {};
    },
    // 打开监听器字段编辑弹窗
    openListenerFieldForm(field, index) {
      this.listenerFieldForm = field ? JSON.parse(JSON.stringify(field)) : {};
      this.editingListenerFieldIndex = field ? index : -1;
      this.listenerFieldFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["listenerFieldFormRef"]) this.$refs["listenerFieldFormRef"].clearValidate();
      });
    },
    // 保存监听器注入字段
    async saveListenerFiled() {
      let validateStatus = await this.$refs["listenerFieldFormRef"].validate();
      if (!validateStatus) return; // 验证不通过直接返回
      if (this.editingListenerFieldIndex === -1) {
        this.fieldsListOfListener.push(this.listenerFieldForm);
        this.listenerForm.fields.push(this.listenerFieldForm);
      } else {
        this.fieldsListOfListener.splice(this.editingListenerFieldIndex, 1, this.listenerFieldForm);
        this.listenerForm.fields.splice(this.editingListenerFieldIndex, 1, this.listenerFieldForm);
      }
      this.listenerFieldFormModelVisible = false;
      this.$nextTick(() => (this.listenerFieldForm = {}));
    },
    // 移除监听器字段
    removeListenerField(field, index) {
      this.$confirm("确认移除该字段吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.fieldsListOfListener.splice(index, 1);
          this.listenerForm.fields.splice(index, 1);
        })
        .catch(() => console.info("操作取消"));
    }
  }
};
</script>
