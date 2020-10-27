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
 * 触发校验
 * @param {*} mApi
 * @param {*} id
 * @param {*} triggerType 类型如果有传，只执行相应类型的trigger
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
      // 设置校验结果, 此校验是在setValue之后进行，故需要即时刷新
      mApi.setAttributes(id, { validateInfo: result }, true);
      return result;
    });
  }
  // 清除可能的之前保留的校验信息
  mApi.setAttributes(id, { validateInfo: [] }, true);
  return Promise.resolve([]);
};

export default { validate };
