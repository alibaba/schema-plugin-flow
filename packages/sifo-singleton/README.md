# sifo-singleton

 这是一个全局单例容器，用于注册插件与组件，以命名空间区分。

## SifoSingleton 类

*SifoSingleton实例化参数*

参数          | 说明        | 类型 | 是否必传 | 默认值
-------------|-------------|-----|-----|-----
namespace    | 命名空间，插件与组件通过同一命名空间读取 | string | 是 | - |


## 方法

| 方法名                 | 参数/类型            | 返回值类型             | 描述         |
| --------------------- | -------------------| --------------------- | ---------------------------------------------------------------------------------------------------|
| registerItem          | (id: string, item: function)  | -          | 注册对象      |
| getRegisteredItems    | ()                   | array               | 获取所有的命名空间下的注册对象   |

> 代码示例-注册
```javascript
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
const singleton = new SifoSingleton('test');
singleton.registerItem('extendId01', (params) => {
  return {
    version: '1.0.0',
    plugins: [
      {
        componentPlugin: singleton_comp_plg,
        pagePlugin: {}
      }, 
      {
        pagePlugin: {
          onPageInitial: params => {
            console.log('singleton1 page plugin')
          }
        }
      }
    ],
    components: {
      test: TestComp
    }
  }
});
```

> 代码示例-取出
```javascript
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
const singleton = new SifoSingleton('test');
const singletonItems = singleton.getRegisteredItems({ param1: 'testssss' });
singletonItems.forEach(registerItem => {
    const { components = {}, plugins = [] } = registerItem;
});
```