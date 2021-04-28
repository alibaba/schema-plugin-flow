<template>
  <div>
    <sifo-app
      :namespace="namespace"
      class="drag-demo"
      :plugins="plugins"
      :components="components"
      :schema="schema"
      :openLogger="openLogger"
      :optimize="optimize"
    />
  </div>
</template>

<script>
import SifoApp from "@schema-plugin-flow/sifo-vue";
import { DatePicker, Button, Input, Select, Row, Col } from "ant-design-vue";
import SifoFormCore from "@schema-plugin-flow/sifo-mplg-form-core";
import AntdVueFormModelPlugin from "@schema-plugin-flow/sifo-mplg-form-antdv";
import DragModelPlugin, { SifoDragEditor } from "@schema-plugin-flow/sifo-mplg-drag-vue";
import componentList from "./components/componentConfig";
import schema from "./schema.json";
import "@schema-plugin-flow/sifo-mplg-form-antdv/index.less";
import "@schema-plugin-flow/sifo-mplg-drag-vue/index.less";
import "ant-design-vue/dist/antd.css";
import "./index.less";

const { TextArea } = Input;
const components = {
  Header: {
    functional: true,
    render: function (h, ctx) {
      return h('h3', ctx.data, [ctx.data.props.title]);
    }
  },
  Container: {
    template: `
    <div :style='{ border: "1px solid #f5f5f5" }'>
      <slot></slot>
    </div>
    `,
  },
  Input,
  Button: {
    functional: true,
    render: function (h, ctx) {
      return h(Button, ctx.data, [ctx.data.props.label]);
    },
  },
  Row,
  Col,
  Select,
  DatePicker,
  TextArea,
};

export default {
  name: "form-demo",
  components: { SifoApp },
  beforeCreate: function () {
    const dragPluin = {
      sifo_mplg_drag_editor_id: {
        onComponentInitial: (params) => {
          const { event, mApi } = params;
          mApi.setAttributes(event.key, {
            componentList,
          });
          mApi.addEventListener(event.key, "onSave", (ctx, schema) => {
            console.log("this is edited schema:", schema);
          });
        },
      },
    };
    const plgs = [
      {
        modelPlugin: {
          plugin: SifoFormCore,
          argsProvider: (mId, info) => {
            return {
              // 字段的key，无返回值认为不是字段
              fieldKey: (attr) => attr.props && attr.props.fieldKey,
              fieldChange: {
                // 表单字段change使用的handler
                changeHandler: (context, e) => {
                  const { event, mApi } = context;
                  let val = e;
                  if (typeof e === "string" || typeof e === "number") {
                    val = e;
                  } else if (e && typeof e === "object") {
                    val = e.target ? e.target.value : e;
                  }
                  mApi.setAttributes(event.key, { value: val }, true);
                },
                eventName: "change",
              },
            };
          },
        },
      },
      {
        modelPlugin: AntdVueFormModelPlugin,
      },
      {
        modelPlugin: {
          plugin: DragModelPlugin,
          argsProvider: () => {
            return {
              SifoDragEditor,
              dropFilter: (args) => {
                console.log("dropFilter", args);
                return true;
              },
              getDraggable: (node) => {
                // 所有节点都可拖拽
                return true;
              },
              getDropable: (node) => {
                if (node.acceptable !== undefined) return !!node.acceptable;
                // 字段不可拖入子节点
                if (node?.attribute?.fieldKey) return false;
                if (node.component === "Container") return true;
                return false;
              },
            };
          },
        },
      },
      {
        componentPlugin: dragPluin,
      },
    ];
    const sifoAppProps = {
      namespace: "drag-demo",
      plugins: plgs,
      components,
      schema,
      optimize: false,
      openLogger: true,
    };
    Object.keys(sifoAppProps).forEach((key) => {
      this[key] = sifoAppProps[key];
    });
  },
};
</script>