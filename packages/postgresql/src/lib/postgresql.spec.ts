import { postgresql } from './postgresql';

describe('postgresql', () => {
  it('should work', () => {
    expect(postgresql()).toEqual('postgresql');
  });
});
