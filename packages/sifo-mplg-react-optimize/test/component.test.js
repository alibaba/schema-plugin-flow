// 引入基础依赖
import React from 'react';
import { expect } from 'chai'; // 断言库
// 引入待测试组件
import SifoReactOptimizeModelPlugin from '../src/index';


// 测试描述语法参照 mocha 官方文档 https://mochajs.org/
describe('import', () => {
  it('should import correctly', () => {
    expect(SifoReactOptimizeModelPlugin).to.not.eql(undefined);
  });
});

describe('render', () => {
  let componentWrapper = {};

  before(function () {
    // runs before all tests in this block
  });

  after(function () {
    // runs after all tests in this block
  });

  beforeEach(function () {
    // runs before each test in this block
    componentWrapper = mount(
      <SifoReactOptimizeModelPlugin />
    );
  });

  afterEach(function () {
    // runs after each test in this block
    componentWrapper.unmount();
  });

  // test cases
  it('should render correctly', () => {
    expect(componentWrapper).to.exist;
  });
});
