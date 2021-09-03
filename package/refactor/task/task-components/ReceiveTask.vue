<template>
  <div style="margin-top: 16px">
    <a-form-item label="消息实例">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: nowrap">
        <a-select v-model="bindMessageId" @change="updateTaskMessage">
          <a-select-option v-for="id in Object.keys(messageMap)" :value="id" :label="messageMap[id]" :key="id" />
        </a-select>
        <a-button size="small" type="primary" icon="plus" style="margin-left: 8px" @click="openMessageModel" />
      </div>
    </a-form-item>
    <a-modal :visible.sync="messageModelVisible" :close-on-click-modal="false" title="创建新消息" width="400px" append-to-body destroy-on-close>
      <a-form :model="newMessageForm" size="small" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" @submit.native.prevent>
        <a-form-item label="消息ID">
          <a-input v-model="newMessageForm.id" allowClear />
        </a-form-item>
        <a-form-item label="消息名称">
          <a-input v-model="newMessageForm.name" allowClear />
        </a-form-item>
      </a-form>
      <template slot="footer">
        <a-button size="small" type="primary" @click="createNewMessage">确 认</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: "ReceiveTask",
  props: {
    id: String,
    type: String
  },
  data() {
    return {
      bindMessageId: "",
      newMessageForm: {},
      messageMap: {},
      messageModelVisible: false
    };
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.$nextTick(() => this.getBindMessage());
      }
    }
  },
  created() {
    this.bpmnMessageRefsMap = Object.create(null);
    this.bpmnRootElements = window.bpmnInstances.modeler.getDefinitions().rootElements;
    this.bpmnRootElements
      .filter(el => el.$type === "bpmn:Message")
      .forEach(m => {
        this.bpmnMessageRefsMap[m.id] = m;
        this.$set(this.messageMap, m.id, m.name);
      });
    this.$set(this.messageMap, "-1", "无"); // 添加一个空对象，保证可以取消原消息绑定
  },
  methods: {
    getBindMessage() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.bindMessageId = this.bpmnElement.businessObject?.messageRef?.id || "-1";
    },
    openMessageModel() {
      this.messageModelVisible = true;
      this.newMessageForm = {};
    },
    createNewMessage() {
      if (this.messageMap[this.newMessageForm.id]) {
        this.$message.error("该消息已存在，请修改id后重新保存");
        return;
      }
      const newMessage = window.bpmnInstances.moddle.create("bpmn:Message", this.newMessageForm);
      this.bpmnRootElements.push(newMessage);
      this.$set(this.messageMap, this.newMessageForm.id, this.newMessageForm.name);
      this.bpmnMessageRefsMap[this.newMessageForm.id] = newMessage;
      this.messageModelVisible = false;
    },
    updateTaskMessage(messageId) {
      if (messageId === "-1") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          messageRef: null
        });
      } else {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          messageRef: this.bpmnMessageRefsMap[messageId]
        });
      }
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>
