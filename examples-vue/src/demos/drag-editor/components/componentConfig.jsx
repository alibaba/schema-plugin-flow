import DefPropsRender from './common-props-render.vue';

function commonPropsEditor (id, node, api) {
  const { attributes } = node;
  const { label, fieldKey } = attributes;
  const dynamicComp = {
    functional: true,
    render(createElement) {
      return createElement(DefPropsRender, { props: { id, label, fieldKey, api } }, 'ssss');
    }
  };
  return dynamicComp;
}
/**
 * 描述组件节点的生成与属性编辑
 */
const componentList = [
  {
    type: 'input',
    name: '文本',
    component: 'Input',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'text_' + uuid,
        attributes: {
          label: '文本-' + uuid,
          fieldKey: 'text_' + uuid
        }
      }
    },
    propsRender: commonPropsEditor
  },
  {
    type: 'select',
    name: '选择器',
    component: 'Select',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'sel_' + uuid,
        attributes: {
          label: '选择器-' + uuid,
          fieldKey: 'sel_' + uuid
        }
      }
    },
    propsRender: commonPropsEditor
  },
  {
    type: 'container',
    name: '容器',
    component: 'Container',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'con_' + uuid,
        acceptable: true, // 可接收子节点
        attributes: {
          label: '容器-' + uuid,
          style: { minHeight: '10px' }
        }
      }
    },
    propsRender: commonPropsEditor
  },
  {
    type: 'button',
    name: '按钮',
    component: 'Button',
    init: function () {
      const uuid = Math.random().toString().substr(3, 3);
      return {
        id: 'btn_' + uuid,
        acceptable: true, // 可接收子节点
        attributes: {
          label: '按钮' + uuid
        }
      }
    },
    propsRender: commonPropsEditor
  }
];

export default componentList;