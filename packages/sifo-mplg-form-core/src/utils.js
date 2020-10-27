export const isNumber = s => String(s).trim() !== '' && !Number.isNaN(+String(s));
export const hasOwnProperty = (obj, propName) => Object.hasOwnProperty.call(obj, propName);

export const keyHolder = (key, defValue) => {
  if (key === null || key === undefined) return defValue;
  return `${key}`;
};
