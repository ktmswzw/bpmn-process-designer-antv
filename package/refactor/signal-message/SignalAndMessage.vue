<template>
  <div class="panel-tab__content">
    <div class="panel-tab__content--title">
      <span><a-icon type="bars" />消息列表</span>
      <a-button size="small" type="primary" icon="plus" @click="openModel('message')">创建新消息</a-button>
    </div>
    <a-table :dataSource="messageList" size="small" bordered rowKey="id">
      <a-table-column title="#"  :width="50">
        <template slot-scope="t,r,i" >
          <span> {{i+1}} </span>
        </template>
      </a-table-column>
      <a-table-column title="消息ID" dataIndex="id" :width="100" />
      <a-table-column title="消息名称" dataIndex="name" :width="150" />
<!--      <a-table-column title="操作" dataIndex="" :width="50">-->
<!--        <template slot-scope="t,r" >-->
<!--          <a-popconfirm title="确定删除吗?" @confirm="() => remove(r)">-->
<!--            <a style="color: red;">删除</a>-->
<!--          </a-popconfirm>-->
<!--        </template>-->
<!--      </a-table-column>-->
    </a-table>
    <div class="panel-tab__content--title" style="padding-top: 8px; margin-top: 8px; border-top: 1px solid #eeeeee">
      <span><a-icon type="bars" />信号列表</span>
      <a-button size="small" type="primary" icon="plus" @click="openModel('signal')">创建新信号</a-button>
    </div>
    <a-table :dataSource="signalList" size="small" bordered rowKey="id">
      <a-table-column title="#"  :width="50">
        <template slot-scope="t,r,i" >
          <span> {{i+1}} </span>
        </template>
      </a-table-column>
      <a-table-column title="信号ID" dataIndex="id" :width="150" />
      <a-table-column title="信号名称" dataIndex="name" :width="150" />
    </a-table>

    <a-modal :visible.sync="modelVisible" :title="modelConfig.title" :close-on-click-modal="false" :width="400" >
      <a-form-model ref="form" :model="modelObjectForm" size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" @submit.native.prevent :rules="formRules">
        <a-form-model-item :label="modelConfig.idLabel" prop="id">
          <a-input v-model="modelObjectForm.id" allowClear />
        </a-form-model-item>
        <a-form-model-item :label="modelConfig.nameLabel" prop="name">
          <a-input v-model="modelObjectForm.name" allowClear />
        </a-form-model-item>
      </a-form-model>
      <template slot="footer">
        <a-button size="small" @click="modelVisible = false">取 消</a-button>
        <a-button size="small" type="default" @click="addNewObject">保 存</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
export default {
  name: "SignalAndMassage",
  data() {
    return {
      signalList: [],
      messageList: [],
      modelVisible: false,
      modelType: "",
      modelObjectForm: {},
      formRules: {
        name: [
          { required: true, message: '请输入名称!'},
        ],
        id: [
          { required: true, message: '请输入Id!'},
        ],
      },
    };
  },
  computed: {
    modelConfig() {
      if (this.modelType === "message") {
        return { title: "创建消息", idLabel: "消息ID", nameLabel: "消息名称" };
      } else {
        return { title: "创建信号", idLabel: "信号ID", nameLabel: "信号名称" };
      }
    }
  },
  mounted() {
    this.initDataList();
  },
  methods: {
    initDataList() {
      this.rootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
      this.messageIdMap = {};
      this.signalIdMap = {};
      this.messageList = [];
      this.signalList = [];
      this.rootElements.forEach(el => {
        if (el.$type === "bpmn:Message") {
          this.messageIdMap[el.id] = true;
          this.messageList.push({ ...el });
        }
        if (el.$type === "bpmn:Signal") {
          this.signalIdMap[el.id] = true;
          this.signalList.push({ ...el });
        }
      });
    },
    remove(v) {
      this.messageList.forEach(el => {
        if (el.id === v.id) {
          this.messageList.remove(v)
        }
      });
    },
    openModel(type) {
      this.modelType = type;
      this.modelObjectForm = {};
      this.modelVisible = true;
    },
    addNewObject() {
      this.$refs.form.validate(valid => {
        const that = this;
        if (valid) {
          if (that.modelType === "message") {
            if (that.messageIdMap[that.modelObjectForm.id]) {
              return that.$message.error("该消息已存在，请修改id后重新保存");
            }
            const messageRef = window.bpmnInstances.moddle.create("bpmn:Message", that.modelObjectForm);
            that.rootElements.push(messageRef);
          } else {
            if (that.signalIdMap[that.modelObjectForm.id]) {
              return that.$message.error("该信号已存在，请修改id后重新保存");
            }
            const signalRef = window.bpmnInstances.moddle.create("bpmn:Signal", that.modelObjectForm);
            that.rootElements.push(signalRef);
          }
          that.modelVisible = false;
          that.initDataList();
        }
      })
    }
  }
};
</script>
