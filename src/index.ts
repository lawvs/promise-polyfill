type Callback = (value: any) => any

export class Promise {
  private state = 'pending' as 'pending' | 'resolved' | 'rejected'
  private value: any
  private pendThen?: Callback
  private pendCatch?: Callback
  static resolve: (val?: any) => Promise
  static reject: (val?: any) => Promise

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
    this.value = val
    this.pendThen?.(val)
  }

  private reject(e?: Error) {
    if (this.state === 'pending') {
      this.state = 'rejected'
    }
    this.pendCatch?.(e)
  }

  then(resFn?: Callback, rejFn?: Callback): Promise {
    if (this.state === 'pending') {
      // defer run after this promise resolved
      return new Promise((res, rej) => {
        this.pendThen = (val) => {
          if (!resFn) {
            res(this.value)
            return
          }
          try {
            const resVal = resFn(val)
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

    // run next tick
    const nextTick = globalThis.queueMicrotask || process.nextTick
    return new Promise((res, rej) =>
      nextTick(() => {
        if (!resFn) {
          res(this.value)
          return
        }
        try {
          const resVal = resFn(this.value)
          if (typeof resVal?.then === 'function') {
            resVal.then((v: any) => res(v))
          } else {
            res(resVal)
          }
        } catch (error) {
          // TODO throw promiseLike?
          rej(error)
        }
      })
    )
  }

  catch(fn: Callback): Promise {
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

Promise.resolve = (val?: any) => new Promise((res) => res(val))
Promise.reject = (e?: any) => new Promise((_, rej) => rej(e))
