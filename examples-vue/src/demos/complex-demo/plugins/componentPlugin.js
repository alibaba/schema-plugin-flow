// 组件插件可以实现与组件相关的功能
const componentPlugin = {
  $mainContainer: { 
    onComponentInitial: ({ mApi }) => { 
      mApi.queryNodeIds('component==a-input').forEach(id => {
        mApi.addEventListener(id, 'change', (c, e) => {
          c.mApi.setAttributes(id, { value: e.target.value })
        });
      });
    }
  },
  btn_change_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', () => {
        mApi.setAttributes('name', {
          value: new Date().getTime()
        });
      });
    }
  }
};

export default componentPlugin;
