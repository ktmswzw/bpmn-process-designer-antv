<template>
  <div class="panel-tab__content">
    <a-table :dataSource="elementListenersList" :columns="elementListenersColumns" size="small" bordered rowKey="id">
      <span slot="action" slot-scope="text, record, index">
          <a @click="openListenerForm(record, index)">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeListener(record, index)">
            <a>Del</a>
          </a-popconfirm>
        </span>
    </a-table>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" icon="plus" @click="openListenerForm(null)">添加监听器</a-button>
    </div>

    <!-- 监听器 编辑/创建 部分 -->
    <a-drawer :visible.sync="listenerFormModelVisible" title="执行监听器" width="450" placement="right" @close="onClose"
              :closable="true">
      <a-form-model size="small" :model="listenerForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" ref="listenerFormRef" @submit.native.prevent>
        <a-input type="hidden" v-model="listenerForm.id" />
        <a-form-model-item label="事件类型" prop="event">
          <a-select v-model="listenerForm.event">
            <a-select-option v-for="i in Object.keys(listenerEventTypeObject)" :key="i" :value="i">
              {{ listenerEventTypeObject[i] }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="监听器ID" prop="id">
          <a-input v-model="listenerForm.id" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="监听器类型" prop="listenerType">
          <a-select v-model="listenerForm.listenerType">
            <a-select-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :value="i">
              {{ listenerTypeObject[i] }}
            </a-select-option>
          </a-select>

        </a-form-model-item>
        <a-form-model-item
            v-if="listenerForm.listenerType === 'classListener'"
            label="Java类"
            prop="class"
            key="listener-class"

        >
          <a-input v-model="listenerForm.class" allowClear/>
        </a-form-model-item>
        <a-form-model-item
            v-if="listenerForm.listenerType === 'expressionListener'"
            label="表达式"
            prop="expression"
            key="listener-expression"

        >
          <a-input v-model="listenerForm.expression" allowClear/>
        </a-form-model-item>
        <a-form-model-item
            v-if="listenerForm.listenerType === 'delegateExpressionListener'"
            label="代理表达式"
            prop="delegateExpression"
            key="listener-delegate"

        >
          <a-input v-model="listenerForm.delegateExpression" allowClear/>
        </a-form-model-item>
        <template v-if="listenerForm.listenerType === 'scriptListener'">
          <a-form-model-item
              label="脚本格式"
              prop="scriptFormat"
              key="listener-script-format"
              :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
          >
            <a-input v-model="listenerForm.scriptFormat" allowClear/>
          </a-form-model-item>
          <a-form-model-item
              label="脚本类型"
              prop="scriptType"
              key="listener-script-type"
              :rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
          >
            <a-select v-model="listenerForm.scriptType">
              <a-select-option title="内联脚本" value="inlineScript">内联脚本</a-select-option>
              <a-select-option title="外部脚本" value="externalScript">外部脚本</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item
              v-if="listenerForm.scriptType === 'inlineScript'"
              label="脚本内容"
              prop="value"
              key="listener-script"
              :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
          >
            <a-input v-model="listenerForm.value" allowClear/>
          </a-form-model-item>
          <a-form-model-item
              v-if="listenerForm.scriptType === 'externalScript'"
              label="资源地址"
              prop="resource"
              key="listener-resource"
              :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
          >
            <a-input v-model="listenerForm.resource" allowClear/>
          </a-form-model-item>
        </template>

        <template v-if="listenerForm.event === 'timeout'">
          <a-form-model-item label="定时器类型" prop="eventDefinitionType" key="eventDefinitionType">
            <a-select v-model="listenerForm.eventDefinitionType">
              <a-select-option key="data" value="date" >日期</a-select-option>
              <a-select-option key="duration" value="duration">持续时长</a-select-option>
              <a-select-option key="cycle" value="cycle">循环</a-select-option>
              <a-select-option key="null" value="null">无</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item
              v-if="!!listenerForm.eventDefinitionType && listenerForm.eventDefinitionType !== 'null'"
              label="定时器"
              prop="eventTimeDefinitions"
              key="eventTimeDefinitions"
              :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写定时器配置' }"
          >
            <a-input v-model="listenerForm.eventTimeDefinitions" allowClear/>
          </a-form-model-item>
        </template>
      </a-form-model>

      <a-divider/>
      <a-row class="listener-filed__title">
        <a-col span="20"><span><a-icon type="appstore"/>注入字段：</span></a-col>
        <a-col span="4"><a @click="openListenerFieldForm(null)">添加字段</a></a-col>
      </a-row>
      <a-table :dataSource="fieldsListOfListener" rowKey="name" :columns="fieldsListColumns" size="small" bordered style="flex: none">
        <span slot="action" slot-scope="text, record, index">
          <a @click="openListenerFieldForm(record, index)">Edit</a>
          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => removeListenerField(record, index)">
            <a>Del</a>
          </a-popconfirm>
        </span>
      </a-table>

      <div class="element-drawer__button">
        <a-button size="small" @click="listenerFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerConfig">保 存</a-button>
      </div>
    </a-drawer>

    <!-- 注入西段 编辑/创建 部分 -->

    <!-- 注入西段 编辑/创建 部分 -->
    <a-modal title="字段配置" :visible.sync="listenerFieldFormModelVisible" :width="600" >
      <a-form-model :model="listenerFieldForm" size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }"
                    ref="listenerFieldFormRef"
                    style="height: 130px" @submit.native.prevent :rules="formRules">
        <a-form-model-item label="字段名称：" prop="name">
          <a-input v-model="listenerFieldForm.name" allowClear/>
        </a-form-model-item>
        <a-form-model-item label="字段类型：" prop="fieldType">
          <a-select v-model="listenerFieldForm.fieldType">
            <a-select-option v-for="i in Object.keys(fieldTypeObject)" :key="i" :value="i">{{ fieldTypeObject[i] }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item
            v-if="listenerFieldForm.fieldType === 'string'"
            label="字段值："
            prop="string"
            key="field-string"
        >
          <a-input v-model="listenerFieldForm.string" allowClear/>
        </a-form-model-item>
        <a-form-model-item
            v-if="listenerFieldForm.fieldType === 'expression'"
            label="表达式："
            prop="expression"
            key="field-expression"

        >
          <a-input v-model="listenerFieldForm.expression" allowClear/>
        </a-form-model-item>
      </a-form-model>
      <template slot="footer">
        <a-button size="small" @click="listenerFieldFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerFiled">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import {createListenerObject, updateElementExtensions, uuid} from "../../utils";
import {initListenerForm, initListenerType, eventType, listenerType, fieldType} from "./utilSelf";

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
      listenerFieldForm: {}, // 监听器 注入字段 详情表单
      formRules: {
        name: [
          {required: true, message: '请输入名称!'},
        ],
        fieldType: [
          {required: true, message: '请输入字段类型!'},
        ],
        string: [
          {required: true, message: '请输入字段值!'},
        ],
        expression: [
          {required: true, message: '请输入表达式!'},
        ],
      },
      elementListenersColumns: [
        {
          title: 'ID',
          dataIndex: 'id',
          width: 60,
          align: "center",
        },
        {
          title: '事件',
          align: "center",
          width: 150,
          dataIndex: 'event',
          customRender: (t, row, index) => {
            return eventType[row.event]
          }
        },
        {
          title: '类型',
          align: "center",
          width: 50,
          dataIndex: 'listenerType',
          customRender: (t, row, index) => {
            return listenerType[row.listenerType]
          }
        },
        {
          title: '值',
          align: "center",
          dataIndex: 'value',
          customRender: (t, row, index) => {
            if (row.listenerType === 'classListener')
              return row.class
            if (row.listenerType === 'expressionListener')
              return row.expression
            if (row.listenerType === 'delegateExpressionListener')
              return row.delegateExpression
            if (row.listenerType === "scriptListener") {
              if (row.scriptType === 'inlineScript')
                return row.scriptFormat + ' - ' + row.scriptType + ' - 1' + row.value
              if (row.scriptType === 'externalScript')
                return row.scriptFormat + ' - ' + row.scriptType + ' -2 ' + row.resource
            }
            if (row.event === 'timeout') {
              return row.eventDefinitionType + ' - ' + row.eventTimeDefinitions
            }
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 60,
          scopedSlots: {customRender: 'action'}
        }
      ],
      fieldsListColumns: [

        {
          title: '名称',
          align: "center",
          width: 60,
          dataIndex: 'name'
        },
        {
          title: '类型',
          align: "center",
          width: 60,
          dataIndex: 'fieldType',
          customRender: (t, row, index) => {
            return fieldType[row.fieldType]
          }
        },
        {
          title: '字段值/表达式',
          align: "center",
          dataIndex: 'string',
          customRender: function (t, row, index) {
            return row.string || row.expression
          }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          width: 100,
          scopedSlots: {customRender: 'action'}
        }
      ],
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
    onClose() {
      this.listenerFormModelVisible = false;
    },
    openListenerForm(listener, index) {
      if (listener) {
        this.listenerForm = initListenerForm(listener);
        this.editingListenerIndex = index;
      } else {
        this.listenerForm = {id: uuid()};
        this.editingListenerIndex = -1; // 标记为新增
      }
      if (listener && listener.fields) {
        this.fieldsListOfListener = listener.fields.map(field => ({
          ...field,
          fieldType: field.string ? "string" : "expression"
        }));
      } else {
        this.fieldsListOfListener = [];
        this.$set(this.listenerForm, "fields", []);
      }
      // 打开侧边栏并清楚验证状态
      this.listenerFormModelVisible = true;
    },
    // 移除监听器
    removeListener(listener, index) {
      this.$confirm({
        title: "提示",
        content: "确认移除该监听器吗",
        onOk: () => {
          this.bpmnElementListeners.splice(index, 1);
          this.elementListenersList.splice(index, 1);
          updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
        }
      })
    },
    // 保存监听器
    saveListenerConfig() {
      const that = this;
      this.$refs.listenerFormRef.validate(valid => {
        if (valid) {
          const listenerObject = createListenerObject(that.listenerForm, true, that.prefix);
          if (that.editingListenerIndex === -1) {
            that.bpmnElementListeners.push(listenerObject);
            that.elementListenersList.push(that.listenerForm);
          } else {
            that.bpmnElementListeners.splice(that.editingListenerIndex, 1, listenerObject);
            that.elementListenersList.splice(that.editingListenerIndex, 1, that.listenerForm);
          }
          // 保存其他配置
          that.otherExtensionList = that.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${that.prefix}:TaskListener`) ?? [];
          updateElementExtensions(that.bpmnElement, that.otherExtensionList.concat(that.bpmnElementListeners));
          // 4. 隐藏侧边栏
          that.listenerFormModelVisible = false;
          that.listenerForm = {};
        }
      })
    },
    // 打开监听器字段编辑弹窗
    openListenerFieldForm(field, index) {
      this.listenerFieldForm = field ? JSON.parse(JSON.stringify(field)) : {id: uuid()};
      this.editingListenerFieldIndex = field ? index : -1;
      this.listenerFieldFormModelVisible = true;
    },
    // 保存监听器注入字段
    saveListenerFiled() {
      const that = this;
      this.$refs.listenerFieldFormRef.validate(valid => {
        if (valid) {
          if (that.editingListenerFieldIndex === -1) {
            that.fieldsListOfListener.push(that.listenerFieldForm);
            that.listenerForm.fields.push(that.listenerFieldForm);
          } else {
            that.fieldsListOfListener.splice(that.editingListenerFieldIndex, 1, that.listenerFieldForm);
            that.listenerForm.fields.splice(that.editingListenerFieldIndex, 1, that.listenerFieldForm);
          }
          that.listenerFieldFormModelVisible = false;
          that.$nextTick(() => (that.listenerFieldForm = {}));
        }
      });
    },
    // 移除监听器字段
    removeListenerField(field, index) {
      this.$confirm({
        title: "提示",
        content: "确认移除该字段吗",
        onOk: () => {
          this.fieldsListOfListener.splice(index, 1);
          this.listenerForm.fields.splice(index, 1);
        }
      })
    }
  }
};
</script>
<style lang="css">
.ant-form-item {
  margin: 0 0 5px;
}
</style>