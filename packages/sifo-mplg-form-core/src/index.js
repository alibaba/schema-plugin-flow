/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { validate } from './validate';
import { hasOwnProperty } from './utils';

// 默认handler
const defaultChangeHandler = (context, value) => {
  const { event, mApi } = context;
  mApi.setAttributes(event.key, { value }, true);
};

// 表单模型
class FormCoreModelPlugin {
  static ID = 'sifo-mplg-form-core';
  constructor(props) {
    const {
      formNodeId, fieldKey, fieldChange = {}, scrollToFirstError = true
    } = props || {};
    const { changeHandler, eventName } = fieldChange;
    this.formNodeId = formNodeId;// 标识form的范围
    this.fieldKeyGetter = fieldKey || 'name';// 默认以属性中的name为字段标识
    // 可以传入指定的change方法与key
    this.onChangeHandler = changeHandler || defaultChangeHandler;
    this.onChangeEventName = eventName || 'onChange';
    this.scrollToFirstError = scrollToFirstError;
    // 存储模型状态
    this.id2FieldKey = {};// 记录id与fieldKey的对应关系
    this.fieldKey2Id = {};
    this.validateDebounce = {};
    this.validateTriggers = {}; // 记录已经注册过的校验器 {nodeId: [triggerTypes1,triggerTypes2]}
    this.schemaInstance = null;
    this.mApi = null;
  }
  onSchemaInstantiated = params => {
    const { event } = params;
    const { schemaInstance, instanceId } = event;
    // 将实例保存起来
    this.schemaInstance = schemaInstance;
    this.schemaInstance.loopDown(node => {
      const { attributes = {}, id } = node;
      let fieldKey = '';
      if (typeof this.fieldKeyGetter === 'function') {
        fieldKey = this.fieldKeyGetter(attributes, node);
      } else {
        fieldKey = attributes[this.fieldKeyGetter];
      }
      if (fieldKey) {
        if (this.fieldKey2Id[fieldKey]) {
          console.error(`字段${fieldKey}已经存在`);
          return 'continue'; // 阻止向下层遍历，但兄弟分支会继续遍历
        }
        if (id !== fieldKey) {
          console.warn(`字段标识: ${fieldKey}与id: ${id}不一致`);
        }
        // 标识是字段实体节点
        Object.assign(
          node.attributes,
          {
            __isField__: true,
            __fieldKey__: fieldKey,
            'data-field-key': `${fieldKey}_${instanceId}`
          }
        );
        node.__isField__ = true;
        node.__fieldKey__ = fieldKey;
        this.id2FieldKey[id] = fieldKey;
        this.fieldKey2Id[fieldKey] = id;
        return 'continue';
      }
      return true;
    }, this.formNodeId);
  }
  // 校验器应该异步执行，并且debounce
  validateHandler = (context, eventName) => {
    const { mApi, event } = context;
    const { key: id } = event;
    if (this.validateDebounce[id]) {
      clearTimeout(this.validateDebounce[id]);
    }
    this.validateDebounce[id] = setTimeout(() => {
      this.validateDebounce[id] = false; // 保持Shape
      // 此中value一定能取到最新的值
      validate(id, mApi, this.id2FieldKey[id], eventName).then(validateInfo => {
        mApi.setAttributes(id, { validateInfo }, true);
      });
    }, 300);
  }
  // 按trigger类型绑定校验器，同时记录已绑定的校验器类型
  // 在setAttributes和addValidator中，判断rules、validator的trigger，发现没有绑定过校验器时，增加
  // 移除校验时，不需要移除校验器监听，因为是在校验器内部动态去取的校验配置，没有就不会执行
  bindValidateHandler = (id, rules) => {
    if (!Array.isArray(rules) || rules.length < 0) return;
    rules.forEach(rule => {
      let validateTrigger = [];
      const { trigger } = rule;
      if (!Array.isArray(trigger) || trigger.length === 0) {
        validateTrigger = [this.onChangeEventName]; // 默认使用onChange
      } else {
        validateTrigger = [...trigger];
      }
      validateTrigger.forEach(eventName => {
        if (!this.validateTriggers[id] || this.validateTriggers[id].indexOf(eventName) < 0) {
          // 对一种trigger只绑定一次校验器
          this.mApi.addEventListener(id, [eventName], ctx => this.validateHandler(ctx, eventName));
          this.validateTriggers[id] = this.validateTriggers[id]
            ? [...this.validateTriggers[id], eventName]
            : [eventName];
        }
      });
    });
  }
  // 增加表单模型方法
  onModelApiCreated = params => {
    const { mApi, event } = params;
    const { applyModelApiMiddleware } = event;
    this.mApi = mApi;
    // 此方法应返回FormItem的属性，包含：value, validators, rules, validateDisabled 等，默认在attributes中
    const getFormItemPropsMiddleware = () => (...args) => {
      return this.mApi.getAttributes(...args);
    };
    applyModelApiMiddleware('getFormItemProps', getFormItemPropsMiddleware);
    const setAttrsMiddleware = next => (id, attributes, refresh) => {
      // 不在此处进行校验，由相应的trigger注册校验事件，使用者可用watch自定义校验时机
      // if (this.autoValidate && this.id2FieldKey[id] && hasOwnProperty(attributes, 'value')) {
      //   doValidate(id);
      // }
      if (attributes.__isField__ && this.id2FieldKey[id] && hasOwnProperty(attributes, 'rules')) {
        setTimeout(() => {
          const { rules } = this.mApi.getFormItemProps(id) || {};
          this.bindValidateHandler(id, rules);
        }, 0);
      }
      return next(id, attributes, refresh);
    };
    // 对mApi的setAttributes方法进行再组装
    applyModelApiMiddleware('setAttributes', setAttrsMiddleware);
    const setValueMiddleware = () => (fieldKey, value) => {
      const id = this.fieldKey2Id[fieldKey];
      if (!id) {
        console.warn(`${fieldKey} not found!`);
      }
      return this.mApi.setAttributes(id, { value }, true);
    };
    applyModelApiMiddleware('setValue', setValueMiddleware);
    const setValuesMiddleware = () => values => {
      const { fieldKey2Id } = this;
      Object.keys(values).forEach(fieldKey => {
        const id = fieldKey2Id[fieldKey];
        this.mApi.setAttributes(id, { value: values[fieldKey] }, false);
      });
      return this.mApi.refresh();
    };
    applyModelApiMiddleware('setValues', setValuesMiddleware);
    const getValueMiddleware = () => fieldKey => {
      const id = this.fieldKey2Id[fieldKey];
      const attr = this.mApi.getFormItemProps(id) || {};
      return attr.value;
    };
    applyModelApiMiddleware('getValue', getValueMiddleware);
    const getValuesMiddleware = () => fieldKeys => {
      const usefilter = fieldKeys && Array.isArray(fieldKeys) && fieldKeys.length > 0;
      const values = {};
      Object.keys(this.fieldKey2Id).forEach(fieldKey => {
        if (usefilter) {
          if (fieldKeys.indexof(fieldKey) >= 0) {
            values[fieldKey] = mApi.getValue(fieldKey);
          }
        } else {
          values[fieldKey] = mApi.getValue(fieldKey);
        }
      });
      return values;
    };
    applyModelApiMiddleware('getValues', getValuesMiddleware);
    /**
      validatorItem: {
        validator: (value, callback, opts:{ id, mApi, fieldKey }) => {
          callback({
          passed: false,
          status: 'warning',
          message: 'message',
          });
        },
        trigger: ['onChange']
      }
     */
    const addValidatorMiddleware = () => (fieldKey, validatorItem) => {
      const id = this.fieldKey2Id[fieldKey];
      if (!id) {
        console.warn(`${fieldKey} not found!`);
        return;
      }
      const { validators = [] } = this.mApi.getFormItemProps(id) || {};
      const toValidators = [
        ...validators,
        validatorItem
      ];
      this.mApi.setAttributes(id, {
        validators: toValidators
      });
      this.bindValidateHandler(id, toValidators);
    };
    applyModelApiMiddleware('addValidator', addValidatorMiddleware);
    const removeValidatorMiddleware = () => (fieldKey, validatorItem) => {
      const id = this.fieldKey2Id[fieldKey];
      if (!id) {
        console.warn(`${fieldKey} not found!`);
        return;
      }
      const { validators = [] } = this.mApi.getFormItemProps(id) || {};
      this.mApi.setAttributes(id, {
        validators: validators.filter(valid => {
          return valid.validator !== validatorItem.validator;
        })
      });
    };
    applyModelApiMiddleware('removeValidator', removeValidatorMiddleware);
    const disableValidatorMiddleware = () => (fieldKey, disable = true) => {
      const id = this.fieldKey2Id[fieldKey];
      this.mApi.setAttributes(id, { validateDisabled: disable });
    };
    // 使校验器失效
    applyModelApiMiddleware('disableValidate', disableValidatorMiddleware);
    const validateMiddleware = () => fieldKey => {
      const id = this.fieldKey2Id[fieldKey];
      if (!id) {
        console.warn(`${fieldKey} not found!`);
        return Promise.reject(new Error(`${fieldKey} not found!`));
      }
      return validate(id, this.mApi, fieldKey).then(validateInfo => {
        return this.mApi.setAttributes(id, { validateInfo }, true).then(() => {
          return validateInfo;
        });
      });
    };
    applyModelApiMiddleware('validate', validateMiddleware);
    const validateAllMiddleware = () => () => {
      const ids = Object.keys(this.id2FieldKey);
      const promiseArray = ids.map(id => validate(id, this.mApi, this.id2FieldKey[id])
        .then(validateInfo => {
          this.mApi.setAttributes(id, { validateInfo }, false); // 后面批量渲染
          return { id, validateInfo };
        }));
      return Promise.all(promiseArray).then(array => {
        this.mApi.refresh(); // 批量执行校验结果的渲染
        const result = {
          passed: false,
          details: [],
        };
        array.forEach(item => {
          const { id, validateInfo } = item;
          // 将校验结果输出为validateInfo标准格式
          const detail = {
            id,
            fieldKey: this.id2FieldKey[id],
            validateInfo,
            passed: validateInfo.filter(i => i.passed === false).length === 0,
          };
          result.details.push(detail);
        });
        const notPassed = result.details.filter(item => item.passed === false);
        result.passed = notPassed.length === 0;
        if (!result.passed && this.scrollToFirstError === true) {
          this.mApi.scrollIntoView(notPassed[0].fieldKey);
        }
        return result;
      });
    };
    applyModelApiMiddleware('validateAll', validateAllMiddleware);
    const scrollIntoViewMiddleware = () => fieldKey => {
      const domNode = document.querySelector(`[data-field-key="${fieldKey}_${this.mApi.instanceId}"]`);
      if (domNode) {
        domNode.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    };
    applyModelApiMiddleware('scrollIntoView', scrollIntoViewMiddleware);
    // 绑定统一的onChange事件
    const ids = Object.keys(this.id2FieldKey);
    ids.forEach(id => {
      this.mApi.addEventListener(id, this.onChangeEventName, this.onChangeHandler);
    });
  }
  // 即将进行渲染
  onReadyToRender = ({ mApi }) => {
    // 绑定统一的校验器，在这个周期绑定可以使用最终的mApi接口
    const ids = Object.keys(this.id2FieldKey);
    ids.forEach(id => {
      const { rules, validators } = mApi.getFormItemProps(id) || {};
      this.bindValidateHandler(id, rules);
      this.bindValidateHandler(id, validators);
    });
  }
}

export default FormCoreModelPlugin;
