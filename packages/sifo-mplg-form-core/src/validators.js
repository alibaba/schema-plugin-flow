import { isNumber, hasOwnProperty } from './utils';

function typeValidate(rule, value, addInvalidate) {
  const { type, message } = rule;
  if (isNumber(value)) {
    const num = Number(value);
    if (type === 'integer' && (num < 0 || (`${value}`).indexOf('.') >= 0)) {
      addInvalidate({ passed: false, status: 'error', message: message || '请输入非负整数' });
    }
  } else if (value !== undefined && value !== null) {
    addInvalidate({ passed: false, status: 'error', message: message || '请输入数字' });
  }
}

// 必填
const requireValidate = (rule, value, addInvalidate) => {
  const { message } = rule;
  const required = hasOwnProperty(rule, 'required') && rule.required === true;
  const isEmpty = (Number.isNaN(value) || value === undefined || value === null
    || String(value).trim() === '');
  if (required && isEmpty) {
    addInvalidate({ passed: false, status: 'error', message: message || '此项必填' });
  }
};

// 数字 max min
const numberValidate = (rule, value, addInvalidate) => {
  const { message } = rule;
  if (hasOwnProperty(rule, 'max') || hasOwnProperty(rule, 'min')) {
    if (isNumber(value)) {
      const num = Number(value);
      if (hasOwnProperty(rule, 'max') && num > rule.max) {
        addInvalidate({ passed: false, status: 'error', message: message || `不能大于${rule.max}` });
      }
      if (hasOwnProperty(rule, 'min') && num < rule.min) {
        addInvalidate({ passed: false, status: 'error', message: message || `不能小于${rule.min}` });
      }
    } else if (value !== undefined && value !== null) {
      addInvalidate({ passed: false, status: 'error', message: '请输入数字' });
    }
  }
};
const maxLengthValidate = (rule, str, addInvalidate) => {
  const { message } = rule;
  if (hasOwnProperty(rule, 'maxLength') && str.length > rule.maxLength) {
    addInvalidate({
      passed: false, status: 'error', message: message || `长度不能大于${rule.maxLength}`
    });
  }
};
const minLengthValidate = (rule, str, addInvalidate) => {
  const { message } = rule;
  if (hasOwnProperty(rule, 'minLength') && str.length < rule.minLength) {
    addInvalidate({
      passed: false, status: 'error', message: message || `长度不能小于${rule.minLength}`
    });
  }
};
const lengthValidate = (rule, value, addInvalidate) => {
  // 字符串 maxLength minLength
  const needValidate = hasOwnProperty(rule, 'maxLength') || hasOwnProperty(rule, 'minLength');
  if (!needValidate) return;
  if (isNumber(value) || typeof value === 'string') {
    const str = String(value);
    maxLengthValidate(rule, str, addInvalidate);
    minLengthValidate(rule, str, addInvalidate);
  } else if (value !== undefined && value !== null) {
    addInvalidate({ passed: false, status: 'error', message: '请输入数字或文本' });
  }
};

/**
 * 内置的rules校验
 * @param {*} rules 规则
 * @param {*} value 值
 */
function systemValidate(rules, value) {
  const ret = [];
  const addInvalidate = result => {
    ret.push(result);
  };
  if (!rules) return ret;
  if (!Array.isArray(rules)) {
    console.error('rules should be a array!');
    return ret;
  }
  if (rules) {
    rules.forEach(rule => {
      requireValidate(rule, value, addInvalidate);
      if (hasOwnProperty(rule, 'type')) {
        typeValidate(rule, value, addInvalidate);
      }
      numberValidate(rule, value, addInvalidate);
      lengthValidate(rule, value, addInvalidate);
    });
  }
  return ret;
}


export const doValidate = args => {
  const {
    id,
    fieldKey,
    value,
    rules,
    validators,
    mApi
  } = args;
  // 同步
  const ret = systemValidate(rules, value);
  const promisArray = [];
  // 异步
  (validators || []).forEach(item => {
    if (item.validator && typeof item.validator === 'function') {
      promisArray.push(new Promise(res => {
        const callback = vResult => {
          if (!vResult) {
            res({ passed: true });
            return;
          }
          if (typeof vResult === 'string') {
            res({ passed: false, message: vResult });
            return;
          }
          res(vResult);
        };
        // (value, callback, opts:{ id, mApi, fieldKey }) => ({ passed:bool; message:string; })
        item.validator(value, callback, { id, mApi, fieldKey });
      }));
    }
  });
  return Promise.all(promisArray).then(results => {
    let valResult = [].concat(ret || []);
    valResult = valResult.concat(results || []);
    // { passed:bool }[]
    return new Promise(resolve => resolve(valResult));
  });
};

export default { doValidate };
