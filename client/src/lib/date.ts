import { format, parseISO, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateValue: string | Date | undefined, dateFormat = 'MMM dd, yyyy') => {
  if (!dateValue) return '';
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  return format(date, dateFormat);
};

export const formatTime = (dateValue: string | Date | undefined) => {
  if (!dateValue) return '';
  return formatDate(dateValue, 'h:mm a');
};

export const getRelativeTime = (dateValue: string | Date | undefined) => {
  if (!dateValue) return '';
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  return formatDistanceToNow(date, { addSuffix: true });
};
