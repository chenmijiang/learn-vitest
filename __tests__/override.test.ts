import { test as baseTest, describe, expect } from 'vitest';

const test = baseTest
  .extend('dependency', 'default')
  .extend('dependant', ({ dependency }) => ({ dependency }));

describe('use scoped values', () => {
  test.override({ dependency: 'new' });

  test('uses scoped value', ({ dependant, dependency }) => {
    expect(dependency).toBe('new');
    expect(dependant).toEqual({ dependency: 'new' });
  });
});
