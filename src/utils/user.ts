export const userCamelColumnsToSnake = (columns: string) => {
  return columns.replace(/([A-Z])/g, '_$1').toLowerCase();
};
