import * as React from 'react';
import SifoApp, { SifoModelTypes } from '@schema-plugin-flow/sifo-react';
import SifoFormCore from "@schema-plugin-flow/sifo-mplg-form-core";
import AdmFormModelPlugin, { baseComponents } from '@schema-plugin-flow/sifo-mplg-form-antd-mobile'; 
import schema from './schema';
import plugins from './plugins';
import './index.less';

// 插件配置
const plgs: SifoModelTypes.SifoPlugin[] = [
  {
    modelPlugin: {
      plugin: SifoFormCore,
      argsProvider: (mId, info) => {
        return {
          // 字段的key，无返回值认为不是字段
          fieldKey: (attr) => attr.name,
          fieldChange: {
            // 表单字段change使用的handler
            changeHandler: (context, e) => {
              const { event, mApi } = context;
              let val = e;
              if (typeof e === "string" || typeof e === "number") {
                val = e;
              } else if (e && typeof e === "object") {
                val = e.target ? e.target.value : e;
              }
              mApi.setAttributes(event.key, { value: val }, true);
            },
            eventName: "onChange",
          },
        };
      },
    },
  },
  {
    modelPlugin: AdmFormModelPlugin
  },
  ...plugins,
];

// 应用入口
const FormApp = () => {
  return (
    <>
    <SifoApp
      namespace="antd-mobile-form"
      className="antd-mobile-form"
      components={baseComponents}
      plugins={plgs}
      schema={schema.viewSchema as SifoModelTypes.SchemaNode}
      // optimize={false}
      openLogger={true}
      />
      </>
  );
};

FormApp.displayName = 'FormApp';

export default FormApp;
