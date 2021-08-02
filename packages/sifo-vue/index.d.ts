

declare module '@schema-plugin-flow/sifo-vue' {
  import * as SifoModelTypes from '@schema-plugin-flow/sifo-model';
  export { SifoModelTypes };

  export interface SifoAppProps {
    className?: string;
    /**
     * SifoModel插件
     */
    plugins?: SifoModelTypes.SifoPlugin[];
    /**
     * 命名空间
     */
    namespace: string;
    schema: SifoModelTypes.SchemaNode;
    components: SifoModelTypes.ModelOptions['components'];
    /**
     * 任意外部信息
     */
    externals?: SifoModelTypes.ModelOptions['externals'];
    /**
     * 模型实例化可选参数
     */
    modelApiRef?: SifoModelTypes.ModelOptions['modelApiRef'];
    /**
     * 是否开启sifo-logger打印
     */
    openLogger?: boolean;
    getModelPluginArgs?: SifoModelTypes.ModelOptions['getModelPluginArgs'];
    /**
     * 任意对象，mApi.getSifoExtProps 可以取到即时的值，这点与 externals 相区别
     */
    sifoExtProps?: SifoModelTypes.DynamicObject;
  }
  interface sifoApp {
    [key: string]: any;
  }
  export default sifoApp;
}
