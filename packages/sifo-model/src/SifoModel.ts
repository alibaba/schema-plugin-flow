/**
 * @author FrominXu
 */
import { objectReadOnly } from './utils/common-utils';
import Model from './Model';
/* tslint:disable: no-any no-empty */
const noop = () => { };
/**
 * SifoModel 插件管理模型
 */
export default class SifoModel {
  [key: string]: any;
  namespace: string;
  refreshApi: DefaultFunc;
  externals: ModelOptions['externals'];
  initialSchema: SchemaNode;
  plugins: SifoPlugin[];
  initialComponents: object;
  components: ModelOptions['components'];
  modelApiRef: ModelOptions['modelApiRef'];
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
    plugins: Model['plugins'],
    modelOptions: ModelOptions = { modelApiRef: noop }
  ) {
    this.namespace = namespace;
    this.refreshApi = refreshApi;
    this.initialSchema = schema;
    this.externals = {};
    this.plugins = plugins;
    this.getModelPluginArgs = () => { };
    this.initialComponents = {};
    const controller = {
      reloadPage: this.reloadPage,
    };
    this.model = new Model(namespace, refreshApi, schema, plugins, modelOptions, controller);
    this.bindModelProps(this.model);
    this.modelOptions = modelOptions;
  }
  bindModelProps = (model: Model) => {
    this.namespace = model.namespace;
    this.refreshApi = model.refreshApi;
    this.initialSchema = model.initialSchema;
    this.externals = model.externals;
    this.plugins = model.plugins;
    this.getModelPluginArgs = model.getModelPluginArgs;
    this.initialComponents = model.initialComponents;
  }
  /**
   * 开始运行
   */
  run = () => {
    this.model.run();
  }
  reloadPage: ModelApi['reloadPage'] = (params = {}) => {
    const {
      externals, schema, plugins, components = {}, getModelPluginArgs
    } = params;
    const newSchema = schema || this.initialSchema;
    const newExternals = externals || this.externals || {};
    const newPlugins = plugins || this.plugins;
    const newGetModelPluginArgs = getModelPluginArgs || this.getModelPluginArgs;
    const newInitialComponents = objectReadOnly({ ...this.initialComponents, ...components });
    const newModelOptions: ModelOptions = {
      ...this.modelOptions,
      externals: newExternals,
      getModelPluginArgs: newGetModelPluginArgs,
      components: newInitialComponents
    };
    const discardedModel = this.model;
    // 替换原实例的refreshApi
    if (discardedModel) {
      discardedModel.refreshApi = (callback: Function) => { if (callback) callback(); };
    }
    const controller = {
      reloadPage: this.reloadPage,
    };
    this.model = new Model(this.namespace, this.refreshApi, newSchema, newPlugins, newModelOptions, controller);
    this.bindModelProps(this.model);
    // 执行新实例，放到下个eventloop执行
    setTimeout(() => {
      this.model.run();
    }, 0); // tslint:disable-line: align
  }
  /**
   * 销毁，由外部触发，以进行相关销毁操作
   */
  destroy = () => {
    this.model.destroy();
    // 阻断刷新
    this.model.refreshApi = (callback: Function) => { if (callback) callback(); };
    this.model = null;
  }
}
