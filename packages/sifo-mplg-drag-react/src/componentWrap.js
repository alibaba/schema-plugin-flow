import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const { createElement } = React;
/* eslint-disable no-underscore-dangle */
const componentWrap = (Component, bindDragProps) => {
  class DragItemWrap extends React.Component {
    toBind() {
      const { __dragNodeId__ } = this.props;
      if (!__dragNodeId__) return;
      // eslint-disable-next-line react/no-find-dom-node
      const refDom = ReactDOM.findDOMNode(this);
      bindDragProps(__dragNodeId__, refDom);
    }

    // eslint-disable-next-line react/sort-comp
    componentDidUpdate() {
      this.toBind();
    }

    componentDidMount() {
      this.toBind();
    }
    render() {
      const {
        __dragNodeId__,
        children, ...rest
      } = this.props;
      if (!Component) return null;
      return createElement(Component, {
        key: __dragNodeId__,
        ...rest
      }, children);
    }
  }
  DragItemWrap.propTypes = {
    __dragNodeId__: PropTypes.string
  };
  DragItemWrap.defaultProps = {
    __dragNodeId__: ''
  };
  return DragItemWrap;
};

export default componentWrap;
