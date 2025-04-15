
/**
 * Extracts a clean task title by removing the property name from it if it exists
 * Example: "Villa Caldera Cleaning" => "Cleaning" when property is "Villa Caldera"
 */
export const getTaskNameWithoutVilla = (title: string, property: string): string => {
  // If the title starts with the property name, remove it
  if (title.startsWith(property)) {
    return title.substring(property.length).trim();
  }
  
  // Handle case where property name is within the title but not at the start
  const propertyIndex = title.indexOf(property);
  if (propertyIndex > -1) {
    const beforeProperty = title.substring(0, propertyIndex).trim();
    const afterProperty = title.substring(propertyIndex + property.length).trim();
    return `${beforeProperty} ${afterProperty}`.trim();
  }
  
  return title;
};
