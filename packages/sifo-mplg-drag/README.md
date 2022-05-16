# SifoDragModelPlugin

Sifo 拖拽模型插件，在以任意组件与初始 Schema 渲染的基础上，支持对组件进行即时拖拽，构建出新的 Schema.

### 设计器 props:
* id: 设计器节点id
* instanceId: sifoApp 实例id
* onDragStart: 拖入添加时调用，参数是节点数据 (newNode)=> bool;
* onDragEnd: 拖入动作结束时调用
* updateAttributes: 更新节点属性，(id, attributes, needReload = false) => {
* updateId: 更新节点id，(id, newId) => void;
* replaceComponent: 更新节点组件，(id, componentName, needReload = false) => void;
* deleteNode: 删除指定节点，id=>void;
* addChildrenNode: 添加子节点，(newNode, targetId) => bool;
* getSchema: 获取编辑后的schema，等效于 () => this.mApi.getEditedSchema(),
* getNodeInfo: 获取指定节点信息，id => info;
* getDomById: 获取指定节点的DOM，id => Dom;
* setSelectedId: 设置选中的节点id;

具体请参照 sifo-mplg-drag-react 和 sifo-mplg-drag-vue.