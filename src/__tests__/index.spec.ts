import { Promise as MyPromise } from '..'

jest.useFakeTimers()

function delay(ms: number) {
  return new MyPromise((res) => setTimeout(() => res(), ms))
}

describe('base', () => {
  test('should promise works', async () => {
    const spy = jest.spyOn(console, 'log')
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

    expect(spy).toHaveBeenNthCalledWith(1, '123')
    expect(spy).toHaveBeenNthCalledWith(2, 'A')
    expect(spy).toHaveBeenNthCalledWith(3, 'B')

    expect(setTimeout).toBeCalled()
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 2000)
    expect(setTimeout).toHaveBeenCalledTimes(2)
    jest.runOnlyPendingTimers()

    expect(spy).toHaveBeenNthCalledWith(4, 'C')
    expect(spy).toHaveBeenCalledTimes(4)
  })
})
