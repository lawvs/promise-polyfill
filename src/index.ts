type Callback = (value: any) => any

export class Promise {
  private state = 'pending' as 'pending' | 'resolved' | 'rejected'
  private pendThen?: Callback
  private pendCatch?: Callback
  static resolve: (val: any) => Promise
  static reject: (val: any) => Promise

  constructor(
    fn: (res: Promise['resolveValue'], rej: Promise['reject']) => void
  ) {
    try {
      fn(
        (val) => this.resolveValue(val),
        (e) => this.reject(e)
      )
    } catch (error) {
      this.pendCatch?.(error)
    }
  }

  private resolveValue(val?: any) {
    if (this.state === 'pending') {
      this.state = 'resolved'
    }
    this.pendThen?.(val)
  }

  private reject(e?: Error) {
    if (this.state === 'pending') {
      this.state = 'rejected'
    }
    this.pendCatch?.(e)
  }

  then(fn: Callback) {
    return new Promise((res, rej) => {
      // defer run after this promise resolved
      this.pendThen = (val) => {
        try {
          const resVal = fn(val)
          if (typeof resVal?.then === 'function') {
            resVal.then((v: any) => res(v))
          } else {
            res(resVal)
          }
        } catch (error) {
          // TODO throw promiseLike?
          rej(error)
        }
      }
    })
  }

  catch(fn: Callback) {
    return new Promise((res, rej) => {
      // defer run after this promise rejected
      this.pendCatch = (val) => {
        try {
          const resVal = fn(val)
          if (typeof resVal?.then === 'function') {
            resVal.then((v: any) => res(v))
          } else {
            res(resVal)
          }
        } catch (error) {
          // TODO throw promiseLike?
          rej(error)
        }
      }
    })
  }
}

Promise.resolve = (val: any) => new Promise((res) => res(val))
Promise.reject = (val: any) => new Promise((_, rej) => rej(val))
