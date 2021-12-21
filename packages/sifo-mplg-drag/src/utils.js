/* eslint-disable operator-assignment */
/* eslint-disable max-len */
function getNodeMap(node, index = 0, nodeMap, parentId) {
  if (!node) return {};
  if (typeof node !== 'object') return {};
  const { id, children } = node;
  if (!id) return {};
  const childLen = children && Array.isArray(children) ? children.length : 0;
  // eslint-disable-next-line no-param-reassign
  nodeMap[id] = {
    node, index, parentId, childrenLength: childLen
  };
  if (childLen > 0) {
    children.forEach((item, idx) => {
      getNodeMap(item, idx, nodeMap, id);
    });
  }
  return nodeMap;
}
export function buildSchema(schema) {
  const rootId = `sifo-drag-root-${Math.random().toString().substr(3, 6)}`;
  const targetSchema = { ...schema };
  const childLen = targetSchema.children && Array.isArray(targetSchema.children)
    ? targetSchema.children.length : 0;
  let nodeMap = {
    [rootId]: {
      node: targetSchema,
      index: 0,
      parentId: '',
      childrenLength: childLen
    }
  };
  getNodeMap(targetSchema, 0, nodeMap, rootId);
  const rebuildMap = schm => {
    const cLen = schm.children && Array.isArray(schm.children) ? schm.children.length : 0;
    // 重构建
    nodeMap = {
      [rootId]: {
        node: schm,
        index: 0,
        parentId: '',
        childrenLength: cLen
      }
    };
    getNodeMap(schm, 0, nodeMap, rootId);
  };
  return {
    renderSchema: targetSchema,
    getNodeInfo(id) {
      const item = nodeMap[id];
      return item;
    },
    getNodeIndex(id) {
      const index = 0;
      const item = nodeMap[id];
      if (item) {
        return item.index;
      }
      return index;
    },
    updateAttributes(id, attributes) {
      const item = nodeMap[id];
      if (item) {
        item.node.attributes = { ...item.node.attributes, ...attributes };
      }
      rebuildMap(targetSchema);
      return targetSchema;
    },
    updateId(id, newId) {
      const item = nodeMap[id];
      if (item) {
        item.node.id = newId;
      }
      rebuildMap(targetSchema);
      return targetSchema;
    },
    moveChildren(id, targetId, index = 0) {
      const item = nodeMap[id];
      const targetItem = nodeMap[targetId];
      if (!item) {
        console.error(`[sifo-mplg-drag] drag node id not found: ${id}`);
        return targetSchema;
      }
      if (!targetItem) {
        console.error(`[sifo-mplg-drag] drop node id not found: ${targetId}`);
        return targetSchema;
      }
      let toIdx = index;
      if (item.parentId) {
        if (item.parentId === targetId) {
          // 在当前节点内调位置，要按idx算插件位点
          if (item.index < index) {
            toIdx = index - 1;
          }
        }
        if (item.parentId === rootId) {
          // 根节点不允许拖动
          return targetSchema;
        }
        const parentItem = nodeMap[item.parentId];
        const { node } = parentItem;
        node.children = node.children.filter(child => {
          if (!child) return true;
          if (typeof child !== 'object') return true;
          if (child.id === id) return false;
          return true;
        });
      }
      if (targetItem) {
        const { node: cnode } = targetItem;
        if (!cnode.children) cnode.children = [];

        if (targetId === rootId && index === 1) {
          // 顶组件的最后
          toIdx = cnode.children.length;
        }
        cnode.children.splice(toIdx, 0, item.node);
      }
      rebuildMap(targetSchema);
      return targetSchema;
    },
    addChildren(node, targetId, index) {
      let toIdx = index;
      const targetItem = nodeMap[targetId];
      if (!targetItem) {
        console.error(`[sifo-mplg-drag] drop node id not found: ${targetId}`);
        return targetSchema;
      }
      if (targetItem) {
        const { node: cnode } = targetItem;
        if (!cnode.children) cnode.children = [];

        if (targetId === rootId && index === 1) {
          // 顶组件的最后
          toIdx = cnode.children.length;
        }
        cnode.children.splice(toIdx, 0, node);
      }
      rebuildMap(targetSchema);
      return targetSchema;
    },
    deleteNode(id) {
      const item = nodeMap[id];
      if (!item) {
        console.error(`[sifo-mplg-drag] delete node not id found: ${id}`);
        return targetSchema;
      }
      if (item.parentId) {
        if (item.parentId === rootId) {
          // 根节点不允许拖动
          return targetSchema;
        }
        const parentItem = nodeMap[item.parentId];
        const { node } = parentItem;
        node.children = node.children.filter(child => {
          if (!child) return true;
          if (typeof child !== 'object') return true;
          if (child.id === id) return false;
          return true;
        });
      }
      rebuildMap(targetSchema);
      return targetSchema;
    }
  };
}
function hasClass(elements, cName) {
  return !!elements.className.match(new RegExp(`(\\s|^)${cName}(\\s|$)`));
}
export function addClass(elements, cName) {
  if (!hasClass(elements, cName)) {
    // eslint-disable-next-line no-param-reassign
    elements.className += (` ${cName}`).replace(/\s+/g, ' ');
  }
}
export function removeClass(elements, cName) {
  if (hasClass(elements, cName)) {
    // eslint-disable-next-line no-param-reassign
    elements.className = elements.className.replace(new RegExp(`(\\s|^)${cName}(\\s|$)`), ' ').replace(/\s+/g, ' ');
  }
}
/**
 *
 * @param {*} dom Dom
 * @param {*} addList add className
 * @param {*} removeList remove className
 * @param {*} prefix default prefix: 'sifo-drop-'
 * @returns
 */
export function modifyCss(dom, addList = [], removeList = [], prefix = 'sifo-drop-') {
  if (!dom) return;
  addList.forEach(name => {
    addClass(dom, `${prefix}${name}`);
  });
  removeList.forEach(name => {
    removeClass(dom, `${prefix}${name}`);
  });
}
/**
 * dropType
 * @param {*} point
 * @param {*} targetRect
 * @returns 'preInsert/subInsert/addChild'/'cancel'
 */
export function calcDropPosition(point, targetRect) {
  let dropType = 'cancel';
  const { clientX, clientY } = point;
  let {
    top, left, height, width
  } = targetRect;
  top = top - 1;
  height = height + 2;
  left = left - 1;
  width = width + 2;
  // 四分之一区
  const quarterH = Math.floor(height / 4) || 3;
  const quarterW = Math.floor(width / 4) || 3;
  const spanH = Math.min(quarterH, 20);// 最大20px的边
  const spanW = Math.min(quarterW, 20);
  // 上四分之一区
  if ((clientY >= top && clientY < top + spanH) && (clientX >= left && clientX < left + width - spanW)) {
    // 前置
    dropType = 'preInsert';
  } else if ((clientY > top + spanH && clientY < top + height) && clientX > left && clientX < left + spanW) {
    dropType = 'preInsert';
  } else if ((clientY <= top + height && clientY > top + height - spanH) && (clientX > left - spanW && clientX <= left + width)) {
    // 后置
    dropType = 'subInsert';
  } else if ((clientY > top && clientY < top + height - spanH) && (clientX > left + width - spanW && clientX < left + width)) {
    dropType = 'subInsert';
  } else {
    // 位置不在范围
    // eslint-disable-next-line no-lonely-if
    if (clientY < top || clientY > top + height || clientX < left || clientX > left + width) {
      dropType = 'cancel';
    } else {
      dropType = 'addChild';
    }
  }
  return dropType;
}
export default {
  buildSchema, addClass, removeClass, calcDropPosition, modifyCss
};
