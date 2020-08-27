// 引入基础依赖
import { expect } from 'chai'; // 断言库

// 测试描述语法参照 mocha 官方文档 https://mochajs.org/
describe('Without React', () => {
  it('should count correctly', () => {
    expect(expect).to.be.a('function');
  });
});
