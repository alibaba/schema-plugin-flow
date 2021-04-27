# SifoDragVueModelPlugin

Sifo 拖拽模型插件，在以任意组件与初始 Schema 渲染的基础上，支持对组件进行即时拖拽，构建出新的 Schema.

## 类实例化参数
| 参数名            |  参数类型             |   描述            |   默认值     |
| ---------------- | ---------------------| ---------------- | ------------|
| getDraggable     |  func: node => bool    |      节点是否可拖拽         |    () => true   |
| getDropable     |  func: node => bool    |      节点是否可拖入         |    () => true   |
| dropFilter     |  func: args => bool    |      拖拽过滤方法         |    () => true   |
| SifoDragEidtor     |  Vue.Component    |      拖拽工作面板组件，可以自定义拖拽工作面板，方法请参考内置的组件         |    DefaultSifoDragEidtor   |


## 使用示例

```javascript
import SifoApp from "@schema-plugin-flow/sifo-vue";
import DragModelPlugin from '@schema-plugin-flow/sifo-mplg-drag-vue';
const components = { Container, Input, Select };
const schema = {
  id: 'root',
  component: 'Container',
  children:[]
};
const plgs = [
  modelPlugin: DragModelPlugin,
  componentPlugin: {
    sifo_mplg_drag_editor_id: {
      onComponentInitial: (params) => {
        const { event, mApi } = params;
        mApi.setAttributes(event.key, {
          componentList
        });
        mApi.addEventListener(event.key, 'onSave', (ctx, schema) => {
          console.log('this is edited schema:', schema);
        });
      }
    }
  }
];
return (
    <SifoApp
      namespace="drag-demo"
      className="drag-demo"
      components={components}
      plugins={plgs}
      schema={schema}
    />
  );
```

其中，componentList 是提供给默认的组件属性编辑组件使用的组件列表，其格式如下：
```js
const componentList = [
  {
    type: 'input',
    name: '文本',
    component: 'Input',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'text_' + uuid,
        attributes: {
          label: '文本-' + uuid,
          fieldKey: 'text_' + uuid
        }
      }
    },
    propsRender: (id, node, api) => {
      return <PropsEditorComp id={id} node={node} api={api}/>
    }
  }
];
```

## 其它
https://github.com/alibaba/schema-plugin-flow 中提供了演示示例