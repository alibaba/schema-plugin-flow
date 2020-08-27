import TAGS from '../utils/tags';

class ComponentNotFound {
  static ID = 'component_not_found_model_plugin';
  constructor() {
    this.components = {};
    this.notFoundList = [];
  }
  onComponentsWrap = components => {
    Object.assign(this.components, components);
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance } = event;
    schemaInstance.loopDown(node => {
      const { component } = node;
      if (!this.components[component]
        && TAGS.indexOf(component) === -1
        && this.notFoundList.indexOf(component) === -1) {
        this.notFoundList.push(component);
      }
    });
    if (this.notFoundList.length > 0) {
      console.warn('[sifo-react] Component not found: ', this.notFoundList.join(', '));
    }
    this.components = null;
    this.notFoundList = null;
  }
}

export default ComponentNotFound;
