# SifoFormCoreModelPlugin

表单（内核）模型插件，对表单字段进行统一的管理，并提供了一系列表单操作api。

## codesandbox.io
* sifo-react  
  * [sifo-mplg-form-antd](https://codesandbox.io/s/sifo-react-form-antd-o0hoq)     
* sifo-vue
  * [sifo-mplg-form-antdv](https://codesandbox.io/s/sifo-vue-form-antdv-q4yc4)   

## 类实例化参数
| 参数名            |  参数类型             |   描述            |   默认值     |
| ---------------- | ---------------------| ---------------- | ------------|
| formNodeId     |  string    |    schema中的表单节点id，用来指定表单字段在schema中的范围           |    schema根节点id   |
| fieldKey     |  string/function  |    `字段标识`，用来判定一个节点是否为字段及确定字段名。参数为string时，从attributes上对应string的属性判定，默认当attributes上有name属性时为字段；当参数为function时，有返回值时判定为字段。          |    'name'   |
| fieldChange     |  { changeHandler, eventName }  |    统一绑定的值变更事件， eventName 表示变更事件名         |    { changeHandler: defaultChangeHandler, eventName: 'onChange' }   |
| scrollToFirstError     |  bool  |    校验失败时，是否滚动到失败位置         |   true   |


*defaultChangeHandler*
```javascript
const defaultChangeHandler = (context, value) => {
  const { event, mApi } = context;
  mApi.setAttributes(event.key, { value }, true);
};
```

## 使用示例

```javascript
import SifoFormCore from '@schema-plugin-flow/sifo-mplg-form-core';
// sifo modelPlugin
{
  modelPlugin: {
    plugin: SifoFormCore,
    argsProvider: (mId, info) => {
      return {
        // 字段的key，无返回值认为不是字段
        fieldKey: (attr) => attr.props && attr.props.name,
        fieldChange: {
          // 表单字段change使用的handler
          changeHandler: (context, e) => {
            const { event, mApi } = context;
            let val = e;
            if (typeof e === "string" || typeof e === "number") {
              val = e;
            } else if (typeof e === "object") {
              val = e.target ? e.target.value : e;
            }
            mApi.setAttributes(event.key, { value: val }, true);
          },
          eventName: "change",
        },
      };
    },
  }
}
```

## UI封装
此模型插件只有表单内核，不包含任何UI部分，UI可按各自的情形封装。
  * 字段标识： 在字段节点时，在schema节点层和attributes层都将包含属性__isField__: true；
  * 默认将 value, validators, rules, validateDisabled, validateInfo 等放在 attributes 上；
  * 可在模型插件 onComponentsWrap 生命周期中包装组件以进行 FormItem 的样式相关封装；
  * 可扩展、覆盖 mApi 方法来适配相应情形；

## schema 格式
默认将value, validators, rules, validateDisabled, validateInfo等放在attributes上，且 schema 节点 id 应与 fieldKey（此处指字段标识对应的值）一致。
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
    ]
  }
}
```

## 校验规则描述
* 内置了必填、整数、最大最小值和长度校验；
* 规则描述的 message 省略时将使用内置文案；
* trigger 省略时将使用类实例参数 fieldChange 的 eventName，除非设置 notAutoTrigger = true，此时只在调用 validate、validateAll 时触发；
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
      "type": "integer",
      "notAutoTrigger": false
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
| getFormItemProps     |     id                  |   { value, defaultValue, validators, rules, validateDisabled, validateInfo }            |    此方法应返回FormItem的属性，包含：value, validators, rules, validateDisabled, validateInfo 等，默认在attributes中取(即使用 getAttributes 方法)。后面的模型插件可覆盖此方法来适配相应情形。   |
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
