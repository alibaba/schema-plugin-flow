<template>
  <div class="vue-demo-root">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1" tab="Quick Start">
        <quick-start />
      </a-tab-pane>
      <a-tab-pane key="2" tab="Complex Demo">
        <complex-demo />
      </a-tab-pane>
      <a-tab-pane key="3" tab="Optimize Demo">
        <optimze-test />
      </a-tab-pane>
      <a-tab-pane key="4" tab="Form Demo">
        <form-demo />
      </a-tab-pane>
      <a-tab-pane key="5" tab="Drag Demo">
        <drag-demo />
      </a-tab-pane>
      <a-tab-pane key="6" tab="Decorator Demo">
        <test-decorator class="eeee" test="333" :ddd="ddd"/>
      </a-tab-pane>
      <a-tab-pane key="7" tab="getExtProps Demo">
        <get-ext-props class="eeee" test="333" :ddd="ddd"/>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
// ext could be a independent js
import './demos/quick-start-ext';
import './demos/test-decorator-ext';
import complexDemo from "./demos/complex-demo/Complex.vue";
import quickStart from "./demos/quick-start.vue";
import optimze from './demos/optimize.vue';
import form from './demos/form-demo/form-demo.vue';
import drag from './demos/drag-editor/index.vue';
import decorator from './demos/test-decorator';
import getExtProps from './demos/get-ext-props.vue';
export default {
  name: "test-root",
  data(){
    return {
      ddd: '444'
    }
  },
  components: {
    "complex-demo": complexDemo,
    "quick-start": quickStart,
    'optimze-test': optimze,
    'form-demo': form,
    'drag-demo': drag,
    'test-decorator': decorator,
    'get-ext-props': getExtProps
  }
};
</script>