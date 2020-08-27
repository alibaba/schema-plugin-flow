// 引入基础依赖
import React from 'react';
import Enzyme, { mount } from 'enzyme'; // https://github.com/airbnb/enzyme
import Adapter from 'enzyme-adapter-react-15';
import chai, { expect } from 'chai'; // 断言库
import chaiEnzyme from 'chai-enzyme'; // chai的enzyme中间件，API参考 https://github.com/producthunt/chai-enzyme

// 引入待测试组件
import SifoApp from '../src/index';

// 初始化测试环境
Enzyme.configure({ adapter: new Adapter() });
chai.use(chaiEnzyme());

// 测试描述语法参照 mocha 官方文档 https://mochajs.org/
describe('import', () => {
  it('should import correctly', () => {
    expect(SifoApp).to.not.eql(undefined);
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
      <SifoApp />
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
