/**
 * @author FrominXu
 */
/* tslint:disable: no-any no-empty */
const getDealWithNode = (dealRules: DynamicObject) => (targetNode: SchemaNode) => {
  const { component = '' } = targetNode;
  const dealFunc = typeof dealRules === 'function' ? dealRules : dealRules[component];
  let newNode = targetNode || {};
  if (typeof dealFunc !== 'function') return newNode;
  newNode = dealFunc(newNode) || newNode;
  return newNode;
};
/**
 * 节点修正, 预处理式深度优先遍历
 * @param {*} schema
 * @param {*} dealRules
 * @param {*} alias
 */
export function nodeRevise(schema: SchemaNode, dealRules: any = {}, alias: DynamicObject = {}) {
  const nodeRebuild = (node: SchemaNode) => {
    const {
      id, component, attributes, children, ...other
    } = node;
    const attr = node[alias.attributes] || attributes || {};
    const newNode = {
      ...other, // 允许在节点上放其它属性
      component: node[alias.component] || component,
      attributes: attr,
      children: node[alias.children] || children || [],
      id: id || attr.id, // 节点无id则从属性中取id
    };
    return newNode;
  };
  const dealWithNode = getDealWithNode(dealRules);
  function reviser(node: SchemaNode) {
    if (typeof node === 'string') return node;
    const children: SchemaNode[] = [];
    let builtNode: SchemaNode = nodeRebuild(node);
    builtNode = dealWithNode(Object.assign({}, builtNode));
    (builtNode.children || []).forEach(child => {
      children.push(reviser(child));
    });
    return Object.assign({}, builtNode, { children });
  }// reviser

  return reviser(schema);
}// revise

export default {
  nodeRevise
};
