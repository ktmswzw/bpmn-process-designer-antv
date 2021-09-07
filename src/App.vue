<template>
  <div id="app">
    <bpmn-ant-v></bpmn-ant-v>
  </div>
</template>

<script>
import BpmnAntV from "../package/index.js";

export default {
  name: "App",
  components: {
    BpmnAntV
  },
  data() {
    return {
      xmlString: ""
    };
  },
  created() {},
  methods: {}
};
</script>

<style lang="scss"></style>
