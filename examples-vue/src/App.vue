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
    </a-tabs>
  </div>
</template>

<script>
// ext-quick-start could be a independent js
import './demos/ext-quick-start';
import complexDemo from "./demos/complex-demo/Complex.vue";
import quickStart from "./demos/quick-start.vue";
import optimze from './demos/optimize.vue';
import form from './demos/form-demo/form-demo.vue';
export default {
  name: "test-root",
  components: {
    "complex-demo": complexDemo,
    "quick-start": quickStart,
    'optimze-test': optimze,
    'form-demo': form,
  }
};
</script>