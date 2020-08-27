const componentPlugin = {
  subject01: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      const originCompName = mApi.getComponentName(event.key);
      const comps = mApi.getComponents();
      const originComp = comps[originCompName];
      mApi.replaceComponent(event.key, 'CWrap');
      mApi.setAttributes(event.key, {
        itemChildren: originComp,
        placeholder: "包装原来的节点组件",
        style: {
          borderLeft: '2px solid red',
          paddingBottom: '8px'
        }
      })
    }
  },
  test01: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        placeholder: '关闭渲染标记',
        muteRenderOptimizeMark: true, // 关闭渲染标记
      });
    }
  }
}

export default componentPlugin;
