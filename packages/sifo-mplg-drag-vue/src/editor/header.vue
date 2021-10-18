<template>
  <div class="sifo-mplg-drag-header">
    <div class="sifo-mplg-drag-title">{{title || 'Sifo拖拽插件'}}</div>
    <div class="sifo-mplg-drag-tool">
      <button class="sifo-mplg-drag-btn" @click="delSelectedNode">
        删除选中节点
      </button>
      <button class="sifo-mplg-drag-btn primary" @click="save">保存</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "sifo-drag-editor-header",
  methods: {
    save: function (event) {
      const schema = this.getSchema();
      this.$emit("onSave", schema);
    },
    delSelectedNode: function () {
      if (this.selectedId) {
        this.$emit("deleteNode", this.selectedId);
      }
    },
  },
  props: ["title", "selectedId", "getSchema"],
};
</script>
