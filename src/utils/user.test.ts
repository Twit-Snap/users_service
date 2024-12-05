import { userCamelColumnsToSnake } from './user';

describe('User Utility Functions', () => {
  it('should convert camelCase to snake_case', () => {
    const result = userCamelColumnsToSnake('camelCaseExample');
    expect(result).toBe('camel_case_example');
  });
  it('should convert profilePicture to snake_case', () => {
    const result = userCamelColumnsToSnake('profilePicture');
    expect(result).toBe('profile_picture');
  });

  it('should convert backgroundPicture to snake_case', () => {
    const result = userCamelColumnsToSnake('backgroundPicture');
    expect(result).toBe('background_picture');
  });

  it('should convert isPrivate to snake_case', () => {
    const result = userCamelColumnsToSnake('isPrivate');
    expect(result).toBe('is_private');
  });
});
