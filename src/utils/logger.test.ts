import logger from './logger';

describe('Logger', () => {
  it('should log messages at the correct level', () => {
    // Test logging at different levels
    logger.info('Info message');
    logger.error('Error message');
    // You can add more assertions based on your logger's behavior
  });
});
