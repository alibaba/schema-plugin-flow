/* eslint-disable no-underscore-dangle */
const DragItemWrap = {
  render() {
    return this.$slots.default;
  },
  updated() {
    if (this.__dragNodeId__) {
      this.bindDragProps(this.__dragNodeId__, this.$el);
    }
  },
  mounted() {
    if (this.__dragNodeId__) {
      this.bindDragProps(this.__dragNodeId__, this.$el);
    }
  },
  props: ['bindDragProps', '__dragNodeId__'],
};
/* eslint-disable no-underscore-dangle */
const componentWrap = (Component, bindDragProps) => {
  const SifoDragWrap = {
    functional: true,
    render(createElement, context) {
      const {
        props, __dragNodeId__, ...rest
      } = context.data; // 一般的属性都在props中
      return createElement(DragItemWrap, {
        key: __dragNodeId__,
        props: {
          bindDragProps,
          __dragNodeId__
        }
      }, [
        createElement(Component, {
          ...rest,
          props,
          key: __dragNodeId__,
        }, context.children)
      ]);
    },
  };
  return SifoDragWrap;
};

export default componentWrap;
