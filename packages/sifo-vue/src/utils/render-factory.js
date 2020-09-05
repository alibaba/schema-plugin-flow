/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/**
 *
 * @param {*} node
 * @param {*} createElement
 */
function renderFactory(node, createElement, sifoAppNodesMap, needOptimize) {
  if (typeof node === 'string') return node;
  const {
    component, attributes = {}, id, __renderOptimizeMark__, children = []
  } = node;
  const { muteRenderOptimizeMark = false } = attributes;// eslint-disable-line
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
  if (needOptimize && id && muteRenderOptimizeMark !== true) {
    if (sifoAppNodesMap[id]
      && sifoAppNodesMap[id].__renderOptimizeMark__ === __renderOptimizeMark__) {
      // eslint-disable-next-line prefer-destructuring
      nodeInstance = sifoAppNodesMap[id].nodeInstance;
    } else {
      delete sifoAppNodesMap[id];
      const childrenNodes = children.map(child => {
        return renderFactory(child, createElement, sifoAppNodesMap, needOptimize);
      });
      nodeInstance = createElement(
        component,
        { ...attributes },
        childrenNodes
      );
      sifoAppNodesMap[id] = {
        __renderOptimizeMark__,
        nodeInstance
      };
    }
  } else {
    delete sifoAppNodesMap[id];
    const childrenNodes = children.map(child => {
      return renderFactory(child, createElement, sifoAppNodesMap, needOptimize);
    });
    nodeInstance = createElement(
      component,
      { ...attributes },
      childrenNodes
    );
  }
  return nodeInstance;
}

export default renderFactory;
