type Callback = (value?: any) => any

const nextTick = globalThis.queueMicrotask || process.nextTick

export class Promise {
  private state = 'pending' as 'pending' | 'resolved' | 'rejected'
  private value: any
  private error: any
  private pendThen: Callback[] = []
  private pendCatch: Callback[] = []
  static resolve: Callback
  static reject: Callback

  constructor(
    fn: (res: Promise['resolveValue'], rej: Promise['rejectValue']) => void
  ) {
    try {
      fn(
        (val) => this.resolveValue(val),
        (e) => this.rejectValue(e)
      )
    } catch (error) {
      this.state = 'rejected'
      this.error = error
    }
  }

  private resolveValue(val?: any) {
    this.state = 'resolved'
    this.value = val
    this.pendThen.forEach((fn) => fn(val))
  }

  private rejectValue(e?: any) {
    this.state = 'rejected'
    this.error = e
    this.pendCatch.forEach((fn) => fn(e))
  }

  then(resFn?: Callback, rejFn?: Callback): Promise {
    const baseResolve = (res: Callback, rej: Callback) => {
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
    }

    const baseReject = (res: Callback, rej: Callback) => {
      if (!rejFn) {
        rej(this.error)
        return
      }
      try {
        const resVal = rejFn(this.error)
        if (typeof resVal?.then === 'function') {
          resVal.then(res, rej)
        } else {
          res(resVal)
        }
      } catch (error) {
        rej(error)
      }
    }

    if (this.state === 'pending') {
      // defer run after this promise resolved
      return new Promise((res, rej) => {
        this.pendThen.push(() => baseResolve(res, rej))
        this.pendCatch.push(() => baseReject(res, rej))
      })
    }

    if (this.state === 'rejected') {
      return new Promise((res, rej) =>
        // run at next tick
        nextTick(() => baseReject(res, rej))
      )
    }

    return new Promise((res, rej) =>
      // run at next tick
      nextTick(() => baseResolve(res, rej))
    )
  }

  catch(rejFn: Callback) {
    return this.then(undefined, rejFn)
  }
}

Promise.resolve = (val?: any) => new Promise((res) => res(val))
Promise.reject = (e?: any) => new Promise((_, rej) => rej(e))
