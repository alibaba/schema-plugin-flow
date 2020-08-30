/**
 * @author FrominXu
 */
/* tslint:disable: no-any no-empty */
export const hasOwnProperty = (obj: object, propName: any) => Object.hasOwnProperty.call(obj, propName);

export const keyHolder = (key: any, defValue: any) => {
  if (key === null || key === undefined) return defValue;
  return `${key}`;
};

/**
 * schema节点遍历，从自身开始，深度优先
 * @param node 
 * @param target 
 * @param loopFunc 
 * @param nodeMap 
 */
export const schemaTraverser = (node: SchemaNode, target: string, loopFunc: DefaultFunc, nodeMap?: DynamicObject) => {
  if (!node) return;
  if (!loopFunc) return;
  if (typeof node !== 'object') return;
  let goOn = loopFunc(node);
  if (goOn === false) return false; // 返回false，则不再继续遍历
  if (goOn === 'continue') return; // 返回 continue，则不再沿此分支上继续遍历，但依然遍历兄弟分支
  // goOn 不是 false或continue 则继续遍历下个节点
  const nextNode = node[target];
  if (nextNode) {
    if (Array.isArray(nextNode)) {
      nextNode.forEach(next => {
        if (goOn === false) return; // 任一分支置为false，则不再遍历
        goOn = schemaTraverser(next, target, loopFunc, nodeMap);
      });
    } else if (typeof nextNode === 'string' && nodeMap) {
      // 因为节点只存储parentId，如果有parentId重名时，要判断node的父节点是谁
      const id = nextNode;
      let mapNode = nodeMap[id];
      // 存在重复
      if (id && mapNode && nodeMap.__duplicated__id__node__ && nodeMap.__duplicated__id__node__[id]) {
        nodeMap.__duplicated__id__node__[id].forEach((dup: SchemaNode) => {
          const { children: dChildren } = dup;
          if (dChildren) {
            const dIdx = dChildren.indexOf(node); // 当前节点是某重复id节点的子节点
            if (dIdx >= 0) mapNode = dup; // 找到真正的parent
          }
        });
      }
      goOn = schemaTraverser(mapNode, target, loopFunc, nodeMap);
    } else {
      goOn = schemaTraverser(nextNode, target, loopFunc, nodeMap);
    }
  }
  return goOn;
};

export const objectReadOnly = (obj: object) => {
  Object.keys(obj).forEach(key => {
    Object.defineProperty(obj, key, {
      writable: false, // 不可写
      configurable: false, // 不可删
    });
  });
  return obj;
};

export function deepClone(obj: any): any {
  if (obj === null || obj === undefined || obj === '') return obj;
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  } else if (typeof obj === 'object') {
    return Object.keys(obj)
      .map(k => ({ [k]: deepClone(obj[k]) }))
      .reduce((a, c) => Object.assign(a, c), {});
  }
  return obj;
}

function getValueByKeyPath(obj: DynamicObject, keyPath: string) {
  if (!obj || !keyPath) return;
  const keys = keyPath.split('.');
  let result = undefined;
  let curObj = obj;
  for (let i = 0; i < keys.length; i++) {
    let toKey = keys[i];
    if (!curObj || typeof curObj !== 'object' || !hasOwnProperty(curObj, toKey)) {
      break;
    }
    curObj = curObj[toKey];
    if (i === keys.length - 1) {
      result = curObj;
    }
  }
  return result === undefined ? '' : `${result}`;
}

export function evaluateSelector(node: SchemaNode, selector: string | Function) {
  if (typeof selector === 'string') {
    const temp = selector.split('==');
    if (temp.length !== 2) return false;
    const targetKey = temp[0];
    const conditionValue = temp[1];
    const targetValue = getValueByKeyPath(node, targetKey);
    // tslint:disable-next-line:triple-equals
    return targetValue == conditionValue;
  } else if (typeof selector === 'function') {
    const { children, attributes, ...others } = node;
    const childrenIds = children ? children.map(no => no.id) : [];
    return !!selector({ ...others, attributes: { ...attributes }, childrenIds });
  }
  return false;
}
/**
 * 影子魔法，真实方法被替换
 * @param shadowBox 
 */
const shadowMagic = (entity: DynamicObject, exception?: string[]) => {
  let warned = false;
  Object.keys(entity).forEach(key => {
    const value = entity[key];
    if (exception && exception.indexOf(key) >= 0) return;
    if (typeof value === 'function') {
      const markedFun = (...arg: any[]) => {
        if (!warned) {
          warned = true;
          console.warn(`[sifo-model] you called mApi that links to a discarded model, this appears when mApi called after the mApi.reloadPage or destroy has been executed.`);
        }
        return value(...arg);
      };
      entity[key] = markedFun;
    } else {
      entity[key] = value;
    }
  });
  return;
};
/**
 * 创建一个影子，向外暴露的是影子
 * @param entity 
 */
export const createShadow = (entity: DynamicObject) => {
  const shadow: any = {};
  Object.keys(entity).forEach(key => {
    const value = entity[key];
    if (typeof value === 'function') {
      shadow[key] = (...arg: any[]) => (entity[key](...arg)); // 用entity来检索，而不直接使用value
    } else {
      shadow[key] = value;
    }
  });
  const shadowBox: ShadowBox = {
    shadow,
    entity,
    shadowMagic: (exception) => shadowMagic(entity, exception)
  };
  return shadowBox;
};
