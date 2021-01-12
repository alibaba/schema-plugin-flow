import { doValidate } from './validators';

function getValidators(rules, triggerType) {
  if (rules && Array.isArray(rules) && rules.length > 0) {
    if (triggerType) {
      const curRules = rules.filter(rl => (!rl.trigger || rl.trigger.length === 0
        || rl.trigger.indexOf(triggerType) >= 0));
      return curRules;
    }
    return rules;
  }
  return [];
}
/**
 * 触发校验，返回校验结果，调用方需要处理结果展示
 * @param {*} mApi
 * @param {*} id
 * @param {*} triggerType 类型如果有传，只执行相应类型的trigger
 * @return Promise.resolve(validateInfo)
 */
export const validate = (id, mApi, fieldKey, triggerType) => {
  const attributes = mApi.getFormItemProps(id) || {};
  const {
    value, validators, rules, validateDisabled
  } = attributes;
  const doRules = getValidators(rules, triggerType);
  const doValidators = getValidators(validators, triggerType);
  if (validateDisabled !== true && (doRules.length > 0 || doValidators.length > 0)) {
    // 注意：校验是异步的
    return doValidate({
      id,
      fieldKey,
      value,
      rules: doRules,
      validators: doValidators,
      mApi
    }).then(result => {
      return result;
    });
  }
  // 清除可能的之前保留的校验信息
  return Promise.resolve([]);
};

export default { validate };
