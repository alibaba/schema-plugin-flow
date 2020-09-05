import VueModelPlugin from './VueModelPlugin';
import AttributesClassify from './AttributesClassify';

const presetPlugins = [
  { modelPlugin: AttributesClassify }
];
// 前置插件
export const baseOrderPlugins = [
  { modelPlugin: VueModelPlugin }
];
export default presetPlugins;
