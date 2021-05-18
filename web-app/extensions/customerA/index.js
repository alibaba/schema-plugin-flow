import SifoSingleton from '@schema-plugin-flow/sifo-singleton';
import { Modal } from 'antd';
import { showPasswordConfirm } from './submitCheck';
// 客户A有化学品货物，需要提示入库要求，仍要提交需要验证操作员入库授权码
const goodsTypeCheck = (value, callback, { mApi }) => {
  const goodsType = mApi.getValue('goodsType');
  const warehouse = mApi.getValue('warehouse');
  if (goodsType === 'chemical-reagent' && warehouse !== 'warehouse3') {
    showPasswordConfirm({
      onOk(pswd) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // 模拟密码校验
            if (pswd === '999999') {
              callback();
              resolve();
            } else {
              // 校验不过不应该关闭校验，因为有可能再次输入密码
              // callback({
              //   passed: false,
              //   status: 'error',
              //   message: '化学品类一般要求放到三号仓库',
              // });
              reject();
              Modal.error({ content: '入库授权码错误' });
            }
          }, 1000);
        });
      },
      onCancel() {
        callback({
          passed: false,
          status: 'error',
          message: '化学品类一般要求放到三号仓库',
        });
      },
      cancelText: '取消',
      okText: '确认授权'
    });
  } else {
    // passed
    callback();
  }
};
const pagePlugin = {
};
const componentPlugin = {
  goodsType: {
    onComponentInitial: () => {

    },
    afterPageRender: params => {
      const { event, mApi } = params;
      const { options = [] } = mApi.getAttributes(event.key);
      mApi.setAttributes(event.key, {
        options: [
          {
            label: '化学品类',
            value: 'chemical-reagent',
            goods: [
              {
                label: '硫酸',
                value: 'sulfuric-acid'
              },
              {
                label: '洗涤剂',
                value: 'detergent'
              }
            ]
          },
          ...options
        ]
      });
    }
  },
  warehouse: {
    onComponentInitial: () => {
    },
    afterPageRender: params => {
      const { event, mApi } = params;
      mApi.addValidator(event.key, {
        validator: goodsTypeCheck,
        trigger: ['onSubmit']
      });
    }
  },
  submitBtn: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', () => {

      }, true);
    },
  }
};
const singleton = new SifoSingleton('form-demo');
singleton.registerItem('customerA_Ext', () => {
  return {
    plugins: [
      {
        pagePlugin, componentPlugin
      }
    ]
  };
});

export default singleton;
