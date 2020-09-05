const pagePlugin = {
  onNodePreprocess: (node, info) => {
    const { id, component, children } = node;
    if (id == '$mainContainer') { 
    //   for (let i = 0; i < 1000; i++) { 
    //     children.push({
    //       "component": "a-input",
    //       "id": "name"+i,
    //       "attributes": {
    //         "placeholder": "名称"
    //       }
    //     })
    //   }
    }
  },
  afterRender: () => { 

  }
}

export default pagePlugin;
