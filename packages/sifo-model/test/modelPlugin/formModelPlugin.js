
const onChangeHandler = (context, value, ...other) => {
  const { event, mApi } = context;
  const {
 key, eventName, next, stop, getOldAttributes 
} = event;
const oldValue = getOldAttributes(key).value;
  console.log('form onChange, value:', value, 'oldvalue:', oldValue);
  mApi.setAttributes(key, {
    value
  });
  const updated = event.getUpdatedStates();
  const newValue = mApi.getAttributes(key).value;
  next(`${value}next值`, ...other);// 将后面的值改成next值
  console.log('第一个插件：输入：', value, 'oldValue:', oldValue, 'newValue:',newValue,'updatedStates:', updated );
  // 此时应该不是真实
  console.assert(oldValue !== value, '---------两值不应该相等!!!');
  console.assert(value === newValue, '---------两值应该相等!!!');
  return 'form on change return';
  // onChange的第一个参数是value, 组件插件只需要读取eventResult.value
  // 此处可用model.getExternals().context.beforeChange 和model.getExternals().context.onChange
  // return { value }
};
// 对于不同条件时渲染不同关联组件的情况，可提供一种“可销毁容器组件”，子组件不渲染，也就不会校验。值如何处理？
// 表单模型
class formModelPlugin {
  // 用来标识模型插件身份
  static ID = '06595a73-b0df-4028-95fd-8e08c929dab5';
  constructor(props) {
    console.log('form model plugins arg:', props);
    // 存储模型状态
    this.validator = {};
    this.id2Name = {};// 记录id与name的对应关系
    this.schemaInstance = null;
    this.mApi = null;
  }
  onNodePreprocess = node => {
    //console.log('mode node preprocess:', node.id, node.attributes);
    node.test = 'true';
    if (node.attributes.id === 'test02') {
      node.attributes.label = 'testModelChanged';
      return node;
    }
    return node;
  }
  // 表单组件的包装
  onComponentsWrap = components => {
    const wrappedComps = {};
    Object.keys(components).forEach(key => {
      const comp = components[key];
      wrappedComps[key] = () => {
        // ... react
      };
    });
    return wrappedComps;
  }
  onSchemaInstantiated = params => {
    const { mApi, event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
    console.log('schema instance', this.schemaInstance);
  }
  // 增加表单模型方法
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;
    console.log('form api created -----');
    applyModelApiMiddleware('formatFunc', next => value => {
      console.log('modeltest: formatFunc in mApi', this.mApi.testFunc, value);
      const formatValue = value;
      return next(formatValue);
    });
    applyModelApiMiddleware('setAttributes', next => (...args) => {
      console.log('modeltest: setAttributes in mApi', args);
      return next(...args);
    });
    this.mApi = mApi;
    // addValidator(id, func); blurTrigger/changeTrigger
    // fireOnChange??  getAttributes().onChange(value);  一阶联动？？
    // 增加setValue/getValue/validate方法
    // 更改getSchema方法，以做到组件的销毁功能？
    // setAttributes 进行schema判断，表格列走特殊set方法
    this.schemaInstance.loopDown(node => {
      const { attributes = {}, id } = node;
      // 表单默认onChange事件，保证没有绑定组件插件时也能处理
      if (attributes.name) {
        // 暂未考虑单元格更新事件
        mApi.addEventListener(id, 'onChange', onChangeHandler, true);
      }
    });
  }
  // 即将进行渲染
  onReadyToRender = params => {
    //
  }
  onDestroy = () => {
    console.log('model destroy');
  }
}

export default formModelPlugin;
