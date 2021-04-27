<template>
  <div class="sifo-mplg-drag">
    <sifo-drag-editor-header
      @deleteNode="deleteNode"
      :selectedId="selectedId"
      :getSchema="getSchema"
      @onSave="save"
    />
    <div class="sifo-mplg-drag-editor">
      <div span="{4}" class="sifo-mplg-drag-components">
        <div class="sifo-mplg-drag-panel-header">组件</div>
        <div class="sifo-mplg-drag-panel-content">
          <div
            v-for="item in componentList"
            :key="item.type"
            @dragstart="handleDragStart(item, $event)"
            @dragend="handleDragEnd"
            :id="item.type"
            :class="{
              'sifo-component-item': true,
              'sifo-component-item-active': activeType === item.type,
            }"
            draggable="true"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div span="{14}" class="sifo-mplg-drag-render-plate">
        <div class="sifo-mplg-drag-panel-header">渲染区</div>
        <div class="sifo-mplg-drag-panel-content">
          <slot></slot>
        </div>
      </div>
      <div span="{6}" class="sifo-mplg-drag-props">
        <div class="sifo-mplg-drag-panel-header">属性</div>
        <div class="sifo-mplg-drag-panel-content">
          <component v-bind:is="propsRender"></component>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Header from "./header";
export default {
  name: "sifo-drag-editor",
  components: {
    "sifo-drag-editor-header": Header,
  },
  data: function () {
    return {
      selectedId: "",
      activeType: "",
    };
  },
  computed: {
    propsRender: function () {
      const { node, id } = this.selectedNode || {};
      return (
        this.typeItem &&
        this.typeItem.propsRender &&
        this.typeItem.propsRender(id, node, this.getApi(id))
      );
    },
    typeItem: function () {
      const { node } = this.selectedNode || {};
      if (!node) return null;
      const { componentList = [] } = this;
      let typeItem = null;
      componentList.forEach((item) => {
        if (typeItem) return;
        if (node.type && node.type === item.type) {
          typeItem = item;
        } else if (node.component === item.component) {
          typeItem = item;
        }
      });
      return typeItem;
    },
  },
  watch: {
    typeItem: function (newTypeItem) {
      this.activeType = newTypeItem?.type;
    },
    selectedNode: function (newSelectNode) {
      const { node, id: selectedId } = newSelectNode || {};
      this.selectedId = selectedId;
    },
  },
  methods: {
    save: function (schema) {
      if (this._events.onSave) {
        this.$emit("onSave", schema);
      } else {
        console.log("onSave", schema);
      }
    },
    handleDragEnd: function (e) {
      const { onDragEnd } = this;
      onDragEnd(e);
    },
    handleDragStart: function (item, e) {
      const { init, component } = item;
      if (!init) {
        console.error("init not found");
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const newNode = init(init);
      const { onDragStart } = this;
      onDragStart({ ...newNode, component }, e);
    },
    getApi: function (id) {
      const { updateAttributes, updateId } = this;
      return {
        setAttributes: (attributes, reload) => {
          updateAttributes(id, attributes, reload);
        },
        updateId: (nId) => {
          updateId(id, nId);
        },
      };
    },
  },
  props: [
    "componentList",
    "selectedNode",
    "deleteNode",
    "getSchema",
    "updateAttributes",
    "updateId",
    "onDragStart",
    "onDragEnd",
    "onSave",
  ],
};
</script>
