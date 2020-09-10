# SifoReactOptimizeModelPlugin

sifo-react-optimize-model-plugin 

react渲染优化的sifo-model modelPlugin模型插件
> `sifo-react` is 'top-down' rendering type, you can use the modelPlugin  `@schema-plugin-flow/sifo-mplg-react-optimize` to optimize the rerendering in complex project.

*In general, you should use it as the last one in the plugins list.*

代码示例

```javascript
import SifoModel from '@schema-plugin-flow/sifo-model';
//
const plugins = [..., { modelPlugin: reactOptimizeModelPlugin }];
new SifoModel(
  namespace,
  refreshApi,
  schema,
  plugins
);
```
## 扩展的 mApi 模型接口

*mApi说明*

| 方法名            | 参数/类型               | 返回值类型             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| forceRefresh     | ✘                      |   -            |    mApi的setAttributes和refresh是按标记刷新渲染，调用此方法将强制全部刷新   |

## attributes

| 属性名            | 类型               | 默认值             | 描述       |
| ---------------- | -----------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| muteRenderOptimizeMark     | bool            |       false        |    当节点上此属性为true时，该节点不受渲染优化标记的控制，按照普通渲染模式渲染，但仍然受父组件的渲染与否影响   |


## 其它
此模型插件是通过扩展sifo-model的setAttributes方法实现的。