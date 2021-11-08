
import SifoApp from "@schema-plugin-flow/sifo-react";
import { DatePicker, Button as AButton, Input, Select, Grid } from "@alifd/next";
import SifoFormCore from "@schema-plugin-flow/sifo-mplg-form-core";
import FusionFormModelPlugin from "@schema-plugin-flow/sifo-mplg-form-fusion";
import schema from "./schema-form.json";
import plugins from './plugins';

const { Row, Col } = Grid;
const components = {
  Container: ({ children, ...other}) => (
    <div style={{ border: "1px solid #f5f5f5" }} {...other}>
      {children}
    </div>
  ),
  Input,
  Button: ({ label, title, ...other }) => <AButton {...other}>{label || title}</AButton>,
  Row,
  Col,
  Select,
  DatePicker
};
const plgs = [
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
    modelPlugin: {
      plugin: FusionFormModelPlugin,
      argsProvider: (mId, info) => {
        return {
          formItemProps: {
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
          }
        };
      }
    }
  },
  ...plugins
];
const FormDemo = props => {
  console.log('fusion form');
  return(
    <SifoApp
      namespace="fusion-form-demo"
      className="fusion-form-demo"
      components={components}
      plugins={plgs}
      schema={schema}
      optimize={false}
      openLogger={true}
    />
  );
}

export default FormDemo;

