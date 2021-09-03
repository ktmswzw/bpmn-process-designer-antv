export const template = isTaskListener => {
  return `
  <div class="panel-tab__content">
    <a-table :dataSource="elementListenersList" size="small" border>
      <a-table-column label="序号" width="50px" type="index" />
      <a-table-column label="事件类型" min-width="100px" dataIndex="event" />
      <a-table-column label="监听器类型" min-width="100px" show-overflow-tooltip :formatter="row => listenerTypeObject[row.listenerType]" />
      <a-table-column label="操作" width="90px">
        <template slot-scope="{ row, $index }">
          <a-button size="small" type="text" @click="openListenerForm(row, $index)">编辑</a-button>
          <a-divider direction="vertical" />
          <a-button size="small" type="text" style="color: #ff4d4f" @click="removeListener(row, $index)">移除</a-button>
        </template>
      </a-table-column>
    </a-table>
    <div class="element-drawer__button">
      <el-button size="small" type="primary" icon="plus" @click="openListenerForm(null)">添加监听器</el-button>
    </div>

    <!-- 监听器 编辑/创建 部分 -->
    <a-drawer :visible.sync="listenerFormModelVisible" title="执行监听器" :size="width + 'px'" append-to-body destroy-on-close>
      <a-form size="small" :model="listenerForm" label-width="96px" ref="listenerFormRef" @submit.native.prevent>
        <a-form-item label="事件类型" dataIndex="event" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.event">
            <a-select-option title="start" value="start" />
            <a-select-option title="end" value="end" />
          </a-select>
        </a-form-item>
        <a-form-item label="监听器类型" dataIndex="listenerType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.listenerType">
            <a-select-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :title="listenerTypeObject[i]" :value="i" />
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
          <el-input v-model="listenerForm.expression" allowClear />
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'delegateExpressionListener'"
          label="代理表达式"
          dataIndex="delegateExpression"
          key="listener-delegate"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <el-input v-model="listenerForm.delegateExpression" allowClear />
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
              <a-select-option title="内联脚本" value="inlineScript" />
              <a-select-option title="外部脚本" value="externalScript" />
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
        ${
          isTaskListener
            ? "<a-form-item label='定时器类型' prop='eventDefinitionType' key='eventDefinitionType'>" +
              "<a-select v-model='listenerForm.eventDefinitionType'>" +
              "<a-option label='日期' value='date' />" +
              "<a-option label='持续时长' value='duration' />" +
              "<a-option label='循环' value='cycle' />" +
              "<a-option label='无' value='' />" +
              "</a-select>" +
              "</a-form-item>" +
              "<a-form-item v-if='!!listenerForm.eventDefinitionType' label='定时器' prop='eventDefinitions' key='eventDefinitions'>" +
              "<a-input v-model='listenerForm.eventDefinitions' allowClear />" +
              "</a-form-item>"
            : ""
        }
      </a-form>
      <a-divider />
      <p class="listener-filed__title">
        <span><i class="el-icon-menu"></i>注入字段：</span>
        <a-button size="small" type="primary" @click="openListenerFieldForm(null)">添加字段</a-button>
      </p>
      <a-table :dataSource="fieldsListOfListener" size="small" max-height="240" border fit style="flex: none">
        <a-table-column label="序号" width="50px" type="index" />
        <a-table-column label="字段名称" min-width="100px" dataIndex="name" />
        <a-table-column label="字段类型" min-width="80px" show-overflow-tooltip :formatter="row => fieldTypeObject[row.fieldType]" />
        <a-table-column label="字段值/表达式" min-width="100px" show-overflow-tooltip :formatter="row => row.string || row.expression" />
        <a-table-column label="操作" width="100px">
          <template slot-scope="{ row, $index }">
            <a-button size="small" type="text" @click="openListenerFieldForm(row, $index)">编辑</a-button>
            <a-divider direction="vertical" />
            <el-button size="small" type="text" style="color: #ff4d4f" @click="removeListenerField(row, $index)">移除</el-button>
          </template>
        </a-table-column>
      </a-table>

      <div class="element-drawer__button">
        <a-button size="small" @click="listenerFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerConfig">保 存</a-button>
      </div>
    </a-drawer>

    <!-- 注入西段 编辑/创建 部分 -->
    <a-model title="字段配置" :visible.sync="listenerFieldFormModelVisible" width="600px" append-to-body destroy-on-close>
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
    </a-model>
  </div>
  `;
};
