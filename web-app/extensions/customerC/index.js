/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import { Col, Row, DatePicker } from 'antd';
import moment from 'moment';
import schema from './schema.json';
// 客户C需要保存其它信息，以便后续查阅：货车车牌、司机姓名、联系方式等
const pagePlugin = {
  onNodePreprocess: node => {
    if (node.id === 'field_panel') {
      console.log('customerC', schema);
      node.children.splice(2, 0, {
        component: 'TextArea',
        id: 'goodsDesc',
        attributes: {
          label: '货物检查说明',
          fieldKey: 'goodsDesc',
          showCount: true,
          maxLength: 200
        }
      });
      return {
        ...node,
        children: [
          {
            component: 'Row',
            attributes: {

            },
            children: [
              {
                component: 'Col',
                attributes: {
                  span: 12,
                },
                children: node.children
              },
              {
                component: 'Col',
                attributes: {
                  span: 12,
                },
                children: schema
              }
            ]
          }
        ]
      };
    }
  },
};
const componentPlugin = {
  time: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'propsFormatter', (ctx, props) => {
        if (props.value) {
          if (props.value._isAMomentObject) {
            return props;
          }
          return {
            ...props,
            value: moment(props.value)
          };
        }
      });
      mApi.addEventListener(
        event.key,
        'onChange',
        (context, date, dateString) => {
          if (!date) {
            mApi.setAttributes(event.key, { value: date });
          } else if (date._isAMomentObject) {
            // 字段值只取字符格式
            mApi.setAttributes(event.key, { value: dateString });
          }
        }
      );
    }
  }
};
const singleton = new SifoSingleton('form-demo');
singleton.registerItem('customerC_Ext', () => {
  return {
    plugins: [
      {
        pagePlugin, componentPlugin
      }
    ],
    components: {
      Row, Col, DatePicker
    }
  };
});

export default singleton;
