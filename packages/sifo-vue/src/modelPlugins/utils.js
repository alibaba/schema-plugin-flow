const forbiddenKeys = ['on'];
const classKeys = ['slot', 'key', 'ref', 'refInFor', 'muteRenderOptimizeMark'];
const classObjects = ['scopedSlots', 'refInFor', 'style', 'attrs', 'props', 'domProps', 'nativeOn'];
const classArray = ['directives'];
export function classifyAttributes(oldAttrs, newAttrs) {
  const reAttrs = {};
  Object.keys(newAttrs).forEach(key => {
    if (forbiddenKeys.indexOf(key) >= 0) {
      console.warn('[sifo-vue]: you should use addEventListener to listen events.');
      return;
    }
    if (classKeys.indexOf(key) >= 0) {
      reAttrs[key] = newAttrs[key];
    } else if (classObjects.indexOf(key) >= 0) {
      const oldClassValue = oldAttrs[key] || {};
      // 对象合并
      reAttrs[key] = {
        ...oldClassValue, ...newAttrs[key]
      };
    } else if (classArray.indexOf(key) >= 0) {
      // 数组替换
      reAttrs[key] = newAttrs[key];
    } else {
      // 其余都放到props中
      reAttrs.props = { ...oldAttrs.props, ...reAttrs.props, [key]: newAttrs[key] };
    }
  });
  return reAttrs;
}

export default {
  classifyAttributes
};
