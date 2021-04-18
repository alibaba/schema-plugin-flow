<template>
  <div>
    <div>{{label}}</div>
    <input v-model="value"/>
    <slot></slot>
    <slot name="testslot" prpa="val1" prpb="val2">testslot</slot>
  </div>
</template>

<script>
export default {
  name: 's-container',
  components: {
  },
  data:function(){
    // console.log('get data', this)
    return {
      count: 0,
      value: ''
    };
  },
  computed:{
    testRerender:function(){
      // console.log('getter')
      // eslint-disable-next-line no-unused-vars
      const value = this.value;// 依赖变化值是会重新取，否则用缓存
      return new Date().getMilliseconds().toString()
    }
  },
  // 由props来的无法进行双向绑定
  props:['label']
}
</script>

<style>

</style>
