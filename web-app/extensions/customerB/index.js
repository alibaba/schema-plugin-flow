import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import ShowWarehouseCapacity from './ShowWarehouseCapacity';
import './index.less';
// 客户B在选择仓库时，需要能即时查询库存容量状态，以便选择最合适的仓库
const componentPlugin = {
  warehouse: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      // 替换成可展示库存数量的组件
      const originCompName = mApi.getComponentName(event.key);
      const comps = mApi.getComponents();
      const originComp = comps[originCompName];
      mApi.replaceComponent(event.key, 'ShowWarehouseCapacity');
      mApi.setAttributes(event.key, {
        itemChildren: originComp
      });
    }
  }
};
const singleton = new SifoSingleton('form-demo');
singleton.registerItem('customerB_Ext', () => {
  return {
    plugins: [
      {
        componentPlugin
      }
    ],
    components: { ShowWarehouseCapacity }
  };
});

export default singleton;
