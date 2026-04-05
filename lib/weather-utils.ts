export const getConditionClasses = (condition: string): string => {
  const c = condition.toLowerCase();
  if (c.includes('rain')) return 'bg-blue-50 border-blue-200';
  if (c.includes('cloud')) return 'bg-gray-100 border-gray-200';
  if (c.includes('sun') || c.includes('clear')) return 'bg-amber-50 border-amber-200';
  if (c.includes('snow')) return 'bg-sky-50 border-sky-200';
  return 'bg-white border-gray-200';
};
