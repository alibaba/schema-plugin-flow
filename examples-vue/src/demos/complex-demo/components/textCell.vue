<template >
    <a >{{text}}<slot></slot></a>
</template>
<script>
export default {
  name: 's-textcell',
  mounted:function(){
    //console.log('textcell',this);
  },
  props:[ 'text','record', 'index', 'test']
}
</script>