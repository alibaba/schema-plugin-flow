/**
 * @author FrominXu
 */
import uuid from 'uuid';
import { nodeRevise } from './utils/schema-utils';
import { objectReadOnly, deepClone, hasOwnProperty, evaluateSelector, createShadow } from './utils/common-utils';
import SchemaTree from './SchemaTree';
import EventEmitter from './Event';
import Watcher from './Watcher';
import TaskQueue from './TaskQueue';

/**
 * 组件插件生命周期方法
 */
enum COMP_HANDLER {
  onComponentInitial = 'onComponentInitial', // 8
  afterPageRender = 'afterPageRender', // 14 这时组件一般（不能保证）已经渲染
  // onDestroy = 'onDestroy', // 15
}
/**
 * 页面插件生命周期方法
 */
enum PAGE_HANDLER {
  onNodePreprocess = 'onNodePreprocess', // 2 对节点有动态修改
  onPageInitial = 'onPageInitial', // 7
  beforeRender = 'beforeRender', // 9
  afterRender = 'afterRender', // 13
  onDestroy = 'onDestroy', // 16
}
// render: 'render', 11
/**
 * 模型插件生命周期方法
 */
enum MODEL_HANDLER {
  // onModelInitial: 'onModelInitial',//1 注：class类型，直接new class
  onNodePreprocess = 'onNodePreprocess', // 3 schema预处理
  onComponentsWrap = 'onComponentsWrap', // 4
  onSchemaInstantiated = 'onSchemaInstantiated', // 5 schema实例化
  onModelApiCreated = 'onModelApiCreated', // 6 模型接口创建
  onReadyToRender = 'onReadyToRender', // 10 即将进行渲染
  afterRender = 'afterRender', // 12
  onDestroy = 'onDestroy', // 17
}

// 三类插件在plugins参数的项中的键名
const pluginKeyMap: PluginKeyMap = {
  modelPlugins: 'modelPlugin',
  pagePlugins: 'pagePlugin',
  componentPlugins: 'componentPlugin'
};
// tslint:disable-next-line: no-empty
const noop = () => { };
const defArgs = () => ([]);
/**
 * SifoModel 插件管理模型
 */
export default class Model {
  // tslint:disable-next-line: no-any
  [key: string]: any;
  instanceId: string;
  namespace: string;
  refreshApi: DefaultFunc;
  externals: ModelOptions['externals'];
  initialSchema: SchemaNode;
  plugins: SifoPlugin[];
  modelPluginIds: (string | ModelPlugin)[];
  initialComponents: object;
  components: ModelOptions['components'];
  mApi: ModelApi | null;
  schemaReadied: boolean;
  targetSchema: SchemaNode;
  rendered: boolean;
  modelApiRef: ModelOptions['modelApiRef'];
  globalDataContainer: DynamicObject;
  taskQueue: TaskQueue;
  shadowBox: ShadowBox | null;
  controller: Controller;
  /**
   *
   * @param namespace 命名空间
   * @param refreshApi 刷新执行接口，如有传callback参数，应在刷新完成后回调
   * @param schema schema
   * @param plugins 插件
   * @param modelOptions 可选参数
   */
  constructor(
    namespace: string,
    refreshApi: DefaultFunc,
    schema: SchemaNode,
    plugins: SifoPlugin[],
    modelOptions: ModelOptions = { modelApiRef: noop },
    controller: Controller,
  ) {
    const { externals, components, modelApiRef, getModelPluginArgs } = modelOptions; // 模型选项
    /** * 初始环境 ** */
    this.instanceId = uuid(); // 用来唯一标识模型实例
    this.namespace = namespace || this.instanceId; // 命名空间用来唯一标识模型，
    this.refreshApi = refreshApi;
    this.externals = externals || {}; // 任意externals
    this.initialSchema = schema || {}; // 初始的schema
    this.plugins = plugins || [];
    this.getModelPluginArgs = getModelPluginArgs || defArgs;
    this.initialComponents = objectReadOnly(components || {}); // 不能改原始组件映射关系
    this.components = {};
    this.mApi = null; // 模型接口
    this.schemaReadied = false;
    this.targetSchema = {}; // 经过处理的schema,用来创建树实例
    this.rendered = false; // 标识是否已经渲染
    this.modelApiRef = modelApiRef || noop; // 对外暴露modelApi
    /** * 数据容器 ** */
    this.globalDataContainer = {}; // 全局数据容器
    this.modelPluginIds = []; // 记录加载过的模型插件
    // 执行队列
    this.taskQueue = new TaskQueue();
    // 影子盒
    this.shadowBox = null;
    // 控制器
    this.controller = controller;
  }
  /**
   * 重置，清空数据，重置状态，给 modelApiRef 传 null 值
   */
  reset = () => {
    /*
      这几个值不能重置，因为在reloadPage中会要使用
      this.initialSchema
      this.externals
      this.plugins
      this.initialComponents
      this.taskQueue
     */
    this.rendered = false;
    this.eventEmitter = null; // 事件
    this.watcher = null; // 观测
    this.schemaInstance = null; // schema实例
    this.globalDataContainer = {};
    this.modelPluginIds = [];
    /** * 插件 ** */
    this.modelPlugins = []; // 模型插件-管模型功能
    this.pagePlugins = []; // 页面插件-管页面生命周期
    this.componentPlugins = []; // 组件插件
    // 如果有上层需要管理多个model，必然是有个地方存储了这个model，应用modelApiRef来接model方法
    this.mApi = null;
    this.schemaReadied = false;
    // 使用modelApiRef方式向外暴露mApi，此处调用是防止内存泄漏
    if (this.modelApiRef) {
      this.modelApiRef(null);
    }
    // 影子盒
    this.shadowBox = null;
  }
  /**
   * 开始运行
   */
  run = () => {
    if (!this.refreshApi || typeof this.refreshApi !== 'function') {
      console.error('[sifo-model] refresh api is not defined!');
      return;
    }
    this.runLifecycle();
  }

  // 执行生命周期方法
  runLifecycle = () => {
    // 改成执行队列，就可以支持被终止了
    this.taskQueue.push(
      [
        this.reset,
        this.onModelInitial,
        this.onNodePreprocess,
        this.onComponentsWrap,
        this.onSchemaInstantiated,
        this.onModelApiCreated,
        this.onPageInitial,
        this.onComponentInitial,
        this.beforeRender,
        this.onReadyToRender,
        this.openSchema,
        this.render
      ]
    ).run();
    // this.afterRender(); 在render内调用，不显式写在此处
    // this.destroy(); 由外部调用
  }
  /**
   * 将插件分到相应的handler中去
   */
  splitPlugins = (plugins: SifoPlugin[]) => {
    if (!Array.isArray(plugins)) {
      throw new Error('[sifo-model] plugins expected array');
    }
    Object.keys(pluginKeyMap).forEach((key: string) => {
      // tslint:disable-next-line: no-any
      plugins.forEach((pluginsItem: any) => {
        const plgName = pluginKeyMap[key];
        const plugin = pluginsItem[plgName];
        if (!plugin) { return; }
        if (key === 'modelPlugins') { // 模型插件是class形式
          // tslint:disable-next-line: no-any
          let modelPlugin: any = plugin;
          let getModelPluginArgs = this.getModelPluginArgs;
          if (typeof modelPlugin === 'object') {
            const { argsProvider, plugin: mPlg } = <ModelPluginProvider> modelPlugin;
            if (!mPlg) return;
            modelPlugin = mPlg;
            if (argsProvider && typeof argsProvider === 'function') {
              getModelPluginArgs = argsProvider;
            }
          }
          // 获取模型创建参数
          const Id = modelPlugin.ID;
          if (!(this.modelPluginIds.indexOf(modelPlugin) === -1 && this.modelPluginIds.indexOf(Id) === -1)) {
            console.info(`[sifo-model] ${plgName}: ${Id || 'No_ID_Model_Plugin'} already exist.`);
            return;
          }
          // 模型插件既要判断ID也要判断本身
          if (Id) { // 有可能被多次引入
            this.modelPluginIds.push(Id);
          }
          this.modelPluginIds.push(plugin);
          const info = {
            instanceId: this.instanceId,
            namespace: this.namespace,
            externals: this.externals
          };
          try {
            let newParams = getModelPluginArgs(Id, info); // [a, b]
            if (!newParams || !Array.isArray(newParams)) newParams = [newParams];
            const mPlugin = new modelPlugin(...newParams);
            this[key].push(mPlugin);
          } catch (e) {
            console.error(`[sifo-model] new ${plgName} ${Id || 'No_ID_Model_Plugin'} failed. errMsg: ${e}`);
          }
        } else {
          if (this[key].indexOf(plugin) === -1) {
            this[key].push(plugin);
          } else {
            console.info(`[sifo-model] a ${plgName} duplicated`);
          }
        }
      });
    });
  }
  /**
   * 模型初始化
   */
  onModelInitial = () => {
    /* 此处隐式 onModelInitial，模型插件是class类型，在splitPlugins中实例化 */
    this.splitPlugins(this.plugins);
  }
  /**
   * schema节点预处理周期
   */
  onNodePreprocess = () => {
    const pageHandlers: AnyPluginHandler[] = this.getPageHandlers(PAGE_HANDLER.onNodePreprocess);
    const targetSchema = this.doNodePreprocess(<PrePluginHandler[]> pageHandlers, this.initialSchema);
    const modelHandlers: AnyPluginHandler[] = this.getModelHandlers(MODEL_HANDLER.onNodePreprocess);
    this.targetSchema = this.doNodePreprocess(<PrePluginHandler[]> modelHandlers, targetSchema);
  }
  doNodePreprocess = (handlers: PrePluginHandler[], dealSchema: object) => {
    let targetSchema = deepClone(dealSchema); // 拷贝,可能有function，不能用JSON.stringify
    if (!handlers || handlers.length === 0) { return targetSchema; }
    const informations = {
      instanceId: this.instanceId,
      namespace: this.namespace,
      externals: this.externals
    };
    // 这是个按层遍历方法
    targetSchema = nodeRevise(targetSchema, (node: SchemaNode) => {
      let newNode = node;
      for (let i = 0; i < handlers.length; i += 1) {
        // 周期方法onNodePreprocess是普通函数，参数是node对象，应返回处理后的node
        const retNode = handlers[i]({ ...newNode }, informations);
        newNode = retNode || newNode;
      }
      newNode.attributes = { ...newNode.attributes }; // 防止为null
      return newNode;
    });
    return targetSchema;
  }

  /**
   * 组件包装
   */
  onComponentsWrap = () => {
    const handlers = this.getModelHandlers(MODEL_HANDLER.onComponentsWrap);
    const actualComponents = { ...this.initialComponents };
    for (let i = 0; i < handlers.length; i += 1) {
      // 周期方法onComponentsWrap是普通函数，唯一参数是actualComponents对象
      const eHandler: AnyPluginHandler = handlers[i];
      const wrappedComps = (<PrePluginHandler> eHandler)({ ...actualComponents });
      if (wrappedComps) {
        Object.assign(actualComponents, wrappedComps);
      }
    }
    this.components = Object.assign({}, this.initialComponents, actualComponents);
  }
  /**
   * 创建schema实例
   */
  onSchemaInstantiated = () => {
    this.schemaInstance = new SchemaTree(this.targetSchema);
    const handlers = this.getModelHandlers(MODEL_HANDLER.onSchemaInstantiated);
    const event = {
      eventType: MODEL_HANDLER.onSchemaInstantiated,
      schemaInstance: this.schemaInstance,
      namespace: this.namespace,
      instanceId: this.instanceId,
      externals: this.externals,
    };
    this.reducer(handlers, event);
  }
  /**
   * 构建modelApi
   */
  createModelApi: () => ModelApi = () => (
    {
      namespace: this.namespace,
      instanceId: this.instanceId,
      getExternals: () => this.externals,
      getGlobalData: this.getGlobalData,
      setGlobalData: this.setGlobalData,
      getAttributes: this.getAttributes,
      setAttributes: this.setAttributes,
      replaceComponent: this.replaceComponent, // 动态更改渲染组件
      getComponentName: this.getComponentName, // 获取指定id的渲染组件名
      queryNodeIds: this.queryNodeIds, // 查询节点Id，返回的是数组
      /* 注：可考虑支持这些功能，但会涉及很多地方的处理 --> schema应该是一份完全的数据，不应该有动态节点变化
        removeChildren/addChildren/copyNode 要处理schemaInstance重建（以最新的schema为基础），
        EventEmitter的instance更换-局部更新
        模型插件监听这些事件做相应变化（如保存的状态，是否合法等），过滤所有方法属性, id处理等
      */
      addEventListener: this.addEventListener,
      removeEventListener: this.removeEventListener,
      watch: this.watch,
      removeWatch: this.removeWatch,
      dispatchWatch: this.dispatchWatch,
      hasEventListener: this.hasEventListener, // 对指定事件是否有进行监听
      reloadPage: this.reloadPage,
      refresh: this.refresh, // 批量修改schema的属性后，调用刷新使更新生效
      getInitialSchema: () => deepClone(this.initialSchema), // 初始的schema，用深拷贝
      getSchema: () => {
        if (this.schemaInstance) {
          // mApi 取到的schema应该是不能直接改的，用浅拷贝，也就是拷贝的节点层
          return nodeRevise(this.schemaInstance.parsedTree, (node: SchemaNode) => {
            const clonedNode = { ...node, attributes: { ...node.attributes } };
            return clonedNode;
          });
        }
        return null;
      },
      getComponents: () => ({ ...this.components }),
      // 注： registPlugins: this.registPlugins, // 注册插件是否在插件给？=> 暂不放开，注意模型插件的权限
      // to think: registComponent，有时可能需要由外部组件来包装已存在组件，达到保留原组件逻辑的情况下修改渲染样式
      // 不放开 schemaLoopUp: this.loopUp,
      // 不放开 schemaLoopDown: this.loopDown,
    }
  )

  /**
   * 创建模型api, 可在此修改模型方法
   */
  onModelApiCreated = () => {
    const mApi: ModelApi = this.createModelApi();
    const shadowBox = createShadow(mApi);
    this.shadowBox = shadowBox;
    this.mApi = this.shadowBox.shadow as ModelApi;
    // 创建事件注册对象
    this.eventEmitter = new EventEmitter(this.mApi);
    this.watcher = new Watcher(this.eventEmitter);
    this.eventEmitter.injectWatcher(this.watcher);
    // 接口mApi依赖的对象在此时都应该创建完毕
    const handlers = this.getModelHandlers(MODEL_HANDLER.onModelApiCreated);
    // mApi扩展中间件实现
    const applyModelApiMiddleware = (apiName: string, middleware: ModelApiMiddleware) => {
      if (!this.mApi || !apiName || !middleware) { return; }
      const originFunc = this.mApi[apiName];
      if (!originFunc) {
        this.mApi[apiName] = middleware(v => v, true); // 兼容多模型插件时出现此方法
      } else {
        if (typeof originFunc !== 'function') { return; }
        this.mApi[apiName] = middleware(originFunc, false);
      }
    };
    const event = {
      applyModelApiMiddleware,
      eventType: MODEL_HANDLER.onModelApiCreated,
    };
    this.reducer(handlers, event);
    // 锁定mApi方法，防止被修改
    const refApi = objectReadOnly({
      ...this.mApi,
      // ref 的 mApi.getSchema 是频繁方法，不适合频繁clone
      getSchema: () => {
        // 在插件未执行完之前，不返回渲染 schema，因为这时候 schema 还处在半加工状态
        if (!this.schemaReadied) {
          return {};
        }
        return this.schemaInstance.parsedTree;
      },
    }) as ModelApi;
    objectReadOnly(this.mApi);
    if (this.modelApiRef) {
      this.modelApiRef(refApi);
    }
  }
  /**
   * 界面初始化，处理一些全局的逻辑
   */
  onPageInitial = () => {
    const handlers = this.getPageHandlers(PAGE_HANDLER.onPageInitial);
    const event = { eventType: PAGE_HANDLER.onPageInitial };
    this.reducer(handlers, event);
  }
  /**
   * 组件初始化，修改组件属性
   */
  onComponentInitial = () => {
    this.schemaInstance.loopDown((node: SchemaNode) => {
      const { id, attributes } = node;
      const attribute = objectReadOnly({ ...attributes }); // 防止直接修改，否则可能影响eventListener
      // onComponentInitial内通过model.setAttributes方法更新属性。
      if (id) {
        const handlers = this.getComponentHandlers(
          id,
          COMP_HANDLER.onComponentInitial
        );
        const event = {
          key: id,
          eventType: COMP_HANDLER.onComponentInitial,
          __attributes: attribute
        };
        this.reducer(handlers, event);
      }
    });
  }
  /**
   * 渲染前
   */
  beforeRender = () => {
    const handlers = this.getPageHandlers(PAGE_HANDLER.beforeRender);
    const event = { eventType: PAGE_HANDLER.beforeRender };
    this.reducer(handlers, event);
  }
  /**
   * 即将渲染
   */
  onReadyToRender = () => {
    const handlers = this.getModelHandlers(MODEL_HANDLER.onReadyToRender);
    const event = {
      eventType: MODEL_HANDLER.onReadyToRender,
    };
    this.reducer(handlers, event);
  }
  /**
   * 放开渲染 schema，在此之前 refApi 的 getSchema 方法不会返回
   */
  openSchema = () => {
    this.schemaReadied = true;
  }
  /**
   * 渲染
   */
  render = () => {
    this.refreshApi(() => {
      // 由于render方法内无法被discard，也就是执行了render一定会执行到这里，所以异步push不会导致推入到新队列的问题
      this.taskQueue.push([
        () => { this.rendered = true; }, // 放开标识，更新即时渲染，不能放到最后，否则在周期结束后得不到最新渲染
        this.afterRender,
        this.afterPageRender,
      ]).run();
    });
  }
  /**
   * 渲染后
   */
  afterRender = () => {
    /**
     * 1. The second parameter to setState() is an optional callback function 
     * that will be executed once setState is completed and the component is re-rendered（updated）.
     * 2. react setState callback 是一个 task，如果再用 setTimeout，就会再产生一个 task，
     * 而如果在 run 开始时就发起一个请求，在 response 后进行 reloadPage，
     * 此时的 response 可能在第一个 task 后，也可能在第二个 task 后注入 microtask queue 中(不兼容时可能是个task)
     */
    // setTimeout(() => {
    const mHandlers = this.getModelHandlers(MODEL_HANDLER.afterRender);
    const mEvent = { eventType: MODEL_HANDLER.afterRender };
    this.reducer(mHandlers, mEvent);
    const handlers = this.getPageHandlers(PAGE_HANDLER.afterRender);
    const event = { eventType: PAGE_HANDLER.afterRender };
    this.reducer(handlers, event);
    // }, 0);
  }

  afterPageRender = () => {
    this.schemaInstance.loopDown((node: SchemaNode) => {
      const { id, attributes } = node;
      const attribute = objectReadOnly({ ...attributes }); // 防止直接修改，否则可能影响eventListener
      if (id) {
        const handlers = this.getComponentHandlers(
          id,
          COMP_HANDLER.afterPageRender
        );
        const event = {
          key: id,
          eventType: COMP_HANDLER.afterPageRender,
          __attributes: attribute
        };
        this.reducer(handlers, event);
      }
    });
  }
  /**
   * 销毁，由外部触发，以进行相关销毁操作
   */
  destroy = () => {
    this.taskQueue.discard();
    if (this.shadowBox) {
      this.shadowBox.shadowMagic();
    }
    this.rendered = false; // 屏蔽refreshApi的调用，但允许mApi的调用
    if (this.modelApiRef) {
      this.modelApiRef(null);
    }
    const pageHandlers: AnyPluginHandler[] = this.getPageHandlers(PAGE_HANDLER.onDestroy);
    const pEvent = {
      eventType: PAGE_HANDLER.onDestroy,
    };
    this.reducer(pageHandlers, pEvent);
    const modelHandlers: AnyPluginHandler[] = this.getModelHandlers(MODEL_HANDLER.onDestroy);
    const mEvent = {
      eventType: MODEL_HANDLER.onDestroy,
    };
    this.reducer(modelHandlers, mEvent);
    // 由于在销毁时可能还有异步回调执行，为使执行不报错，故不进行清理，GC 会自动处理 this.reset(); // 清空数据
  }

  registPlugins = (plugins: SifoPlugin[]) => {
    this.splitPlugins(plugins);
  }

  getModelHandlers(event: Exclude<keyof ModelPlugin, 'ID'>): AnyPluginHandler[] {
    const handlers: AnyPluginHandler[] = [];
    this.modelPlugins.forEach((handler: ModelPlugin) => {
      if (handler && hasOwnProperty(handler, event)) {
        const item = handler[event];
        if (item) {
          handlers.push(item);
        }
      }
    });
    return handlers;
  }

  getPageHandlers(event: keyof (PagePlugin)): AnyPluginHandler[] {
    const handlers: AnyPluginHandler[] = [];
    this.pagePlugins.forEach((handler: PagePlugin) => {
      if (handler && hasOwnProperty(handler, event)) {
        const item = handler[event];
        if (item) {
          handlers.push(item);
        }
      }
    });
    return handlers;
  }

  getComponentHandlers(id: string, event: keyof (ComponentPluginItem)) {
    const handlers: AnyPluginHandler[] = [];
    this.componentPlugins.forEach((plgSet: ComponentPluginSet) => {
      if (plgSet[id] && hasOwnProperty(plgSet[id], event)) {
        const compHandler: ComponentPluginItem = plgSet[id];
        const item = compHandler[event];
        if (item) {
          handlers.push(item);
        }
      }
    });
    return handlers;
  }
  /**
   * 插件reducer
   * @param {*} handlers
   * @param {*} event
   * @param {*} cancelable
   */
  reducer(handlers: PluginHandler[], event: DynamicObject, cancelable: boolean = false) {
    const args: PluginEventArgs = <PluginEventArgs> objectReadOnly({ event, mApi: this.mApi });
    if (cancelable) { args.event.cancel = false; }
    for (let i = 0; i < handlers.length; i += 1) {
      handlers[i](args);
      if (cancelable && args.event.cancel === true) {
        return;
      }
    }
    return;
  }

  /**
   * 向上遍历，loopFunc如果返回false,则不继续遍历
   */
  loopUp = (loopFunc: DefaultFunc, id: string) => {
    this.schemaInstance.loopUp(loopFunc, id);
  }
  /**
   * 向下遍历，默认从根节点开始，loopFunc如果返回false,则不继续遍历
   */
  loopDown = (loopFunc: DefaultFunc, id: string) => {
    this.schemaInstance.loopDown(loopFunc, id);
  }
  /**
   * 设置指定节点的属性
   * @param {string} id 指定节点的 id
   * @param {object} attributes 指定节点的属性
   * @param {boolean} refreshImmediately 是否立即刷新，默认为true, 批量设置时建议在设置完后调用refresh接口刷新
   */
  setAttributes: ModelApi['setAttributes'] = (id: string, attributes: DynamicObject, refreshImmediately = true) => {
    const item = this.schemaInstance.nodeMap[id];
    if (item) {
      const usedAttrs: DynamicObject = {};
      Object.keys(attributes || {}).forEach(attrName => {
        if (this.eventEmitter.hasHandler(id, attrName)) {
          console.error(`[sifo-model] ${id}.${attrName} is in EventListener, please use addEventListener`);
          return;
        }
        usedAttrs[attrName] = attributes[attrName];
      });
      item.attributes = { ...item.attributes, ...usedAttrs };
      if (refreshImmediately) {
        return this.refresh();
      }
    }
    return new Promise(resolve => resolve('id_not_found'));
  }
  /**
   * 更换渲染组件
   */
  replaceComponent: ModelApi['replaceComponent'] = (id: string, componentName: string) => {
    const item = this.schemaInstance.nodeMap[id];
    if (item) {
      item.component = componentName;
      this.refresh();
    }
  }
  /**
   * 获取指定id的渲染组件名
   */
  getComponentName: ModelApi['getComponentName'] = (id: string) => {
    const item = this.schemaInstance.nodeMap[id];
    if (item) {
      return item.component;
    }
    return undefined;
  }

  getAttributes: ModelApi['getAttributes'] = (id: string) => {
    const node = this.schemaInstance.nodeMap[id];
    if (!node) { return undefined; }
    return { ...node.attributes }; // 防止直接修改
  }

  getGlobalData: ModelApi['getGlobalData'] = key => {
    if (key) {
      return this.globalDataContainer[key];
    }
    return this.globalDataContainer;
  }

  setGlobalData: ModelApi['setGlobalData'] = (key, data) => {
    this.globalDataContainer[key] = data;
  }

  queryNodeIds: ModelApi['queryNodeIds'] = (selector, direction = 'loopDown', id = '') => {
    const func = direction === 'loopUp' ? this.loopUp : this.loopDown;
    const ids: string[] = [];
    func((node) => {
      if (evaluateSelector(node, selector)) {
        ids.push(node.id);
      }
    },   id);
    return ids;
  }

  refresh: ModelApi['refresh'] = () => {
    if (!this.rendered) { return Promise.resolve(); }
    return new Promise(resolve => this.refreshApi(resolve));
  }

  /**
   * (公开方法）重新加载 包含schema 
   * @param {*} params 新的初始数据
   */
  reloadPage: ModelApi['reloadPage'] = (params = {}) => {
    if (this.shadowBox) {
      this.shadowBox.shadowMagic(['reloadPage']);
    }
    this.taskQueue.discard();
    // 调用控制器的reloadPage
    this.controller.reloadPage(params);
  }
  // 如果有方法是直接绑定在属性上，是否让后续插件覆盖? => 覆盖，eventListener优先级高于普通属性
  // tslint:disable-next-line: max-line-length
  addEventListener: ModelApi['addEventListener'] = (id: string, eventName: string, handler: SifoEventListener, prepose: boolean = false) => {
    let item = this.schemaInstance.nodeMap[id];
    if (!item) {
      console.error(`[sifo-model] addEventListener id:${id} not found`);
      return;
    }
    const eventHandler = this.eventEmitter.addEventListener(id, eventName, handler, prepose);
    // 这里不能用setAttributes方法修改属性,因为setAttributes要保护监听方法不被覆盖
    item.attributes = {
      ...item.attributes, // 此中可能已经有[eventName]了
      [eventName]: eventHandler
    };
    if (this.mApi) {
      this.mApi.setAttributes(id, {}, true); // 通知属性变化
    }
  }

  // tslint:disable-next-line: max-line-length
  removeEventListener: ModelApi['removeEventListener'] = (id: string, eventName: string, handler: SifoEventListener, prepose: boolean = false) => {
    this.eventEmitter.removeEventListener(id, eventName, handler, prepose);
  }

  // tslint:disable-next-line: max-line-length
  hasEventListener: ModelApi['hasEventListener'] = (id: string, eventName: string) => this.eventEmitter.hasHandler(id, eventName);

  watch: ModelApi['watch'] = (key: string, handler: SifoEventListener) => {
    this.watcher.watch(key, handler);
  }

  removeWatch: ModelApi['removeWatch'] = (key: string, handler: SifoEventListener) => {
    this.watcher.removeWatch(key, handler);
  }

  dispatchWatch: ModelApi['dispatchWatch'] = (key: string, ...payloads: DispatchPayload[]) => {
    const item = this.schemaInstance.nodeMap[key];
    // 此dispatch用于做事件分发，对于schema节点无效
    if (item) {
      console.error('[sifo-model] dispatchWatch is invalid on schema Id');
      return;
    }
    this.watcher.dispatchWatch([{ [key]: payloads }]);
  }
}
