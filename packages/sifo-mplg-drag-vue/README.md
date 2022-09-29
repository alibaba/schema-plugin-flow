# SifoDragVueModelPlugin

Sifo 拖拽模型插件，在以任意组件与初始 Schema 渲染的基础上，支持对组件进行即时拖拽，构建出新的 Schema.

在线体验：[sifo-mplg-drag-vue](https://codesandbox.io/s/sifo-drag-vue-6q5oz)

## 类实例化参数
| 参数名            |  参数类型             |   描述            |   默认值     |
| ---------------- | ---------------------| ---------------- | ------------|
| getDraggable     |  func: node => bool    |      节点是否可拖拽         |    () => true   |
| getDroppable     |  func: node => bool    |      节点是否可拖入         |    () => true   |
| dropFilter     |  func: args => bool    |      拖拽过滤方法         |    () => true   |
| deleteChecker     |  func: (id, nodeInfo) => bool    |      节点是否可删除         |    () => true   |
| SifoDragEditor     |  React.Component    |      拖拽工作面板组件，可使用内置的SifoDragEditor，也可以自定义拖拽工作面板，方法请参考内置的组件         |   null    |

### 设计器 props:
* id: 设计器节点id
* instanceId: sifoApp 实例id
* onDragStart: 拖入添加时调用，参数是节点数据 (newNode)=> bool;
* onDragEnd: 拖入动作结束时调用
* updateAttributes: 更新节点属性，(id, attributes, needReload = false) => {
* updateId: 更新节点id，(id, newId) => void;
* replaceComponent: 更新节点组件，(id, componentName, needReload = false) => void;
* deleteNode: 删除指定节点，id=>void;
* addChildNode: 添加子节点，(newNode, targetId) => bool;
* getSchema: 获取编辑后的schema，等效于 () => this.mApi.getEditedSchema(),
* getNodeInfo: 获取指定节点信息，id => info;
* getDomById: 获取指定节点的DOM，id => Dom;
* setSelectedId: 设置选中的节点id;


## 扩展的 mApi 方法
| 方法名            | 参数/类型               | 返回值类型             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------|
| reloadPage       | (object?: { [externals] [, schema] [, plugins] [, components] }, useEditedSchema = false)    | ✘        | 创建新实例，重新加载页面，reloadPage 将重跑所有生命周期。useEditedSchema 表示是否使用编辑后的schema来渲染| 

## 使用示例

```javascript
import SifoApp from "@schema-plugin-flow/sifo-vue";
import DragModelPlugin, { SifoDragEditor } from "@schema-plugin-flow/sifo-mplg-drag-vue";
import "@schema-plugin-flow/sifo-mplg-drag-vue/index.less";
const components = { Container, Input, Select };
const schema = {
  id: 'root',
  component: 'Container',
  children:[]
};
const plgs = [
  {
    modelPlugin: {
      plugin: DragModelPlugin,
      argsProvider: () => {
        return {
          SifoDragEditor,
        }
      }
    },
    componentPlugin: {
      sifo_mplg_drag_editor_id: {
        onComponentInitial: (params) => {
          const { event, mApi } = params;
          mApi.setAttributes(event.key, {
            componentList,
            title: "测试拖拽"
          });
          mApi.addEventListener(event.key, 'onSave', (ctx, schema) => {
            console.log('this is edited schema:', schema);
          });
        }
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
    propsRender: (id, node, api) {
      const dynamicComp = {
        functional: true,
        render(createElement) {
          return createElement(PropsRender, { props: { id, node, api } });
        }
      };
      return dynamicComp;
    }
  }
];
```

## 其它
https://github.com/alibaba/schema-plugin-flow 中提供了演示示例