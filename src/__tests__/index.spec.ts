import { Promise as MyPromise } from '..'

function delay(ms: number) {
  return new MyPromise((res) => setTimeout(() => res(), ms))
}

const spyLog = jest.spyOn(console, 'log')

beforeAll(() => {
  jest.useFakeTimers()
})

beforeEach(() => {
  spyLog.mockReset()
})

describe('base', () => {
  test('should promise works', () => {
    delay(1000)
      .then(() => '123')
      .then((val) => console.log(val))
      .then(() => console.log('A'))
      .then(() => console.log('B'))
      .then(() => delay(2000))
      .then(() => console.log('C'))

    expect(setTimeout).toBeCalled()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000)
    jest.runOnlyPendingTimers()

    expect(spyLog).toHaveBeenNthCalledWith(1, '123')
    expect(spyLog).toHaveBeenNthCalledWith(2, 'A')
    expect(spyLog).toHaveBeenNthCalledWith(3, 'B')

    expect(setTimeout).toBeCalled()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)
    expect(setTimeout).toHaveBeenCalledTimes(2)
    jest.runOnlyPendingTimers()

    expect(spyLog).toHaveBeenNthCalledWith(4, 'C')
    expect(spyLog).toHaveBeenCalledTimes(4)
  })
})

describe('common', () => {
  test('should new Promise call with res/rej', async () => {
    const fn = jest.fn()
    new MyPromise(fn)
    expect(fn).toBeCalledTimes(1)
    expect(fn).toBeCalledWith(expect.any(Function), expect.any(Function))
  })

  test('should Promise works with await', async () => {
    await new MyPromise((res) => res())
    await MyPromise.resolve()
    await MyPromise.reject()
  })

  test('should Promise.resolve works', () => {
    const promise = MyPromise.resolve(1)
    expect(promise).resolves.toBe(1)
  })
})
