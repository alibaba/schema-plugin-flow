<template >
    <a-input @blur="$emit('onBlur',$event)" :value="text" @change="$emit('onCellChange',record.key, column.dataIndex, $event)"></a-input>
</template>
<script>
export default {
  name: 's-inputcell',
  mounted:function(){
    //console.log('s-inputcell',this);
  },
  methods: {

  },
  props:[ 'text','record', 'index', 'column']
}
</script>