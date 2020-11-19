type Callback = (value: any) => any

export class Promise {
  private state = 'pending' as 'pending' | 'resolved' | 'rejected'
  private value: any
  private error: any
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
      this.state = 'rejected'
      this.error = error
    }
  }

  private resolveValue(val?: any) {
    if (this.state === 'pending') {
      this.state = 'resolved'
    }
    this.value = val
    this.pendThen?.(val)
  }

  private reject(e?: any) {
    if (this.state === 'pending') {
      this.state = 'rejected'
    }
    this.error = e
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
            rej(error)
          }
        }
      })
    }

    // run at next tick
    const nextTick = globalThis.queueMicrotask || process.nextTick

    if (this.state === 'rejected') {
      return new Promise((res, rej) =>
        nextTick(() => {
          if (!rejFn) {
            rej(this.error)
            return
          }
          try {
            const resVal = rejFn(this.error)
            if (typeof resVal?.then === 'function') {
              resVal.then((v: any) => res(v))
            } else {
              res(resVal)
            }
          } catch (error) {
            rej(error)
          }
        })
      )
    }

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
          rej(error)
        }
      })
    )
  }
}

Promise.resolve = (val?: any) => new Promise((res) => res(val))
Promise.reject = (e?: any) => new Promise((_, rej) => rej(e))
