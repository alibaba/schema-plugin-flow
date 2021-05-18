import { Modal } from 'antd';

const componentPlugin = {
  goodsType: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        options: [
          {
            label: '电子类',
            value: 'electronic',
            goods: [
              {
                label: '主机',
                value: 'host'
              },
              {
                label: '显示器',
                value: 'monitor'
              }
            ]
          },
          {
            label: '五金类',
            value: 'hardware',
            goods: [
              {
                label: '锤子',
                value: 'hammer'
              },
              {
                label: '扳手',
                value: 'wrench'
              }
            ]
          }
        ]
      });
      mApi.watch(event.key, (ctx, changes) => {
        if (changes.value) {
          const { options } = ctx.mApi.getAttributes(event.key);
          const findGoods = options.find(item => item.value === changes.value);
          if (findGoods) {
            ctx.mApi.setAttributes('goodsId', {
              value: '',
              options: findGoods.goods
            });
          }
        }
      });
    }
  },
  warehouse: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        options: [
          {
            label: '一号仓',
            value: 'warehouse1'
          },
          {
            label: '二号仓',
            value: 'warehouse2'
          },
          {
            label: '三号仓',
            value: 'warehouse3'
          }
        ]
      });
    }
  },
  submitBtn: {
    onComponentInitial: params => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', () => {
        mApi.validateAll().then(e => {
          if (e.passed) {
            const values = mApi.getValues();
            console.log('表单数据：', values);
            Modal.success({
              title: '提交成功!',
              content: `数据：${JSON.stringify(values)}`
            });
          } else {
            console.error('表单校验未通过', e);
          }
        }).catch(e => {
          console.log('提交前校验异常', e);
        });
      });
    },
  }
};
export default componentPlugin;
