# schema-plugin-flow 
## 介绍
schema-plugin-flow，简称 Sifo ([sɪfɔ])，是一个高扩展性、可二开的插件式前端开发框架。     

* 导读
  * 这里的高扩展包括但不限于页面结构的修改、渲染组件的替换、组件属性的变更、组件事件的监听与阻断等。      
  * 可二次开发（简称可二开）主要体现在：使用 Sifo 开发，使得开发者可以在不接触源代码的情况下，对业务逻辑和页面布局进行高扩展。     
  * Sifo 是开发框架，本身是与 UI 框架解耦的，React 框架下可以使用 sifo-react ，Vue 框架下可以使用 sifo-vue 。结合不同的模型插件，可以实现丰富的个性功能。       
  * Sifo 的另一个特点是插件式开发，这使得不论是在 React 下还是 Vue 下，开发者写的逻辑代码几乎是一样的 ，二次开发者同样如此。     


* [sifo-model](./packages/sifo-model) 是 Sifo 的内核，它使用 JSON （称为 schema）来描述页面结构，使用插件来控制逻辑。有三类插件：模型插件、页面插件和组件插件。关于 Sifo 的基础信息和使用方法请阅读此包的 README。
* [sifo-react](./packages/sifo-react) 是封装了 sifo-model 和 sifo-singleton 的一个React 组件。sifo-react 还提供了 `sifoAppDecorator` 功能，可以使一个普通的 React 组件拥有扩展能力，详情请见 README 或在线示例。
* [sifo-vue](./packages/sifo-vue) 是封装了 sifo-model 和 sifo-singleton 的一个 Vue 组件。sifo-vue 还提供了 `sifoAppDecorator` 功能，可以使一个普通的 Vue 组件拥有扩展能力，详情请见 README 或在线示例。
* [sifo-singleton](./packages/sifo-singleton) 是一个全局扩展容器。所有的扩展插件和扩展组件都注册到这里。

### 模型插件
* [sifo-mplg-react-optimize](./packages/sifo-mplg-react-optimize) 是一个对 sifo-react 进行渲染优化的模型插件。
* [sifo-mplg-form-core](./packages/sifo-mplg-form-core) 是表单内核模型插件，通过简单的 schema 配置，实现了对表单字段的统一管理，并提供了一系列表单操作 api。
* [sifo-mplg-form-antdv](./packages/sifo-mplg-form-antdv) 是以 ant-design-vue 为 UI 层的表单，与 sifo-mplg-form-core 和 sifo-vue 一起使用。
* [sifo-mplg-form-antd](./packages/sifo-mplg-form-antd) 是以 ant-design 为 UI 层的表单， 与 sifo-mplg-form-core 和 sifo-react 一起使用。
* [sifo-mplg-drag](./packages/sifo-mplg-drag) Sifo 拖拽模型插件，在以自定义组件与初始 Schema 渲染的基础上，支持对组件进行即时拖拽，构建出新的 Schema。具体请参照 sifo-mplg-drag-react 和 sifo-mplg-drag-vue。
* [sifo-mplg-drag-react](./packages/sifo-mplg-drag-react) 对 React 支持的Sifo 拖拽模型插件。
* [sifo-mplg-drag-vue](./packages/sifo-mplg-drag-vue) 对 Vue 支持的Sifo 拖拽模型插件。

## Sifo 家族
* `sifo-model` + `react` = `sifo-react`
* `sifo-model` + `vue` = `sifo-vue`
* `sifo-react` + `sifo-mplg-form-core` + `ant-design` = `sifo-mplg-form-antd`
* `sifo-vue` + `sifo-mplg-form-core` + `ant-design-vue` = `sifo-mplg-form-antdv`
![](https://raw.githubusercontent.com/alibaba/schema-plugin-flow/master/image/sifo-family.png)


## Sifo 三要素
* schema
* components
* plugins
![](https://raw.githubusercontent.com/alibaba/schema-plugin-flow/master/image/sifo-elements.png)

## 安装

```shell
$ npm i @schema-plugin-flow/sifo-model --save
$ npm i @schema-plugin-flow/sifo-react --save
$ npm i @schema-plugin-flow/sifo-vue --save
```

## 本地尝试
* React
  *  clone code and start
  ```shell
  $ git clone https://github.com/alibaba/schema-plugin-flow.git
  $ cd schema-plugin-flow
  $ npm run i
  $ npm run start
  ```
  *  then visit `http://localhost:8000`.

* Vue
  *  clone code and start
  ```shell
  $ git clone https://github.com/alibaba/schema-plugin-flow.git
  $ cd schema-plugin-flow
  $ npm run i
  $ npm run i-vue
  $ npm run start-vue
  ```
  *  then visit `http://localhost:8080`.

## 在线尝试（codesandbox.io）
* sifo-react
  * [sifo-react-quick-start](https://codesandbox.io/s/sifo-react-quick-start-lhmyu)    
  * [sifo-react-decorator](https://codesandbox.io/s/sifo-react-test-decorator-sef79)    
  * [sifo-mplg-form-antd](https://codesandbox.io/s/sifo-react-form-antd-o0hoq)     
  * [sifo-react-mplg-optimize](https://codesandbox.io/s/sifo-react-mplg-optimize-sfmts) 
  * [sifo-mplg-drag-react](https://codesandbox.io/s/sifo-drag-react-yr3t4)      

* sifo-vue
  * [sifo-vue-quick-start](https://codesandbox.io/s/sifo-vue-quick-start-7668x)    
  * [sifo-vue-decorator](https://codesandbox.io/s/sifo-vue-test-decorator-4b9j4)    
  * [sifo-vue-use-optimize](https://codesandbox.io/s/sifo-vue-use-optimize-4n6nz)    
  * [sifo-mplg-form-antdv](https://codesandbox.io/s/sifo-vue-form-antdv-q4yc4)   
  * [sifo-mplg-drag-vue](https://codesandbox.io/s/sifo-drag-vue-6q5oz) 

## 如何使用
* 项目

  * extend.js
    ```javascript
    import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
    const singleton = new SifoSingleton('quick-start'); // target namespace
    singleton.registerItem('testExtendId', () => {
      return {
        plugins,
        components
      }
    });
    ```

  * app.js
    ```javascript
    import React from 'react';
    import ReactDOM from "react-dom";
    import SifoApp from '@schema-plugin-flow/sifo-react';
    const plugins = [{ modelPlugin, componentPlugin, pagePlugin }];
    class App extends React.Component {
      render() {
        return (
          <SifoApp
            namespace='quick-start'
            components={components}
            schema={schema}
            plugins={plugins}
          />
        );
      }
    }
    ReactDOM.render(
      <App />
      rootElement
    );
    ```

* runtime
  * load extend js
  * load app js

    你应该在 sifoApp 渲染前加载扩展 js 资源

    ```html
    <script src="extend.js"></script>
    <script src="app.js"></script>
    ```


## SifoApp (sifo-react/sifo-vue) Demo
* form-extend-demo

  [sifo-react-extends-demo](https://codesandbox.io/s/sifo-react-extends-demo-bg2py)

* simple demo

  In this demo, there are seven extend-plugins in seven independent js. The checkbox set which plugin should be registered. Each plugin control different logic and all registered plugins make up a integrated page.    

  ![demo](https://img.alicdn.com/tfs/TB1HOQYe6MZ7e4jSZFOXXX7epXa-1264-698.gif)
