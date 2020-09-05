
<template>
  <div>
    <p :style="{ 'margin': '16px 0' }">
    <strong>
      <code>sifo-vue</code> is 'top-down' rendering type, you can use the
      <code>optimize</code> props to optimize the rerendering in complex project.
    </strong>
    </p>
    <h3>without optimize</h3>
    <sifo-app
      :namespace="namespace"
      class="optimize-demo-demo"
      :plugins="plugins"
      :components="components"
      :schema="schema"
      :openLogger="openLogger"
      :optimize="false"
    />
    <h3>with optimize</h3>
    <sifo-app
      :namespace="namespace"
      class="optimize-demo-demo"
      :plugins="plugins"
      :components="components"
      :schema="schema"
      :openLogger="openLogger"
      :optimize="true"
    />
  </div>
</template>

<script>
import SifoApp from "@schema-plugin-flow/sifo-vue";
const schema = {
  component: "ContainerX",
  children: [
    {
      component: "Input",
      id: "input_01",
      attributes: {
        name: "input_01",
      },
    },
    {
      component: "ContainerX",
      children: [
        {
          component: "Input",
          id: "input_02",
          attributes: {
            name: "input_02",
          },
        },
        {
          component: "ContainerX",
          children: [
            {
              component: "Input",
              id: "input_03",
              attributes: {
                name: "input_03",
              },
            },
            {
              component: "Input",
              id: "input_04",
              attributes: {
                name: "input_04",
              },
            },
          ],
        },
        {
          component: "Input",
          id: "input_05",
          attributes: {
            name: "input_05",
          },
        },
      ],
    },
    {
      component: "Input",
      id: "input_06",
      attributes: {
        name: "input_06",
      },
    },
  ],
};
const components = {
  ContainerX: {
    template: `
    <div :style='{ margin: "8px", border: "1px solid #ccc" }'>
      <slot></slot>
    </div>
    `,
  },
  Input: {
    template: `
      <div :style='{ margin: "8px" }'>&nbsp;&nbsp;
        {{name}}: <input @input="$emit('change',$event)" />&nbsp;&nbsp;
        rerendered: {{new Date().getMilliseconds()}}
      </div>
    `,
    props: ["name"],
  },
};
const pagePlugin = {
  onPageInitial: (params) => {
    const { mApi } = params;
    mApi.queryNodeIds("component==Input").forEach((id) => {
      mApi.addEventListener(id, "change", (ctx, e) => {
        mApi.setAttributes(id, {
          value: e.target.value,
        });
      });
    });
  },
};
export default {
  name: "optimize-demo",
  components: { SifoApp },
  beforeCreate: function () {
    const sifoAppProps = {
      namespace: "optimize-demo",
      plugins: [{ pagePlugin }],
      components,
      schema,
      openLogger: true,
    };
    Object.keys(sifoAppProps).forEach((key) => {
      this[key] = sifoAppProps[key];
    });
  },
};
</script>