/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 *
 * @param {*} node
 * @param {*} createElement
 */
function renderFactory(node, createElement, components, sifoAppNodesMap, needOptimize) {
  if (typeof node === 'string') return node;
  const {
    component,
    attributes = {},
    __renderOptimizeId__: optimizeId,
    __renderOptimizeMark__,
    children = []
  } = node;
  const { props = {} } = attributes;
  const RComponent = components[component] || component;
  const { muteRenderOptimizeMark = false, ...otherAttrs } = attributes;// eslint-disable-line
  const id = node.id || attributes.id || props.id;
  // 对属性 进行分类
  /*
  const { scopedSlots, slot, key, ref, refInFor, style = {},
    attrs = {},
    props = {},
    domProps = {},
    on = {},
    nativeOn = {},
    directives = {},
  } = attributes;
  */
  // console.log('node render', node, props, on);
  let nodeInstance = null;
  if (needOptimize && optimizeId && muteRenderOptimizeMark !== true) {
    if (sifoAppNodesMap[optimizeId]
      && sifoAppNodesMap[optimizeId].__renderOptimizeMark__ === __renderOptimizeMark__) {
      // eslint-disable-next-line prefer-destructuring
      nodeInstance = sifoAppNodesMap[optimizeId].nodeInstance;
    } else {
      sifoAppNodesMap[optimizeId] = null;
      const childrenNodes = children.map(child => {
        return renderFactory(child, createElement, components, sifoAppNodesMap, needOptimize);
      });
      nodeInstance = createElement(
        RComponent,
        { key: id, ...otherAttrs },
        childrenNodes
      );
      sifoAppNodesMap[optimizeId] = {
        __renderOptimizeMark__,
        nodeInstance
      };
    }
  } else {
    delete sifoAppNodesMap[optimizeId];
    const childrenNodes = children.map(child => {
      return renderFactory(child, createElement, components, sifoAppNodesMap, needOptimize);
    });
    nodeInstance = createElement(
      RComponent,
      { key: id, ...otherAttrs },
      childrenNodes
    );
  }
  return nodeInstance;
}

export default renderFactory;
