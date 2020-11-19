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
  })
}

run('promisePolyfill', PromisePolyfill as any)
run('promise', Promise)
