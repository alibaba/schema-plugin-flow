/**
 * @author FrominXu
 */
import React from 'react';
import TAGS from './tags';

/**
 * 根据schema渲染为相应react树
 * @param {*} props
 */
function renderFactory(schemaNode, components) {
  const {
    component,
    attributes = {},
    children = [],
  } = schemaNode;
  if (!component) return null;
  let Component = null;
  const targetComp = components[component];
  if (!targetComp) {
    if (TAGS.indexOf(component) === -1) return null;
    Component = component; // 使用原生tag
  } else {
    Component = targetComp.default || targetComp;
  }
  const id = schemaNode.id || attributes.id;
  return (
    <Component
      key={id}
      {...attributes}
    >
      {
        children && children.length > 0 ? children.map(child => {
          if (!child) {
            return null;
          }
          if (typeof child === 'string') {
            return child;
          }
          return renderFactory(child, components);
        }) : null
      }
    </Component>
  );
}

export default renderFactory;
