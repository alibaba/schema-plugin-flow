const pagePlugin = {
  onNodePreprocess: node => {
    if (node.id === 'main_id') {
      // node.children.push({
      //   component: 'DragDemo'
      // })
    }
  },
  afterRender: () => {
  }
};

export default pagePlugin;
