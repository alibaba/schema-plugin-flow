  /* tslint:disable: no-any */
interface PluginKeyMap {
  [key: string]: string;
  modelPlugins: string;
  pagePlugins: string;
  componentPlugins: string;
}

interface DynamicObject {
  [key: string]: any;
}
interface ShadowBox {
  shadow: DynamicObject;
  entity: DynamicObject;
  shadowMagic: (exception?: string[]) => void;
}
interface Controller {
  reloadPage: ModelApi['reloadPage'];
}
/**
 * 模型接口
 */
interface ModelApi {
  [key: string]: any;
  /**
   * 命名空间
   */
  namespace: string;
  /**
   * 模型实例Id
   */
  instanceId: string;
  /**
   * 获取externals数据
   */
  getExternals: () => any;
  /**
   * 获取存储在key值下的数据对象，globalData是一个公共数据容器
   */
  getGlobalData: (key?: string) => any;
  /**
   * 存储一个指定key的数据对象
   */
  setGlobalData: (key: string, value: any) => void;
  /**
   * 获取对应id的属性
   */
  getAttributes: (id: string) => DynamicObject | undefined;
  /**
   * 设置指定id节点的 attributes ，refreshImmediately 表示是否立即刷新，默认为true, 批量设置属性时建议传入false,在设置完后调用refresh接口批量刷新
   */
  setAttributes: (id: string, attributes: DynamicObject, refreshImmediately?: boolean) => any;
  /**
   * 更换schema上标识的渲染组件名
   */
  replaceComponent: (id: string, componentName: string) => void;
  /**
   * 获取指定id的渲染组件名
   */
  getComponentName: (id: string) => string | undefined;
  /**
   * 按指定条件查询 schema 节点 id 列表
   * @param selector 格式如："component==Input"、"attributes.rules.required==true"、node => (node.component == 'Input')
   * @param direction 遍历方向，默认 loopDown
   * @param startId 遍历的起始节点 id，loopDown 时默认从根节点开始
   */
  queryNodeIds: (selector: string | Function, direction?: 'loopDown' | 'loopUp', startId?: string) => string[]; 
  /**
   * 组件注册监听事件
   */
  addEventListener: (id: string, eventName: string, handler: SifoEventListener, prepose?: boolean) => void;
  /**
   * 组件注销监听事件
   */
  removeEventListener: (id: string, eventName: string, handler: SifoEventListener, prepose?: boolean) => void;
  /**
   * 对指定组件事件是否有进行监听
   */
  hasEventListener: (id: string, eventName: string) => boolean;
  /**
   * 注册观测事件，一般用于观测指定id节点(key参数)的属性变化，也可用于自定义观测
   */
  watch: (key: string, handler: SifoEventListener) => void;
  /**
   * 注销观测
   */
  removeWatch: (key: string, handler: SifoEventListener) => void;
  /**
   * 分发观测事件，只允许对自定义观测进行分发，节点属性变化由setAttributes分发
   */
  dispatchWatch: (key: string, ...payloads: DispatchPayload[]) => void;
  /**
   * 重新加载页面，reloadPage将重跑所有生命周期。仅在afterRender后生效。
   */
  reloadPage: (params: ReloadPageParams) => void;
  /**
   * 强制刷新页面，一般是在批量更新了节点属性后调用
   */
  refresh: () => any; // 批量修改schema的属性后，调用刷新使更新生效
  /**
   * 获取初始schema
   */
  getInitialSchema: () => SchemaNode; // 初始的schema
  /**
   * 获取渲染时schema
   */
  getSchema: () => SchemaNode | null;
  /**
   * 获取渲染时components
   */
  getComponents: () => DynamicObject | undefined;
}
interface PluginEventArgs {
  mApi: ModelApi;
  event: DynamicObject;
}
/**
 * mApi中间件，next是后续方法，isEnd表明当前方法是否是最后一个
 */
type ModelApiMiddleware = (next: DefaultFunc, isEnd: boolean) => DefaultFunc;
/**
 * 插件生命周期方法handler
 */
type PluginHandler = (args: PluginEventArgs) => void;
/**
 * schema实例化前的插件生命周期方法handler
 */
type PrePluginHandler = (args: object, info?: ModelInformation) => any;

type AnyPluginHandler = PluginHandler | PrePluginHandler;
/**
 * 组件插件项
 */
interface ComponentPluginItem {
  // [handlerName: string]: PluginHandler;
  /**
   * 组件初始化
   */
  onComponentInitial?: PluginHandler; // 8
  /**
   * 页面渲染后
   */
  afterPageRender?: PluginHandler; // 15
}
/**
 * 组件插件集
 */
interface ComponentPluginSet {
  [componentId: string]: ComponentPluginItem;
}
/**
 * 页面插件
 */
interface PagePlugin {
  // [handlerName: string]: AnyPluginHandler | undefined;
  /**
   *  对节点动态修改
   */
  onNodePreprocess?: PrePluginHandler; // 2 对节点有动态修改
  /**
   * 页面初始化
   */
  onPageInitial?: PluginHandler; // 7
  /**
   * 渲染前
   */
  beforeRender?: PluginHandler; // 9
  /**
   * 渲染后
   */
  afterRender?: PluginHandler; // 13
  /**
   * 销毁
   */
  onDestroy?: PluginHandler; // 16
}

// render: 'render', 11
/**
 * 模型插件
 */
interface ModelPlugin {
  ID: string;
  // [handlerName: string]: AnyPluginHandler | undefined;
  // onModelInitial: 'onModelInitial',//1 注：class类型，直接new class
  /**
   * 对schema预处理
   */
  onNodePreprocess?: PrePluginHandler; // 3 schema预处理
  /**
   * 组件包装
   */
  onComponentsWrap?: PrePluginHandler; // 4
  /**
   * schema实例化
   */
  onSchemaInstantiated?: PluginHandler; // 5 schema实例化
  /**
   * 模型接口创建，仅在此周期内能够修改mApi接口
   */
  onModelApiCreated?: PluginHandler; // 6 模型接口创建
  /**
   * 即将进行渲染
   */
  onReadyToRender?: PluginHandler; // 10 即将进行渲染
  /**
   * 渲染后
   */
  afterRender?: PluginHandler; // 12
  /**
   * 销毁
   */
  onDestroy?: PluginHandler; // 17
}
/**
 * 模型实例化可选参数
 */
interface ModelOptions {
  /**
   * 模型接口mApi外传方法
   */
  modelApiRef?: (mApi: ModelApi | null) => void;
  /**
   * 任意外部信息
   */
  externals?: object;
  /**
   * 组件
   */
  components?: object;
  /**
   * 获取模型插件实例化时的构造函数参数
   * @param modelPluginId 模型插件的ID
   */
  getModelPluginArgs?: (modelPluginId: string, info: ModelInformation) => any;
}
/**
 * 可提供参数的模型插件
 */
interface ModelPluginProvider {
  /**
   * 返回模型插件的实例构造参数: (info) => { return [arg1, arg2]; }
   */
  argsProvider?: (modelPluginId: string, info: ModelInformation) => any;
  plugin: ModelPlugin;
}
/**
 * SifoModel插件参数
 */
interface SifoPlugin {
  // [key: string]: ModelPlugin | PagePlugin | ComponentPluginSet | undefined;
  /**
   * 模型插件
   */
  modelPlugin?: ModelPlugin | ModelPluginProvider;
  /**
   * 页面插件
   */
  pagePlugin?: PagePlugin;
  /**
   * 组件插件
   */
  componentPlugin?: ComponentPluginSet;
}
interface ModelInformation {
  instanceId: string;
  namespace?: string;
  externals?: ModelOptions['externals'];
}

type DefaultFunc = (args?: any) => any;
/**
 * 重新加载页面的参数
 */
interface ReloadPageParams {
  /**
   * 任意外部信息
   */
  externals?: ModelOptions['externals'];
  schema?: SchemaNode;
  /**
   * 插件
   */
  plugins?: SifoPlugin[];
  /**
   * 组件
   */
  components?: ModelOptions['components'];
  /**
   * 获取模型插件实例化时的构造函数参数
   * @param modelPluginId 模型插件的ID
   */
  getModelPluginArgs?: ModelOptions['getModelPluginArgs'];
}
