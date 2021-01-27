import moment from 'moment';
const componentPlugin = {
  projectId: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addValidator(event.key, {
        validator: (value, callback, opts) => {
          if (!value || value.indexOf("sifo") < 0) {
            setTimeout(() => {
              console.log('异步校验回调')
              callback({
                passed: false,
                status: "error",
                message: "项目名称中应包含：sifo",
              });
            }, 200);
          } else {
            callback();
          }
        },
      });
    },
  },
  subject: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, 'onChange', (ctx, e) => {
        mApi.setAttributes(event.key, {
          value: e.target.value + '修改值'
        });
      });
    }
  },
  type: {
    afterPageRender: (params) => {
      const { event, mApi } = params;
      // 异步设置数据源
      setTimeout(() => {
        mApi.setAttributes(event.key, {
          options: [
            {
              label: "标准",
              value: "standard",
            },
            {
              label: "定制",
              value: "customized",
            },
          ],
        });
      }, 300);
      mApi.watch(event.key, (ctx, state) => {
        // 关联校验
        const val = mApi.getValue(event.key);
        mApi.disableValidate('typeDesc', val !== 'customized');
      });
    },
  },
  // 日期时间类型的值
  time: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, "propsFormatter", (ctx, props) => {
        if (props.value) {
          if (props.value._isAMomentObject) {
            return props;
          } else {
            return {
              ...props,
              value: moment(props.value)
            };
          }
        }
      });
      mApi.addEventListener(event.key, "onChange", (context, date, dateString) => {
        if (date._isAMomentObject) {
          // 字段值只取字符格式
          mApi.setAttributes(event.key, { value: dateString });
        }
      });
    }
  },
  submitBtn: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, "onClick", (context, value) => {
        mApi.validateAll().then((e) => {
          if (e.passed) {
            const values = mApi.getValues();
            console.log("表单数据：", values);
          } else {
            console.error("表单校验未通过", e);
          }
        });
      });
    },
  },
  resetBtn: {
    onComponentInitial: (params) => {
      const { event, mApi } = params;
      mApi.addEventListener(event.key, "onClick", (context, value) => {
        mApi
          .setValues({
            projectId: "项目一",
            subject: "主题一",
            time: "2021-02-22 20:22:22"
          })
          .then(() => {
            mApi.validate('projectId');
            mApi.validate('subject');
          });
      });
    },
  },
};
export default componentPlugin;
