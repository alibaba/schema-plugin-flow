/* eslint-disable no-unused-expressions */
import React from 'react';
import PropTypes from 'prop-types';

const Header = props => {
  const {
    deleteNode, selectedId, getSchema, onSave
  } = props;
  const save = () => {
    const schema = getSchema();
    onSave && onSave(schema);
  };
  const delSelectedNode = () => {
    if (selectedId) {
      deleteNode(selectedId);
    }
  };
  return (
    <div className="sifo-mplg-drag-header">
      <div className="sifo-mplg-drag-title">Sifo拖拽插件</div>
      <div className="sifo-mplg-drag-tool">
        <button className="sifo-mplg-drag-btn" onClick={delSelectedNode}>删除选中节点</button>
        <button className="sifo-mplg-drag-btn primary" onClick={save}>保存</button>
      </div>
    </div>
  );
};
Header.propTypes = {
  deleteNode: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  getSchema: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};
Header.defaultProps = {
  selectedId: '',
  onSave: e => { console.log('onSave', e); }
};

export default Header;
