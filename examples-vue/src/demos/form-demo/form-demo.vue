<template>
  <div>
    <sifo-app
      :namespace="namespace"
      class="form-demo"
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
import schema from "./schema-form.json";
import plugins from './plugins';
import "ant-design-vue/dist/antd.css";
import "./index.less";

const components = {
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
      return h(Button, ctx.data, [ctx.data.props.title]);
    },
  },
  Row,
  Col,
  Select,
  DatePicker
};

export default {
  name: "form-demo",
  components: { SifoApp },
  beforeCreate: function () {
    const sifoAppProps = {
      namespace: "form-demo",
      plugins: [
        {
          modelPlugin: {
            plugin: SifoFormCore,
            argsProvider: (mId, info) => {
              return {
                // 字段的key，无返回值认为不是字段
                fieldKey: (attr) => attr.props && attr.props.name,
                fieldChange: {
                  // 表单字段change使用的handler
                  changeHandler: (context, e) => {
                    const { event, mApi } = context;
                    let val = e;
                    if (typeof e === "string" || typeof e === "number") {
                      val = e;
                    } else if (typeof e === "object") {
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
        ...plugins
      ],
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