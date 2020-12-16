const forbiddenKeys = ['on'];
const classKeys = ['slot', 'key', 'class', 'ref', 'refInFor', 'muteRenderOptimizeMark'];
const classObjects = ['scopedSlots', 'refInFor', 'style', 'attrs', 'props', 'domProps', 'nativeOn'];
const classArray = ['directives'];
/**
 * 对新attrs进行分类并与旧attrs合并，返回以新attrs为角度的合并结果，使用者应该用此与旧attrs合并
 * @param {*} oldAttrs 旧属性，应该是已经分过类的
 * @param {*} newAttrs 新属性，将按key进行分类并合并入旧属性
 * @param {*} silent 新属性不允许有on事件属性，否则提示，silent设置是否打印提示，默认为false
 */
export function classifyAttributes(oldAttrs, newAttrs, silent = false) {
  const reAttrs = {};
  // 以新属性为遍历对象，所以最终的reAttrs只有新属性中有的分类
  Object.keys(newAttrs).forEach(key => {
    if (forbiddenKeys.indexOf(key) >= 0) {
      if (silent !== true) {
        console.warn('[sifo-vue]: you should use addEventListener to listen events.');
      }
      return;
    }
    if (classKeys.indexOf(key) >= 0) {
      // 新值替换旧值
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
  // 返回新属性分类后的结果
  return reAttrs;
}

export default {
  classifyAttributes
};
