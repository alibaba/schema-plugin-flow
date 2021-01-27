# AntdVueFormModelPlugin

sifo form with ant-design-vue.

AntdVueFormModelPlugin 是在 SifoFormCore (@schema-plugin-flow/sifo-mplg-form-core) 基础上封装的UI层. mApi 同 SifoFormCore。

codesandbox.io: [sifo-mplg-form-antdv](https://codesandbox.io/s/sifo-vue-form-antdv-q4yc4) 

## 类实例化参数
| 参数名            |  参数类型             |   描述            |   默认值     |
| ---------------- | ---------------------| ---------------- | ------------|
| formItemWrapper     |  (component)=>formItemWrapper    |    对传入的components进行封装。结合SifoFormCore 封装的 ant-design-vue 下的 FormItem。可以自定义实现来满足需要的功能与特性           |    defaultFormItemWrapper   |
| formItemProps     |  FormItemProps    |    统一设置 FormItem 的属性，比如 labelCol、wrapperCol          |    {}   |


## 使用示例
详细示例与代码请参照github -> examples-vue/src/demos/form-demo
```javascript
import SifoFormCore from '@schema-plugin-flow/sifo-mplg-form-core';
import AntdVueFormModelPlugin from "@schema-plugin-flow/sifo-mplg-form-antdv";
// 样式： @import "~@schema-plugin-flow/sifo-mplg-form-antdv/index.less";
// sifo plugins
[{
  modelPlugin: {
    plugin: SifoFormCore,
    argsProvider: (mId, info) => {
      return {
        // 字段的key，无返回值认为不是字段，此处用 props.name 作为字段标识
        fieldKey: (attr) => attr.props && attr.props.name,
        fieldChange: {
          // 表单字段change使用的handler
          changeHandler: (context, e) => {
            const { event, mApi } = context;
            // 可根据不同的组件进行值获取
            let val = e;
            if (typeof e === "string" || typeof e === "number") {
              val = e;
            } else if (typeof e === "object") {
              val = e.target ? e.target.value : e;
            }
            mApi.setAttributes(event.key, { value: val }, true);
          },
          eventName: "change", // antd-vue的字段组件事件名是 change
        },
      };
    },
  }
},
{
  modelPlugin: AntdVueFormModelPlugin, // 要在SifoFormCore之后注册
},
/*
* 传 formItemProps 参数用法
  modelPlugin: {
    plugin: AntdVueFormModelPlugin,
    argsProvider: (mId, info) => {
      return {
        formItemProps: {
          labelCol: { span: 8 },
          wrapperCol: { span: 16 }
        }
      };
    }
  }
*/
{ pagePlugin, componentPlugin }
]
```

## formItemWrapper
SifoFormCore模型插件只有表单内核，不包含任何UI部分，UI可按各自的情形封装。
  * 字段标识： 在字段节点时，在schema节点层和attributes层都将包含属性__isField__: true；
  * vue 的 value, validators, rules, validateDisabled, validateInfo 等放在 attributes.props 上；
  * 覆盖了 mApi.getFormItemProps 方法来适配 vue；

## schema 格式
* 初始配置可将 value, rules 等放在 attributes 上； 运行时在 attributes.props 上;
* schema 节点 id 应与 fieldKey（此处指字段标识对应的值）一致;
* class 是字段组件的样式；itemClassName 是FormItem层的样式；
* labelCol 控制FormItem标签; wrapperCol 控制FormItem字段组件;
```json
{
  "id": "fieldKey01",
  "component": "Input",
  "attributes": {
    "name": "fieldKey01",
    "label": "字段名",
    "rules": [
      {
        "required": true,
        "message": "你需要填写项目的名称",
        "trigger": [
          "pressEnter",
          "change"
        ]
      }
    ],
    "class": "test-control-class",
    "itemClassName": "test-form-item-class",
    "labelCol": {
      "span": 8
    },
    "wrapperCol": {
      "span": 16,
      "offset": 0
    }
  }
}
```

## FormItem Props

| 参数                  | 说明         | 类型     | 默认值              |
| -------------------- | ------------ | -------- | ---------------- |
| name           | 默认的字段标识key，不一定是“name”，可以是任意自定的key   | string | - |
| label           | 字段标签名   | string  | - |
| rules           | 校验规则，见下文校验规则描述   | array  | - |
| itemClassName           | FormItem 上的样式   | string  | - |
| labelCol           | 字段标签对应的 Col 属性  | string  | { span: 8 } |
| wrapperCol         | 字段组件对应的 Col 属性  | string  | { span: 16 } |

## FormItem 事件

| 参数                  | 说明         | 类型     | 默认值              |
| -------------------- | ------------ | -------- | ---------------- |
| propsFormatter | 转换字段的属性到组件属性 | Function: (props: any) => any | - |

## 校验规则描述
* 内置了必填、整数、最大最小值和长度校验；
* 规则描述的message省略时将使用内置文案；
* trigger省略时将使用类实例参数 fieldChange 的 eventName；
* 调用validate、validateAll 时不区分 trigger；

```json
{
  "rules": [
    {
      "required": true,
      "message": "请填写信息",
      "trigger": [
        "pressEnter",
        "change"
      ]
    },
    {
      "type": "integer"
    },
    {
      "max": 99.9
    },
    {
      "maxLength": 9
    }
  ]
}
```

## 扩展的 mApi 模型接口

| 方法名            | 参数/类型               | 返回值类型             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| getFormItemProps     |     id                  |   { value, validators, rules, validateDisabled, validateInfo }            |    此方法应返回FormItem的属性，包含：value, validators, rules, validateDisabled, validateInfo 等，默认在attributes中取(即使用 getAttributes 方法)。后面的模型插件可覆盖此方法来适配相应情形。   |
| setValue     | (fieldKey, value)              |   -     |    设置指定字段的值   |
| setValues     | { [fieldKey]: value }         |   -     |    设置多个字段值   |
| getValue     | fieldKey                      |   any      |   获取指定字段值    |
| getValues     | ✘                      |   { [fieldKey]: value }   |   获取所有字段值   |
| addValidator     | (fieldKey, validatorItem)       |   -            |    为指定字段增加函数式校验器，要注意校验器的使用方法，见下面的validatorItem示例   |
| removeValidator     |  (fieldKey, validatorItem)      |   -            |    移除函数式校验器   |
| disableValidate     |  (fieldKey, disable = true)      |   -            |   设置校验（包含校验规则与校验函数）是否失效   |
| validate     |  fieldKey     |   Promise< validateInfo: { passed, message }[] >          |   校验指定字段   |
| validateAll     |  ✘     |   Promise< { passed, details:{ id, fieldKey, validateInfo, passed }[] }[] >          |   校验所有字段   |
| scrollIntoView     |  fieldKey     |      -       |   滚动到指定字段位置   |

*validatorItem*
```javascript
const validatorItem = {
  validator: (value, callback, opts:{ id, mApi, fieldKey }) => {
    // not passed
    callback({
    passed: false,
    status: 'error',
    message: 'invalidate message',
    });
    // passed
    callback();
  },
  trigger: ['eventName'], // 在何时触发，默认是类实例参数 fieldChange 的 eventName 
}
```  
