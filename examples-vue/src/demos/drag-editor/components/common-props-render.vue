<template>
  <div>
    <div>
      ID:<a-input
        :value="id"
        @change="api.updateId($event.target.value)"
      ></a-input>
    </div>
    <div>
      标签:<a-input
        :value="label"
        @change="api.setAttributes({ label: $event.target.value })"
      ></a-input>
    </div>
    <div v-if="fieldKey">
      字段标识:<a-input
        :value="fieldKey"
        @change="api.setAttributes({ fieldKey: $event.target.value }, true)"
      ></a-input>
    </div>
  </div>
</template>

<script>
export default {
  name: "input-props-render",
  components: {  },
  data: function () {
    return {
    };
  },
  methods: {
  },
  props: ["id",'label','fieldKey','api'],
};
</script>
