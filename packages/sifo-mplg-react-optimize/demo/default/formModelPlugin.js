
const onChangeHandler = (context, e) => {
  const { event, mApi } = context;
  const { key, eventName, next, stop, getAttributes, eventReturnValue } = event;
  console.log('form onChange', e.target.value, eventReturnValue);
  const value = e.target.value;
  mApi.setAttributes(key, { value }, true);
}
class formModelPlugin {
  // 用来标识模型插件身份
  static ID = 'form_test';
  constructor() {
    // 存储模型状态
    this.validator = {};
    this.id2Name = {};// 记录id与name的对应关系
    this.schemaInstance = null;
    this.mApi = null;
  }
  onSchemaInstantiated = (params) => {
    const { mApi, event } = params;
    const { schemaInstance } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
    console.log('schema instance', this.schemaInstance);
  }
  // 增加表单模型方法
  onModelApiCreated = (params) => {
    const { mApi } = params;
    this.mApi = mApi;
    this.schemaInstance.loopDown((node) => {
      const { attributes = {}, id } = node;
      // 表单默认onChange事件，保证没有绑定组件插件时也能处理
      if (attributes.name) {
        // 暂未考虑单元格更新事件
        mApi.addEventListener(id, 'onChange', onChangeHandler)
      }
    })
  }
  // 即将进行渲染
  onReadyToRender = (params) => {
    //
  }
}

export default formModelPlugin;
