import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
const singleton = new SifoSingleton('quick-start'); // namespace: quick-start
const componentPlugin = {
  test_btn_id: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'click', () => {
        mApi.setAttributes('slogan_id', {
          style: { color: 'red' }
        });
      })
    }
  }
};
const pagePlugin = {
  onNodePreprocess: (node, info) => {
    const { id, component, children } = node;
    if (id == 'mainId') { 
      children.unshift(
        "This is a extension for quick-start in another js, it changes the color of slogan when the button is clicked.",
        {
          component: "hr"
        }
      );
    }
  },
}
singleton.registerItem('ext-quick-start', () => {
  return {
    plugins:[
      { componentPlugin, pagePlugin }
    ],
    components: {},
    openLogger: true
  }
});