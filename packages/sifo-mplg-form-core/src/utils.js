export const isNumber = s => String(s).trim() !== '' && !Number.isNaN(+String(s));
export const hasOwnProperty = (obj, propName) => Object.hasOwnProperty.call(obj, propName);

export const keyHolder = (key, defValue) => {
  if (key === null || key === undefined) return defValue;
  return `${key}`;
};
const RULES_KEYS = [
  'required',
  'type',
  'max',
  'min',
  'maxLength',
  'minLength'
];
export function findRule(rule) {
  const ruleKey = RULES_KEYS.find(key => hasOwnProperty(rule, key));
  if (ruleKey) {
    return {
      ruleKey,
      ruleType: ruleKey === 'type' ? rule[ruleKey] : ruleKey,
      rule,
    };
  }
  return null;
}
/**
 * (oldRules:[], rules:[])
 */
export const mergeRules = (oldRules = [], rules = []) => {
  const newRules = [...oldRules];
  const opeRules = [...rules];
  const merged = newRules.map(rule => {
    const rul = findRule(rule);
    if (rul) {
      const { ruleType, ruleKey } = rul;
      const idx = opeRules.findIndex(it => {
        if (hasOwnProperty(it, ruleKey)) {
          if (ruleKey === 'type') {
            return ruleType === it[ruleKey];
          }
          return true;
        }
        return false;
      });
      if (idx >= 0) {
        const [target] = opeRules.splice(idx, 1);
        return {
          ...rule,
          ...target
        };
      }
    }
    return rule;
  });
  return [...merged, ...opeRules];
};
