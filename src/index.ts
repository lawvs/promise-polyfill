type Callback = (value: any) => any

export class Promise {
  private state = 'pending' as 'pending' | 'resolved' | 'rejected'
  private pendThen?: Callback
  static resolve: (val: any) => Promise
  static reject: (val: any) => Promise

  constructor(fn: (res: Promise['resolveValue']) => void) {
    fn((val) => this.resolveValue(val))
  }

  private resolveValue(val?: any) {
    if (this.state === 'pending') {
      this.state = 'resolved'
    }
    this.pendThen?.(val)
  }

  then(fn: Callback) {
    return new Promise((res) => {
      // defer run after this promise resolved
      this.pendThen = (val) => res(fn(val))
    })
  }
}

Promise.resolve = (val: any) => new Promise((res) => res(val))
