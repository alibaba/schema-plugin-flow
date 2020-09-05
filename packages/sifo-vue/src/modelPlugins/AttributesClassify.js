import { classifyAttributes } from './utils';

class AttributesClassify {
  static ID = 'sifo_vue_attrs_classify_model_plugin';
  constructor() {
    this.mApi = null;
  }
  onNodePreprocess = node => {
    const { attributes } = node;
    const classifiedAttrs = classifyAttributes({}, attributes);
    return { ...node, attributes: classifiedAttrs };
  }
}

export default AttributesClassify;

