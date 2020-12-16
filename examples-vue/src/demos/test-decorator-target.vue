<template>
  <div>
    <div>
      <span>count：{{ count }}</span>
      <button v-bind:style="{ margin: '4px 8px' }" v-on:click="count++">
        add count
      </button>
    </div>
    <div>
      <button v-bind:style="{ margin: '4px 0' }" @click="click">
        fire click method
      </button>
    </div>
    <div>
      不传参片段：
      <component v-bind:is="staticFragment"></component>
    </div>
    <div>
      动态传参数片段：
      <component v-bind:is="getDynamicFragment()"></component>
    </div>
  </div>
</template>

<script>
// this is the Vue Component who will be decorated.
const TestDecorator = {
  name: "decorator-test",
  components: {},
  data: function () {
    return {
      count: 0,
      staticFragment: this.sifoApp.getFragment("$static_panel"),
    };
  },
  created: function () {
    this.sifoApp.watch("updateData", (ctx, key, val) => {
      if (key === "count") {
        this.count++;
      }
    });
    this.sifoApp.watch("getData", (e, getter) => {
      getter({
        count: this.count,
      });
    });
    // 比扩展上的插件后执行
    this.click = this.sifoApp.addEventListener("click", (...args) => {
      console.log("target: clicked");
    });
  },
  methods: {
    getDynamicFragment: function () {
      return this.sifoApp.getFragment("$dynamic_panel", {
        value: `count: ${this.count}`,
      });
    },
  },
  destroyed() {
    console.log("destroyed");
  },
  // declare sifoApp property
  props: ["sifoApp"],
};
export default TestDecorator;
</script>