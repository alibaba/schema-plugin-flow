/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
import { buildSchema, modifyCss, calcDropPosition } from './utils';
import './index.css';

function preventDefault(e) {
  e.preventDefault();
  e.stopPropagation();
}
function defaultDraggable() {
  return true;
}
function defaultDroppable() {
  return true;
}
function defaultDropFilter() {
  return true;
}
function defaultDeleteChecker() {
  return true;
}
class DragModelPlugin {
  static ID = 'sifo_drag_model_plugin';
  constructor(props) {
    const {
      getDraggable = defaultDraggable,
      getDropable = null, // 兼容旧属性名
      getDroppable = null,
      dropFilter = defaultDropFilter,
      deleteChecker = defaultDeleteChecker,
      dragWrapper = e => e,
      SifoDragEditor = () => null,
    } = props || {};
    this.getDraggable = getDraggable;
    this.getDroppable = getDroppable || getDropable || defaultDroppable;
    this.dropFilter = dropFilter;
    this.deleteChecker = deleteChecker;
    this.dragWrapper = dragWrapper;
    this.SifoDragEditor = SifoDragEditor;
    this.mApi = null;
    this.schemaInstance = null;
    this.dragDomRef = {};
    this.currentDragId = null;
    this.currentTargetId = null;
    this.currentAddNode = null;
    this.selectedId = '';
    this.buildApi = {};
    this.dragType = '';// move/add
    this.dropType = 'cancel';// 'preInsert/subInsert/addChild'/'cancel'/'done'
    this.eventUUID = `sifo-mplg-drag-${Math.random().toString().substr(3, 6)}`;
    this.refDomResets = {};
  }
  reset = (force = false) => {
    // console.log('reset', force)
    if (this.currentTargetId) {
      const targetDom = this.dragDomRef[this.currentTargetId];
      if (targetDom) {
        modifyCss(targetDom, [], ['insert', 'pre-insert', 'sub-insert', 'forbidden']);
      }
    }
    // dropType 为 cancel 时，说明不可拖拽，此时事件不重置
    // force 为 true，说明是 reloadPage
    // dropType 不为cancel，但又不为 done 时，说明是拖拽进入渲染区后，又拖出区域，视为 cancel
    if (force) {
      if (this.selectedId) {
        const sleDom = this.dragDomRef[this.selectedId];
        sleDom && modifyCss(sleDom, [], ['sifo-drag-selected'], '');
      }
      this.triggerRefDomResets();
      this.refDomResets = {};
      this.selectedId = '';
    }
    this.currentDragId = null;
    this.currentTargetId = null;
    this.currentAddNode = null;
    this.dropType = 'cancel';
    this.dragType = '';
  }
  setRefDom = (id, dom) => {
    this.dragDomRef[id] = dom;
  }
  setRefDomResets = (id, func) => {
    if (!this.refDomResets[id]) {
      this.refDomResets[id] = [];
    }
    this.refDomResets[id].push(func);
  }
  triggerRefDomResets = resetId => {
    function doReset(func) {
      try {
        func();
      } catch (e) {
        console.error('[sifo-mplg-drag] refDom reset error:', e);
      }
    }
    Object.keys(this.refDomResets).forEach(id => {
      if (resetId) {
        if (id === resetId) {
          this.refDomResets[id].forEach(func => doReset(func));
        }
      } else {
        this.refDomResets[id].forEach(func => doReset(func));
      }
    });
    // clear
    if (resetId) {
      this.refDomResets[resetId] = [];
    } else {
      this.refDomResets = {};
    }
  }
  bindDragProps = (id, refDom) => {
    const item = this.schemaInstance.nodeMap[id];
    if (item) {
      const { __dragNodeId__, __draggable__, __droppable__ } = item;
      if (!__dragNodeId__) return;
      if (this.dragDomRef[__dragNodeId__] && this.dragDomRef[__dragNodeId__] !== refDom) {
        this.triggerRefDomResets(__dragNodeId__);
      }
      this.setRefDom(__dragNodeId__, refDom);
      if (!refDom) return;
      let force = false;
      if (refDom.dataset.eventUuid && refDom.dataset.eventUuid !== this.eventUUID) {
        force = true;
      }
      refDom.dataset.eventUuid = this.eventUUID;
      if (force || !refDom.dataset.bindClk) {
        refDom.dataset.bindClk = 'bind';
        const originClk = refDom.onmousedown;
        this.setRefDomResets(__dragNodeId__, () => {
          refDom.onmousedown = originClk;
        });
        refDom.onmousedown = e => {
          // e.preventDefault();
          // e.stopPropagation();
          this.onNodeSelected(__dragNodeId__, e);
          originClk && originClk(e);
        };
      }
      if (__draggable__ && (force || refDom.draggable !== true)) {
        refDom.draggable = true;
        refDom.dataset.dragKey = __dragNodeId__;
        refDom.ondragstart = e => this.onDragStart(__dragNodeId__, e);
        refDom.ondragend = e => this.onDragEnd(__dragNodeId__, e);
      }
      if (__droppable__ && (force || !refDom.dataset.dropKey)) {
        refDom.dataset.dropKey = __dragNodeId__;
        refDom.ondragenter = e => this.onDragEnter(__dragNodeId__, e);
        refDom.ondragleave = e => this.onDragLeave(__dragNodeId__, e);
        refDom.ondragover = e => this.onDragOver(__dragNodeId__, e);
        refDom.ondrop = e => this.onDrop(__dragNodeId__, e);
      }
    }
  }
  doReloadPage = (schema, selectedId) => {
    const externals = this.mApi.getExternals() || {};
    this.reset(true);
    // 处理完当前事件再reload
    setTimeout(() => {
      this.mApi.reloadPage({
        schema,
        externals: {
          ...externals,
          sifoDragSelectId: selectedId
        }
      });
    }, 100);
  }
  updateAttributes = (id, attributes, needReload = false) => {
    const schema = this.buildApi.updateAttributes(id, attributes);
    const info = this.buildApi.getNodeInfo(id);
    if (needReload) {
      this.doReloadPage(schema, id);
    } else {
      this.mApi.setAttributes(id, attributes);
      // refresh props editor
      this.mApi.setAttributes(this.wrappedEditorId, {
        selectedNode: {
          node: info.node,
          id
        }
      });
    }
  }
  updateId = (id, newId) => {
    if (!newId) {
      console.error('[sifo-mplg-drag] update node id should not empty');
      this.dragType = '';
      this.mApi.refresh();
      return;
    }
    if (this.buildApi.getNodeInfo(newId)) {
      console.error('[sifo-mplg-drag] update node id already existed:', newId);
      this.dragType = '';
      this.mApi.refresh();
      return;
    }
    const schema = this.buildApi.updateId(id, newId);
    this.doReloadPage(schema, newId);
  }
  doMove = (dropType, targetInfo, targetIdx) => {
    let schema = this.buildApi.renderSchema;
    if (dropType === 'preInsert') {
      schema = this.buildApi.moveChildren(this.currentDragId, targetInfo.parentId, targetIdx);
    } else if (dropType === 'subInsert') {
      schema = this.buildApi.moveChildren(this.currentDragId, targetInfo.parentId, targetIdx + 1);
    } else {
      // addChild
      const childLen = targetInfo?.childrenLength || 0;
      schema = this.buildApi.moveChildren(this.currentDragId, this.currentTargetId, childLen);
    }
    this.doReloadPage(schema, this.currentDragId);
  }
  doAdd = (dropType, targetInfo, targetIdx) => {
    if (!this.currentAddNode) {
      return;
    }
    let schema = this.buildApi.renderSchema;
    if (dropType === 'preInsert') {
      schema = this.buildApi.addChildren(this.currentAddNode, targetInfo.parentId, targetIdx);
    } else if (dropType === 'subInsert') {
      schema = this.buildApi.addChildren(this.currentAddNode, targetInfo.parentId, targetIdx + 1);
    } else {
      const childLen = targetInfo?.childrenLength || 0;
      schema = this.buildApi.addChildren(this.currentAddNode, this.currentTargetId, childLen);
    }
    this.doReloadPage(schema, this.currentAddNode.id);
  }
  doDeleteNode = id => {
    if (!id) return;
    const nodeInfo = this.buildApi.getNodeInfo(id);
    if (this.deleteChecker(id, {
      nodeInfo,
      getNodeInfo: this.buildApi.getNodeInfo
    })) {
      let schema = this.buildApi.renderSchema;
      schema = this.buildApi.deleteNode(id);
      this.doReloadPage(schema, schema.id);
    } else {
      console.info(`[sifo-mplg-drag] delete node ${id} check failed.`);
    }
  }
  onDragStart = (id, e) => {
    // console.log('onDragStart', id, e);
    const item = this.schemaInstance.nodeMap[id];
    // 不允许拖拽时，不处理且阻止事件往下执行
    if (!item || !item.__draggable__) {
      preventDefault(e);
      return;
    }
    this.currentDragId = id;
    this.dragType = 'move';
    e.stopPropagation();// 防穿透
    modifyCss(e.target, ['sifo-drag'], [], '');
    e.dataTransfer.setData('id', id);
  }
  onDragEnd = (id, e) => {
    // console.log('onDragEnd', id, e);
    preventDefault(e);
    modifyCss(e.target, [], ['sifo-drag'], '');
    this.reset();
  }
  onDragEnter = (id, e) => {
    preventDefault(e);
    // 不允许拖入或拖入自身节点，直接返回
    const item = this.schemaInstance.nodeMap[id];
    if (!item || !item.__droppable__ || this.currentDragId === id) {
      this.dropType = 'cancel';
      return;
    }
    const node = this.schemaInstance.nodeMap[id] || {};
    const pNode = this.schemaInstance.nodeMap[node.__parentId__];
    if (!pNode || (!node.__canAddChild__ && !pNode.__canAddChild__)) {
      this.dropType = 'cancel';
      return;
    }
    if (this.currentTargetId) {
      const oldTargetDom = this.dragDomRef[this.currentTargetId];
      if (oldTargetDom) {
        modifyCss(oldTargetDom, [], ['insert', 'pre-insert', 'sub-insert', 'forbidden']);
      }
    }
    this.currentTargetId = id;
    const targetDom = this.dragDomRef[this.currentTargetId];
    if (targetDom) {
      // addClass(targetDom, 'sifo-drop-insert');
    }
    // console.log('onDragEnter', id, e);
  }
  onDragOver = (id, e) => {
    preventDefault(e);
    if (this.currentTargetId) {
      const targetDom = this.dragDomRef[this.currentTargetId];
      if (targetDom) {
        const targetRect = (targetDom).getBoundingClientRect();
        let dropType = calcDropPosition(e, targetRect);
        if (dropType === 'addChild') {
          const dragInfo = this.buildApi.getNodeInfo(this.currentDragId);
          // 目标是父，不操作, 父向子，会删除
          if (dragInfo && dragInfo.parentId === this.currentTargetId) {
            dropType = 'cancel';
          }
        }
        let canNotAddChild = false;
        const node = this.schemaInstance.nodeMap[this.currentTargetId] || {};
        if (!node.__canAddChild__) {
          canNotAddChild = true;
        }
        // 'preInsert/subInsert/addChild'/'cancel'
        if (dropType === 'preInsert') {
          modifyCss(targetDom, ['pre-insert'], ['insert', 'sub-insert', 'forbidden']);
        } else if (dropType === 'subInsert') {
          modifyCss(targetDom, ['sub-insert'], ['insert', 'pre-insert', 'forbidden']);
        } else if (dropType === 'addChild') {
          const add = [];
          if (!canNotAddChild) {
            add.push('insert');
            modifyCss(targetDom, add, ['sub-insert', 'pre-insert', 'forbidden']);
          } else {
            add.push('forbidden');
            modifyCss(targetDom, add, ['sub-insert', 'pre-insert', 'insert']);
          }
        } else if (dropType === 'cancel') {
          // modifyCss(targetDom, ['forbidden'], ['insert', 'pre-insert', 'sub-insert']);
        }
        if (canNotAddChild) {
          modifyCss(targetDom, [], ['insert']);
        }
        this.dropType = dropType;
        // console.log('dropType', dropType, 'canNotAddChild:', canNotAddChild);
      }
    }
    // console.log('onDragOver', id, e);
  }
  onDragLeave = (id, e) => {
    preventDefault(e);
    // console.log('onDragLeave', id, e);
  }
  onDrop = (id, e) => {
    // const sId = e.dataTransfer.getData('id');
    // console.log('onDrop drag to drop:', this.currentDragId, this.dropType, this.currentTargetId);
    preventDefault(e);
    if (this.currentTargetId) {
      const targetDom = this.dragDomRef[this.currentTargetId];
      if (targetDom) {
        modifyCss(targetDom, [], ['insert']);
      }
      const { dropType } = this;
      if (!dropType || dropType === 'cancel') return;
      const info = this.buildApi.getNodeInfo(this.currentTargetId);
      if (!info) {
        console.error(`[sifo-mplg-drag] node info not found: ${this.currentTargetId}`);
        this.dropType = 'cancel';
        return;
      }
      if (dropType === 'addChild') {
        // addChild
        const node = this.schemaInstance.nodeMap[this.currentTargetId] || {};
        if (!node.__canAddChild__) {
          this.dropType = 'cancel';
          return;
        }
      }
      const targetIdx = this.buildApi.getNodeIndex(this.currentTargetId);
      if (this.dropFilter) {
        const dragTarget = this.dragType === 'move' ? this.buildApi.getNodeInfo(this.currentDragId) : this.currentAddNode;
        const dropTarget = this.dropType === 'addChild' ? info : this.buildApi.getNodeInfo(info.parentId);
        const filter = this.dropFilter({
          dragType: this.dragType,
          dropTarget,
          dragTarget,
          getNodeInfo: this.buildApi.getNodeInfo
        });
        if (filter === false) {
          this.dropType = 'cancel';
          console.info('[sifo-mplg-drag] dropFilter return false, so drop canceled');
          return;
        }
      }
      switch (this.dragType) {
        case 'move': {
          this.doMove(this.dropType, info, targetIdx);
          break;
        }
        case 'add': {
          this.doAdd(this.dropType, info, targetIdx);
          break;
        }
        default: { }
      }
    }
  }
  /**
   * 新增节点
   * @param {*} node 节点数据
   * @param {*} e
   */
  onDragAddNode = newNode => {
    if (!newNode) return;
    if (!newNode.id) {
      console.error('[sifo-mplg-drag] add node need a id');
      this.dragType = '';
      return;
    } else if (this.buildApi.getNodeInfo(newNode.id)) {
      console.error('[sifo-mplg-drag] add node id already existed:', newNode.id);
      this.dragType = '';
      return;
    }
    this.dragType = 'add';
    this.currentAddNode = { ...newNode };
  }
  onNodeSelected = id => {
    if (this.triggerSelectId) {
      return;
    }
    this.triggerSelectId = id;
    // 200ms 内只取第一个
    setTimeout(() => {
      this.triggerSelectId = null;
    }, 200);
    if (this.selectedId) {
      const preDom = this.dragDomRef[this.selectedId];
      preDom && modifyCss(preDom, [], ['sifo-drag-selected'], '');
    }
    this.selectedId = id;
    const targetDom = this.dragDomRef[id];
    modifyCss(targetDom, ['sifo-drag-selected'], [], '');
    const info = this.buildApi.getNodeInfo(id);
    if (!info) {
      console.warn('not init schema node');
      return;
    }
    this.mApi.setAttributes(this.wrappedEditorId, {
      selectedNode: {
        node: info.node,
        id
      }
    });
  }
  onNodePreprocess = (node, informations) => {
    const { instanceId } = informations;
    if (this.wrappedEditorId) return node;
    this.wrappedEditorId = 'sifo_mplg_drag_editor_id';
    const attributes = {
      id: this.wrappedEditorId,
      instanceId,
      onDragStart: this.onDragAddNode,
      onDragEnd: e => {
        preventDefault(e);
        this.reset();
      },
      updateAttributes: this.updateAttributes,
      updateId: this.updateId,
      deleteNode: this.doDeleteNode,
      getSchema: () => this.mApi.getEditedSchema(),
      getNodeInfo: id => this.buildApi.getNodeInfo(id),
    };
    return {
      component: 'SifoDragEditor',
      id: this.wrappedEditorId,
      attributes,
      children: [node]
    };
  }
  onComponentsWrap = components => {
    const rComp = Object.assign({}, components);
    const wrappedComps = {};
    Object.keys(rComp).forEach(key => {
      const comp = rComp[key];
      wrappedComps[key] = this.dragWrapper(comp, this.bindDragProps);
    });
    wrappedComps.SifoDragEditor = this.SifoDragEditor;
    return wrappedComps;
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
  }
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;
    this.mApi = mApi;
    this.mApi.sifoDragEditorId = this.wrappedEditorId;
    const getEditedSchema = () => () => {
      const sch = JSON.stringify(this.buildApi.renderSchema);
      return JSON.parse(sch);
    };
    applyModelApiMiddleware('getEditedSchema', getEditedSchema);
    const externals = this.mApi.getExternals() || {};
    // 这是最新的schema
    const initSchema = mApi.getInitialSchema();
    // 这个是最原始的schema
    let initRawSchema = externals.__initRawSchema__;
    if (!initRawSchema) {
      initRawSchema = JSON.stringify(initSchema);
      externals.__initRawSchema__ = initRawSchema;
    }
    // 先取得渲染schema，再覆盖getInitialSchema方法
    const getInitialSchema = () => () => {
      return JSON.parse(initRawSchema);
    };
    applyModelApiMiddleware('getInitialSchema', getInitialSchema);
    // 只能用初始schema编辑（开发态）
    this.buildApi = buildSchema(initSchema);
    // 置入属性
    this.schemaInstance.loopDown(node => {
      const { id } = node;
      const info = this.buildApi.getNodeInfo(id);
      // 只对初始schema进行操作
      if (info) {
        node.__dragNodeId__ = id;
        node.attributes.__dragNodeId__ = id;
        node.__draggable__ = this.getDraggable(node);
        // 用__canAddChild__来标识是否可加子节点，因为有可以前后插入
        node.__canAddChild__ = this.getDroppable(node);
        node.__droppable__ = true;
      }
    });
  }
  onReadyToRender = () => {
    const externals = this.mApi.getExternals() || {};
    const { sifoDragSelectId } = externals;
    const info = this.buildApi.getNodeInfo(sifoDragSelectId);
    if (info) {
      this.mApi.setAttributes(this.wrappedEditorId, {
        selectedNode: {
          node: info.node,
          id: sifoDragSelectId
        }
      });
    }
  }
  afterRender = ({ mApi }) => {
    const externals = mApi.getExternals() || {};
    const { sifoDragSelectId } = externals;
    if (sifoDragSelectId) {
      delete externals.sifoDragSelectId;
      setTimeout(() => {
        this.onNodeSelected(sifoDragSelectId, {});
      }, 0);
    }
  }
}
export default DragModelPlugin;
