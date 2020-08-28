/**
 * @author FrominXu
 */
import uuid from 'uuid';
import { objectReadOnly, hasOwnProperty, keyHolder, schemaTraverser } from './utils/common-utils';
/* eslint-disable no-underscore-dangle */

function treeParser(currentNode: SchemaNode, parentNode: SchemaNode | null, recorder: DefaultFunc) {
  if (!currentNode) return null;
  if (typeof currentNode !== 'object') return currentNode;
  const { id, attributes = {} } = currentNode;
  const nodeId = keyHolder(id, false) || keyHolder(attributes.id, false) || uuid();
  const parsedNode: SchemaNode = { ...currentNode, id: `${nodeId}`, attributes: attributes || {} };
  if (recorder) {
    recorder(parsedNode);
  }
  if (parentNode && parentNode.id) {
    parsedNode.__parentId__ = parentNode.id; // 记录父节点id，不直接指向父节点是为了能做深拷贝
  }
  const { children } = currentNode;
  parsedNode.children = [];
  if (children && Array.isArray(children) && children.length > 0) {
    children.forEach(childNode => {
      const node = treeParser(childNode, parsedNode, recorder);
      if (node && parsedNode.children) {
        parsedNode.children.push(node);
      }
    });
  }
  return parsedNode;
}
/**
 * schema tree
 */
class SchemaTree {
  // tslint:disable-next-line: no-any
  nodeMap: { [id: string]: SchemaNode | null, __duplicated__id__node__?: any };
  parsedTree: SchemaNode | null;
  initialTree: SchemaNode | null;
  constructor(initialTree: SchemaNode) {
    // id与节点的映射表，是接口操作的主要依据
    this.nodeMap = {};
    this.nodeMap.__duplicated__id__node__ = {}; // 存重复id的节点
    objectReadOnly(this.nodeMap);
    const recorder = (parsedNode: SchemaNode) => {
      const { id } = parsedNode;
      if (id) {
        if (hasOwnProperty(this.nodeMap, [id])) {
          console.error(`[sifo-model] id '${id}' is duplicated, this node will be inaccessible in mApi`);
          let dup = this.nodeMap.__duplicated__id__node__[id];
          if (!dup) dup = [];
          dup.push(parsedNode);
          this.nodeMap.__duplicated__id__node__[id] = dup;
        } else {
          this.nodeMap[id] = parsedNode;
        }
      }
    };
    this.parsedTree = treeParser(initialTree, null, recorder);
    this.initialTree = initialTree;
  }

  loopUp = (loopFunc: DefaultFunc, id: string) => {
    const node = this.nodeMap[id];
    if (node) {
      schemaTraverser(node, '__parentId__', loopFunc, this.nodeMap);
    }
  }

  loopDown = (loopFunc: DefaultFunc, id: string) => {
    let node = null;
    if (id === undefined || id === null || id === '') {
      node = this.parsedTree;
    } else {
      node = this.nodeMap[id];
    }
    if (node) {
      schemaTraverser(node, 'children', loopFunc);
    }
  }
}

export default SchemaTree;
