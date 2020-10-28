# schema-plugin-flow 
## Introduction
schema-plugin-flow, abbreviated as Sifo ([sɪfɔ])，is a highly extensible JavaScript library. This library allows developers to extend business logic and page layout without touching source code, when the source code is written in Sifo.

* [sifo-model](./packages/sifo-model) is the core of Sifo, which using JSON (as Schema) to describe page's structures and using plugins as logic controller. There are three kinds of plugin: modelPlugin、pagePlugin and componentPluign.
* [sifo-singleton](./packages/sifo-singleton) is a global extensions holder. All kinds of extend-plugins and extend-components are registered to it.
* [sifo-react](./packages/sifo-react) is a React Component encapsulates sifo-model and sifo-singleton.
* [sifo-vue](./packages/sifo-vue) is a Vue Component encapsulates sifo-model and sifo-singleton.

### modelPlugins
* [sifo-mplg-react-optimize](./packages/sifo-mplg-react-optimize) is a modelPlugin for sifo-react optimization.
* [sifo-mplg-form-core](./packages/sifo-mplg-form-core) is a sifo form-core model plugin.
* [sifo-mplg-form-antdv](./packages/sifo-mplg-form-antdv) is a sifo form with ant-design-vue, works with sifo-mplg-form-core and sifo-vue.
* [sifo-mplg-form-antd](./packages/sifo-mplg-form-antd) is a sifo form with ant-design, works with sifo-mplg-form-core and sifo-react.

## Installation

```shell
$ npm i @schema-plugin-flow/sifo-model --save
$ npm i @schema-plugin-flow/sifo-react --save
$ npm i @schema-plugin-flow/sifo-mplg-react-optimize --save
$ npm i @schema-plugin-flow/sifo-vue --save
```

## Try
you can try to run the examples.
*  clone code and start

```shell
$ git clone https://github.com/alibaba/schema-plugin-flow.git
$ cd schema-plugin-flow
$ npm run i
$ npm run start
```

*  then visit `http://localhost:8000`.

## Try for Vue
you can try to run the examples.
*  clone code and start

```shell
$ git clone https://github.com/alibaba/schema-plugin-flow.git
$ cd schema-plugin-flow
$ npm run i
$ npm run i-vue
$ npm run start-vue
```

*  then visit `http://localhost:8080`.

## SifoApp (sifo-react/sifo-vue) Demo
In this demo, there are seven extend-plugins in seven independent js. The checkbox set which plugin should be registered. Each plugin control different logic and all registered plugins make up a integrated page.    

  ![demo](https://img.alicdn.com/tfs/TB1HOQYe6MZ7e4jSZFOXXX7epXa-1264-698.gif)