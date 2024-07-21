export const setIntervalPromise = (cb: () => Promise<void>, ms: number) => {
  let reject: undefined | ((err: Error) => void);
  const promise = new Promise<void>((_, rej) => {
    reject = rej;
  });
  const interval = setInterval(() => {
    cb().catch((err) => {
      clearInterval(interval);
      if (!reject) {
        throw new Error("Couldn't pass rejection to promise");
      }
      reject(err);
    });
  }, ms);
  return {
    promise,
    interval,
  };
};
