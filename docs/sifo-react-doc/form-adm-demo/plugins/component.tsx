import React from 'react';

const dialogClose = (params) => () => {
  const { event, mApi } = params;
  mApi.setGlobalData('childModel', null);
  mApi.setAttributes(
    event.key,
    {
      visible: false,
    },
    true,
  );
};
const componentPlugin = {
  $form: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        labelCol: { span: 16 },
        wrapperCol: { span: 18 },
        labelAlign: 'top',
        labelTextAlign: 'left',
      });
    },
    afterPageRender: ({ event, mApi }) => {
      mApi
        .queryNodeIds(
          (node) =>
            node.component === 'DatePicker' || node.component === 'Calendar',
        )
        .forEach((id) => {
          mApi.setAttributes(id, {
            extraIcon: <span>标</span>,
          });
        });
    },
  },
  cascadetest: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onLoadDataSource', (ctx, valuePath) => {
        console.log('value path', valuePath);
        if (valuePath.length == 0) {
          return new Promise((res) => {
            setTimeout(() => {
              res([{
                label: '浙江',
                value: '浙江',
              }]
              );
            }, 500);
          });
        } else if (valuePath.length == 1) {
          return new Promise((res) => {
            setTimeout(() => {
              res([{
                label: '杭州',
                value: '杭州',
                isLeaf: true,
              }, {
                label: '温州',
                value: '温州',
                isLeaf: true,
              }]
              );
            }, 500);
          });
        } else {
          return Promise.resolve([]);
        }
      });
    }
  },
  subject: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onChange', (context, value) => {
        context.mApi.setAttributes('subject', {
          // disabled: true,
          value: `t-${value}`,
        });
        console.log('事件值', value);
      });
    },
  },
  gmtQuotationExpire: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        formater: ['YYYY-MM-DD', 'HH:mm:ss'],
        showTime: true,
      });
    },
  },
  protocolReceivedDate: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        itemVisible: false,
      });
    },
  },
  testTable: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        rowSelection: {},
        primaryKey: 'number',
        label: undefined, // 表格不需求label，隐藏label点位
        wrapperCol: { span: 24 }, // 表格宽度
      });
    },
  },
  subBizType: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onChange', (context, value) => {
        const { event, mApi } = context;
        const { key } = event;
        console.log('subBizType, value;', value);
        if (value === 'singlepurchase') {
          mApi.setAttributes('receivedDate', {
            itemVisible: true,
          });
          mApi.setAttributes('protocolReceivedDate', {
            itemVisible: false,
          });
        } else {
          mApi.setAttributes('receivedDate', {
            itemVisible: false,
          });
          mApi.setAttributes('protocolReceivedDate', {
            itemVisible: true,
          });
        }
        mApi.refresh();
        return value;
      });
    },
  },
  subject1: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onChange', (context, value) => {
        const { event } = context;
        context.mApi
          .setValue('subject', `联动值${new Date().getMilliseconds()}`)
          .then(() => {
            console.log('set subject');
          });
        return `插件值${value}`;
      });
    },
  },
  testbtn: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      const temListener = () => {
        console.log('tem event listerner');
      };
      mApi.addEventListener(event.key, 'onClick', (context) => {
        console.log('测试addEventListener重复');
        context.mApi.addEventListener('projectId', 'onChange', temListener);
        // const { event } = params;
        // event.cancel = true;
        context.mApi
          .setValues({
            subject1: `第一个插件联动值${new Date().getMilliseconds()}`,
            subject: new Date().toString(),
          })
          .then(() => {
            console.log('set value successed');
          });
        context.mApi.setAttributes(
          'norules',
          {
            disabled: true,
            itemEditable: false,
          },
          true,
        );
        context.mApi.refresh();
      });
    },
  },
  btngetvalue: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context) => {
        const values = mApi.getValues();
        console.log('get values: ', values);
        const attr = context.mApi.getAttributes('projectId');
        console.log('projectId attr:', attr);
        context.mApi
          .validate('subject1')
          .then((r) => console.log('校验subject1', r));
        // params.mApi.schemaLoop((id, attrr, node) => console.log('schema loop', id, attrr, node));
      });
    },
  },
  footerBar: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        style: { textAlign: 'center' },
      });
    },
  },
  submitBtn: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context) => {
        mApi.validateAll().then((rst) => {
          console.log('校验结果', rst);
          if (!rst.passed) {
            mApi.scrollIntoView('projectId');
          }
        });
      });
    },
  },
  resetBtn: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context) => {
        mApi.reset();
        // params.mApi.reloadPage();
      });
    },
  },
  showBtn: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onClick', (context) => {
        context.mApi.setAttributes(
          'testDialog',
          {
            visible: true,
          },
          true,
        );
      });
    },
  },
  testDialog: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.setAttributes(event.key, {
        style: { maxWidth: '1000px' },
        locale: { ok: '点击可以将界面值回填', cancel: '取消' },
        onOk: () => {
          const childModel = mApi.getGlobalData('childModel');
          const values = childModel.getValues();
          mApi.setValues(values);
          dialogClose(params)();
        },
        onCancel: dialogClose(params),
        onClose: dialogClose(params),
      });
    },
  },
  childForm: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
    },
  },
};

export default componentPlugin;
