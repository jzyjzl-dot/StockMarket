// import { describe, it, expect } from 'vitest'

// 被测试函数
function add(a, b) {
  return a + b;
}

// 测试用例
describe('math test', () => {
  it('adds two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
