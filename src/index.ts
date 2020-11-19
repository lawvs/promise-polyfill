type Callback = (value: any) => any

export class Promise {
  private state = 'pending' as 'pending' | 'resolved' | 'rejected'
  private value: any
  private next?: Callback
  static resolve: (val: any) => Promise
  static reject: (val: any) => Promise

  constructor(fn: (res: Promise['resolveValue']) => void) {
    fn((val) => this.resolveValue(val))
  }

  private resolveValue(val?: any) {
    if (this.state === 'pending') {
      this.state = 'resolved'
    }
    this.value = val

    if (this.next) {
      this.next(this.value)
    }
  }

  then(fn: Callback) {
    return new Promise((res) => {
      // defer run after this promise resolved
      this.next = () => res(fn(this.value))
    })
  }

  catch() {
    // TODO
  }
}

Promise.resolve = (val: any) => new Promise((res) => res(val))
