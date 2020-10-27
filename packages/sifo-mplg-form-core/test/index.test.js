import { expect } from 'chai'; // 断言库
import formCoreModelPlugin from '../src/index';

describe('import', () => {
  it('should import correctly', () => {
    expect(formCoreModelPlugin).to.not.eql(undefined);
  });
});