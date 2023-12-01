import { Promise as PromisePolyfill } from "..";

const run = (name: string, MyPromise: typeof Promise) => {
  function delay(ms = 0) {
    return new MyPromise((res) => setTimeout(res, ms));
  }

  const spyLog = jest.spyOn(console, "log");

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(globalThis, "setTimeout");
    spyLog.mockReset();
  });

  describe(`base test ${name}`, () => {
    test("should promise works", async () => {
      delay(1000)
        .then(() => "123")
        .then((val) => console.log(val))
        .then(() => console.log("A"))
        .then(() => console.log("B"))
        .then(() => delay(2000))
        .then(() => console.log("C"));

      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
      await jest.runAllTimersAsync();

      expect(spyLog).toHaveBeenNthCalledWith(1, "123");
      expect(spyLog).toHaveBeenNthCalledWith(2, "A");
      expect(spyLog).toHaveBeenNthCalledWith(3, "B");

      expect(setTimeout).toHaveBeenCalledTimes(2);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000);
      await jest.runAllTimersAsync();

      expect(spyLog).toHaveBeenNthCalledWith(4, "C");
      expect(spyLog).toHaveBeenCalledTimes(4);
    });
  });

  describe(`common test ${name}`, () => {
    test("should new Promise call with res/rej", async () => {
      const fn = jest.fn();
      new MyPromise(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });

    test("should Promise.resolve works", () => {
      const promise = MyPromise.resolve(1);
      expect(promise).resolves.toBe(1);
    });

    test("should Promise.then nothing works", async () => {
      const val = await MyPromise.resolve(1).then().then();
      expect(val).toBe(1);
    });

    test("should Promise works with await", async () => {
      await new MyPromise<void>((res) => res());
      await MyPromise.resolve();
    });

    test.skip("should Promise unwrap works", async () => {
      const resFn = jest.fn();
      MyPromise.resolve(MyPromise.resolve(1)).then(resFn);
      await jest.runAllTimersAsync();
      expect(resFn).toHaveBeenCalledTimes(1);
      expect(resFn).toHaveBeenNthCalledWith(1, 1);
    });

    test("should Promise works with delay then", async () => {
      const fn = jest.fn(() => 2);
      const promise = MyPromise.resolve(1);
      promise.then(fn);
      promise.then(fn);

      expect(fn).toHaveBeenCalledTimes(0);
      await jest.runAllTimersAsync();
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, 1);
      expect(fn).toHaveBeenNthCalledWith(2, 1);
    });

    test("should Promise.resolve works", () => {
      const promise = MyPromise.resolve(1);
      expect(promise).resolves.toBe(1);
    });

    test("should Promise.reject works", async () => {
      try {
        await MyPromise.reject(1);
        fail("should throw error");
      } catch (error) {
        expect(error).toBe(1);
      }
    });

    test("should throws error and then", async () => {
      const resFn = jest.fn();
      const rejFn = jest.fn(() => 2);
      const resFn2 = jest.fn();
      const rejFn2 = jest.fn();
      await MyPromise.reject(1).then(resFn, rejFn).then(resFn2, rejFn2);
      expect(resFn).toHaveBeenCalledTimes(0);
      expect(rejFn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledWith(1);
      expect(resFn2).toHaveBeenCalledTimes(1);
      expect(rejFn2).toHaveBeenCalledTimes(0);
      expect(resFn2).toHaveBeenCalledWith(2);
    });

    test("should Promise.reject promise works", async () => {
      const promise = MyPromise.resolve(1);
      try {
        await MyPromise.reject(promise);
        fail("should throw error");
      } catch (error) {
        expect(error).toBe(promise);
      }
    });

    test("should throws error at constructor works", async () => {
      try {
        await new MyPromise(() => {
          throw 1;
        });
        fail("should throw error");
      } catch (error) {
        expect(error).toBe(1);
      }
    });

    test("should reject new Promise works", async () => {
      try {
        await new MyPromise((res, rej) => {
          throw 1;
        });
        fail("should throw error");
      } catch (error) {
        expect(error).toBe(1);
      }
    });

    test("should throws error at constructor works", async () => {
      const fn = jest.fn();
      await new MyPromise(() => {
        throw 1;
      }).catch(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(1);
    });

    test("should delay resolve with throw works", async () => {
      const fn = jest.fn(() => {
        throw 1;
      });
      const rejFn = jest.fn();
      const promise = new MyPromise<void>((res) => setTimeout(() => res(), 1));
      promise.then(fn).catch(rejFn);
      await jest.runAllTimersAsync();
      expect(fn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledWith(1);
    });

    test("should delay reject with throw works", async () => {
      const fn = jest.fn(() => {
        throw 1;
      });
      const rejFn = jest.fn();
      MyPromise.reject().catch(fn).catch(rejFn);
      await jest.runAllTimersAsync();
      expect(fn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledWith(1);
    });

    test("should delay error at constructor works", async () => {
      const fn = jest.fn();
      await new MyPromise((res, rej) => {
        setTimeout(() => rej(1), 1);
        jest.runAllTimers();
      }).catch(fn);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(1);
    });

    test("should reject delay works", async () => {
      const resFn = jest.fn();
      const rejFn = jest.fn(() => 2);
      const promise = MyPromise.reject(1);
      await promise.then(resFn).then(resFn, rejFn);

      expect(resFn).toHaveBeenCalledTimes(0);
      expect(rejFn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledWith(1);
    });

    test("should nested reject works", async () => {
      const resFn = jest.fn();
      const rejFn = jest.fn(() => MyPromise.reject(2));
      const rejFn2 = jest.fn();
      const promise = MyPromise.reject(1);
      await promise.then(resFn).then(resFn, rejFn).then(resFn, rejFn2);

      expect(resFn).toHaveBeenCalledTimes(0);
      expect(rejFn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledWith(1);
      expect(rejFn2).toHaveBeenCalledTimes(1);
      expect(rejFn2).toHaveBeenCalledWith(2);
    });

    test("should multiple then with delay resolve works", async () => {
      const fn = jest.fn();
      const promise = new MyPromise<void>((res) => setTimeout(() => res(), 1));
      promise.then(fn);
      promise.then(fn);
      await jest.runAllTimersAsync();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test("should multiple then with delay reject works", async () => {
      const fn = jest.fn();
      const rejFn = jest.fn();
      const promise = new MyPromise((res, rej) => setTimeout(() => rej(1), 1));
      promise.then(fn).catch(rejFn);
      await jest.runAllTimersAsync();
      expect(fn).toHaveBeenCalledTimes(0);
      expect(rejFn).toHaveBeenCalledTimes(1);
      expect(rejFn).toHaveBeenCalledWith(1);
    });

    describe("should promise finally works", () => {
      test("promise finally common", async () => {
        const fn = jest.fn();
        const catchReject = jest.fn();
        MyPromise.resolve().finally(fn);
        MyPromise.reject().finally(fn).catch(catchReject);
        MyPromise.resolve()
          .then(() => {
            throw 1;
          })
          .finally(fn)
          .catch(catchReject);
        MyPromise.reject().then().finally(fn).catch(catchReject);
        await jest.runAllTimersAsync();
        expect(fn).toHaveBeenCalledTimes(4);
      });

      test.skip("promise finally then", async () => {
        const fn = jest.fn();
        const resolveFn = jest.fn();
        const catchReject = jest.fn();
        MyPromise.resolve().finally(fn).then(resolveFn);
        await jest.runAllTimersAsync();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(resolveFn).toHaveBeenCalledTimes(1);

        fn.mockReset();
        resolveFn.mockReset();
        catchReject.mockReset();
        MyPromise.reject().finally(fn).catch(catchReject).then(resolveFn);
        await jest.runAllTimersAsync();
        await jest.runAllTimersAsync();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(resolveFn).toHaveBeenCalledTimes(1);
        expect(catchReject).toHaveBeenCalledTimes(1);
      });

      test.skip("promise finally should not catch error", async () => {
        const resolveThen = jest.fn();
        const rejectThen = jest.fn();
        const catchReject = jest.fn();
        MyPromise.resolve().finally().then(resolveThen);
        MyPromise.reject().finally().then(rejectThen).catch(catchReject);
        MyPromise.reject()
          .then()
          .finally()
          .catch(catchReject)
          .then(resolveThen);
        await jest.runAllTimersAsync();
        expect(resolveThen).toHaveBeenCalledTimes(2);
        expect(rejectThen).toHaveBeenCalledTimes(0);
        expect(catchReject).toHaveBeenCalledTimes(2);
      });
    });

    test("should promise.all works", async () => {
      const fn = jest.fn();
      await MyPromise.all([]).then(fn);
      await MyPromise.all([MyPromise.resolve()]).then(fn);
      await MyPromise.all([MyPromise.resolve(), MyPromise.resolve()]).then(fn);
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });
};

run("promisePolyfill", PromisePolyfill as unknown as typeof Promise);
run("promise", Promise);
