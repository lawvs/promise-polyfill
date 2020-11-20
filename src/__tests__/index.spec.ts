import { Promise as PromisePolyfill } from '..'

const run = (name: string, MyPromise: typeof Promise) => {
  function delay(ms: number) {
    return new MyPromise((res) => setTimeout(() => res(), ms))
  }

  const spyLog = jest.spyOn(console, 'log')

  beforeEach(() => {
    jest.useFakeTimers()
    spyLog.mockReset()
  })

  describe(`base test ${name}`, () => {
    test('should promise works', async () => {
      delay(1000)
        .then(() => '123')
        .then((val) => console.log(val))
        .then(() => console.log('A'))
        .then(() => console.log('B'))
        .then(() => delay(2000))
        .then(() => console.log('C'))

      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
      jest.runOnlyPendingTimers()
      await new Promise((res) => process.nextTick(res))

      expect(spyLog).toHaveBeenNthCalledWith(1, '123')
      expect(spyLog).toHaveBeenNthCalledWith(2, 'A')
      expect(spyLog).toHaveBeenNthCalledWith(3, 'B')

      expect(setTimeout).toHaveBeenCalledTimes(2)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)
      jest.runOnlyPendingTimers()
      await new Promise((res) => process.nextTick(res))

      expect(spyLog).toHaveBeenNthCalledWith(4, 'C')
      expect(spyLog).toHaveBeenCalledTimes(4)
    })
  })

  describe(`common test ${name}`, () => {
    test('should new Promise call with res/rej', async () => {
      const fn = jest.fn()
      new MyPromise(fn)
      expect(fn).toBeCalledTimes(1)
      expect(fn).toBeCalledWith(expect.any(Function), expect.any(Function))
    })

    test('should Promise.resolve works', () => {
      const promise = MyPromise.resolve(1)
      expect(promise).resolves.toBe(1)
    })

    test('should Promise.then nothing works', async () => {
      const val = await MyPromise.resolve(1).then().then()
      expect(val).toBe(1)
    })

    test('should Promise works with await', async () => {
      await new MyPromise((res) => res())
      await MyPromise.resolve()
    })

    test('should Promise works with delay then', async () => {
      const fn = jest.fn(() => 2)
      const promise = MyPromise.resolve(1)
      promise.then(fn)
      promise.then(fn)

      expect(fn).toBeCalledTimes(0)
      await new Promise((res) => process.nextTick(res))
      expect(fn).toBeCalledTimes(2)
      expect(fn).toHaveBeenNthCalledWith(1, 1)
      expect(fn).toHaveBeenNthCalledWith(2, 1)
    })

    test('should Promise.resolve works', () => {
      const promise = MyPromise.resolve(1)
      expect(promise).resolves.toBe(1)
    })

    test('should Promise.reject works', async () => {
      try {
        await MyPromise.reject(1)
        fail('should throw error')
      } catch (error) {
        expect(error).toBe(1)
      }
    })

    test('should throws error and then', async () => {
      const resFn = jest.fn()
      const rejFn = jest.fn(() => 2)
      const resFn2 = jest.fn()
      const rejFn2 = jest.fn()
      await MyPromise.reject(1).then(resFn, rejFn).then(resFn2, rejFn2)
      expect(resFn).toBeCalledTimes(0)
      expect(rejFn).toBeCalledTimes(1)
      expect(rejFn).toHaveBeenCalledWith(1)
      expect(resFn2).toBeCalledTimes(1)
      expect(rejFn2).toBeCalledTimes(0)
      expect(resFn2).toHaveBeenCalledWith(2)
    })

    test('should Promise.reject promise works', async () => {
      const promise = MyPromise.resolve(1)
      try {
        await MyPromise.reject(promise)
        fail('should throw error')
      } catch (error) {
        expect(error).toBe(promise)
      }
    })

    test('should throws error at constructor works', async () => {
      try {
        await new MyPromise(() => {
          throw 1
        })
        fail('should throw error')
      } catch (error) {
        expect(error).toBe(1)
      }
    })

    test('should reject new Promise works', async () => {
      try {
        await new MyPromise((res, rej) => {
          throw 1
        })
        fail('should throw error')
      } catch (error) {
        expect(error).toBe(1)
      }
    })

    test('should throws error at constructor works', async () => {
      const fn = jest.fn()
      await new MyPromise(() => {
        throw 1
      }).catch(fn)
      expect(fn).toBeCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(1)
    })

    test('should delay error at constructor works', async () => {
      const fn = jest.fn()
      await new MyPromise((res, rej) => {
        setTimeout(() => rej(1), 1)
        jest.runAllTimers()
      }).catch(fn)
      expect(fn).toBeCalledTimes(1)
      expect(fn).toHaveBeenCalledWith(1)
    })

    test('should reject delay works', async () => {
      const resFn = jest.fn()
      const rejFn = jest.fn(() => 2)
      const promise = MyPromise.reject(1)
      await promise.then(resFn).then(resFn, rejFn)

      expect(resFn).toBeCalledTimes(0)
      expect(rejFn).toBeCalledTimes(1)
      expect(rejFn).toHaveBeenCalledWith(1)
    })

    test('should nested reject works', async () => {
      const resFn = jest.fn()
      const rejFn = jest.fn(() => MyPromise.reject(2))
      const rejFn2 = jest.fn()
      const promise = MyPromise.reject(1)
      await promise.then(resFn).then(resFn, rejFn).then(resFn, rejFn2)

      expect(resFn).toBeCalledTimes(0)
      expect(rejFn).toBeCalledTimes(1)
      expect(rejFn).toHaveBeenCalledWith(1)
      expect(rejFn2).toBeCalledTimes(1)
      expect(rejFn2).toHaveBeenCalledWith(2)
    })

    test('should multiple then with delay resolve works', async () => {
      const fn = jest.fn()
      const promise = new MyPromise((res) => setTimeout(() => res(), 1))
      promise.then(fn)
      promise.then(fn)
      jest.runAllTimers()
      await new Promise((res) => process.nextTick(res))
      expect(fn).toBeCalledTimes(2)
    })

    test('should multiple then with delay reject works', async () => {
      const fn = jest.fn()
      const rejFn = jest.fn()
      const promise = new MyPromise((res, rej) => setTimeout(() => rej(1), 1))
      promise.then(fn).catch(rejFn)
      jest.runAllTimers()
      await new Promise((res) => process.nextTick(res))
      expect(fn).toBeCalledTimes(0)
      expect(rejFn).toBeCalledTimes(1)
      expect(rejFn).toBeCalledWith(1)
    })

    test('should delay resolve with throw works', async () => {
      const fn = jest.fn(() => {
        throw 1
      })
      const rejFn = jest.fn()
      const promise = new MyPromise((res) => setTimeout(() => res(), 1))
      promise.then(fn).catch(rejFn)
      jest.runAllTimers()
      await new Promise((res) => process.nextTick(res))
      expect(fn).toBeCalledTimes(1)
      expect(rejFn).toBeCalledTimes(1)
      expect(rejFn).toBeCalledWith(1)
    })

    test('should promise finally works', async () => {
      const fn = jest.fn()
      MyPromise.resolve().finally(fn)
      MyPromise.reject().finally(fn)
      MyPromise.resolve()
        .then(() => {
          throw 1
        })
        .finally(fn)
      MyPromise.reject().then().finally(fn)
      await nextTick()
      expect(fn).toBeCalledTimes(4)
    })

    test('should promise.all works', async () => {
      const fn = jest.fn()
      await MyPromise.all([]).then(fn)
      await MyPromise.all([MyPromise.resolve(1)]).then(fn)
      expect(fn).toBeCalledTimes(2)
    })
  })
}

run('promisePolyfill', PromisePolyfill as any)
run('promise', Promise)
