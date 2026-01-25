export default function IntlNumberFormat(value: number | string | undefined | null) {
  const num = typeof value === 'string' ? Number(value) : (value ?? 0);
  try {
    return new Intl.NumberFormat('en-US').format(num as number);
  } catch {
    return String(num);
  }
}
