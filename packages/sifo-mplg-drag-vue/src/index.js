import SifoDragModelPlugin from '@schema-plugin-flow/sifo-mplg-drag';
import dragWrapper from './componentWrap';

export { default as SifoDragEditor } from './editor/index.vue';

const EmptyEditor = {
  render() {
    return null;
  }
};
class DragModelPlugin {
  static ID = 'sifo_drag_vue_model_plugin';
  constructor(props = {}) {
    const injectArgs = {
      ...props,
      dragWrapper,
      SifoDragEditor: props.SifoDragEditor || EmptyEditor,
    };
    this.dragModel = new SifoDragModelPlugin(injectArgs);
  }

  onNodePreprocess = (node, informations) => {
    if (this.dragModel.onNodePreprocess) {
      return this.dragModel.onNodePreprocess(node, informations);
    }
    return node;
  }
  onComponentsWrap = components => {
    if (this.dragModel.onComponentsWrap) {
      return this.dragModel.onComponentsWrap(components);
    }
    return components;
  }
  onSchemaInstantiated = params => {
    if (this.dragModel.onSchemaInstantiated) {
      this.dragModel.onSchemaInstantiated(params);
    }
  }
  onModelApiCreated = params => {
    const { mApi } = params;
    if (this.dragModel.onModelApiCreated) {
      this.dragModel.onModelApiCreated(params);
    }
    this.mApi = mApi;
  }
  onReadyToRender = params => {
    if (this.dragModel.onReadyToRender) {
      this.dragModel.onReadyToRender(params);
    }
  }
  afterRender = params => {
    if (this.dragModel.afterRender) {
      this.dragModel.afterRender(params);
    }
  }
  onDestroy = params => {
    if (this.dragModel.onDestroy) {
      this.dragModel.onDestroy(params);
    }
  }
}
export default DragModelPlugin;
