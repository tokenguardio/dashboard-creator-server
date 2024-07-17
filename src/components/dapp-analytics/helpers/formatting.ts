import _ from 'lodash';

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'k';
  }
  return num.toString();
}

export function convertAndFormatNumbers(num1: number, num2: number): string {
  const formattedNum1 = formatNumber(num1);
  const formattedNum2 = formatNumber(num2);
  const percentage = ((num1 / num2) * 100).toFixed(2);

  return `${formattedNum1} / ${formattedNum2} (${percentage}%)`;
}

