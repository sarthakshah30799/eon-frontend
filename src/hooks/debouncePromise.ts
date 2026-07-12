export const debouncePromise = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  delay: number,
  fallback: TResult
): ((...args: TArgs) => Promise<TResult>) => {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: TArgs) => {
    if (timer) {
      clearTimeout(timer);
    }

    return new Promise<TResult>(resolve => {
      timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch {
          resolve(fallback);
        }
      }, delay);
    });
  };
};
