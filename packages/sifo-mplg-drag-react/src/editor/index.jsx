/* eslint-disable react/no-unused-state */
import React from 'react';
import PropTypes from 'prop-types';
import Header from './header';

class SifoDragEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeType: ''
    };
  }
  getApi = id => {
    const { updateAttributes, updateId } = this.props;
    return {
      setAttributes: (attributes, reload) => {
        updateAttributes(id, attributes, reload);
      },
      updateId: nId => {
        updateId(id, nId);
      }
    };
  }
  handleDragStart = (item, e) => {
    const { type, init, component } = item;
    if (!init) {
      console.error('init not found');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const newNode = init(init);
    const { onDragStart } = this.props;
    onDragStart({ ...newNode, component }, e);
    this.setState({
      activeType: type
    });
  }
  handleDragEnd = e => {
    const { onDragEnd } = this.props;
    onDragEnd(e);
  }
  findTypeItem = node => {
    if (!node) return null;
    const { componentList = [] } = this.props;
    let typeItem = null;
    componentList.forEach(item => {
      if (typeItem) return;
      if (node.type && node.type === item.type) {
        typeItem = item;
      } else if (node.component === item.component) {
        typeItem = item;
      }
    });
    return typeItem;
  }
  render() {
    const {
      componentList = [], children, selectedNode = {}, deleteNode, getSchema, onSave
    } = this.props;
    const {
      node: sNode,
      id: selectedId
    } = selectedNode || {};
    const typeItem = this.findTypeItem(sNode);
    const activeType = typeItem?.type;
    return (
      <div className="sifo-mplg-drag">
        <Header
          deleteNode={deleteNode}
          selectedId={selectedId}
          getSchema={getSchema}
          onSave={onSave}
        />
        <div className="sifo-mplg-drag-editor">
          <div span={4} className="sifo-mplg-drag-components">
            <div className="sifo-mplg-drag-panel-header">组件</div>
            <div className="sifo-mplg-drag-panel-content">
              {
                componentList.map(item => {
                  const { type, name } = item;
                  return (
                    <div
                      key={type}
                      onDragStart={e => this.handleDragStart(item, e)}
                      onDragEnd={this.handleDragEnd}
                      id={type}
                      className={`sifo-component-item${activeType === type ? ' sifo-component-item-active' : ''}`}
                      draggable="true"
                    >
                      {name}
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div span={14} className="sifo-mplg-drag-render-plate">
            <div className="sifo-mplg-drag-panel-header">渲染区</div>
            <div className="sifo-mplg-drag-panel-content">
              {children}
            </div>
          </div>
          <div span={6} className="sifo-mplg-drag-props">
            <div className="sifo-mplg-drag-panel-header">属性</div>
            <div className="sifo-mplg-drag-panel-content">
              {
                typeItem && typeItem.propsRender && (
                  typeItem.propsRender(selectedId, sNode, this.getApi(selectedId))
                )
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
SifoDragEditor.propTypes = {
  componentList: PropTypes.array.isRequired,
  selectedNode: PropTypes.object,
  deleteNode: PropTypes.func.isRequired,
  getSchema: PropTypes.func.isRequired,
  updateAttributes: PropTypes.func.isRequired,
  updateId: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};
SifoDragEditor.defaultProps = {
  selectedNode: {},
  onSave: e => { console.log('onSave', e); }
};

export default SifoDragEditor;
