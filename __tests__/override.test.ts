import { test as baseTest, describe, expect } from 'vitest';

const test = baseTest
  .extend('dependency', 'default')
  .extend('dependant', ({ dependency }) => dependency);

describe('use scoped values', () => {
  test.override({ dependency: 'new' });

  test('uses scoped value', ({ dependant }) => {
    // `dependant` 使用覆盖后的新值
    // 该值将作用于此套件内的所有测试
    expect(dependant).toEqual({ dependency: 'new' });
  });
});
