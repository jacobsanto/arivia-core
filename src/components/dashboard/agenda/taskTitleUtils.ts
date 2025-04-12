
/**
 * Extracts task name without villa name and "at" prefix
 * @param title Original task title
 * @param propertyName Property/villa name to remove
 * @returns Cleaned task title
 */
export const getTaskNameWithoutVilla = (title: string, propertyName: string): string => {
  let cleanTitle = title;
  
  // Remove property name if it appears in the title
  if (cleanTitle.includes(propertyName)) {
    cleanTitle = cleanTitle.replace(`${propertyName} `, '').replace(`${propertyName}`, '');
  }
  
  // Remove "at" if it appears at the beginning of the title after cleanup
  cleanTitle = cleanTitle.trim();
  if (cleanTitle.toLowerCase().startsWith('at ')) {
    cleanTitle = cleanTitle.substring(3);
  }
  
  return cleanTitle.trim();
};
