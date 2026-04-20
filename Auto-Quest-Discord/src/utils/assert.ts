export function assertDefined<T>(value: T, name: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: "${name}" must not be null or undefined`);
  }
}

export function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Assertion failed: "${name}" must be a non-empty string`);
  }
}
