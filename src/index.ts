export class Promise {
  private value: any
  private queue: ((value: any) => any)[] = []

  constructor(fn: (res: Promise['resolve'], rej: Promise['reject']) => void) {
    fn(
      () => this.resolve(),
      () => this.reject()
    )
  }

  private resolve() {
    const pendfn = this.queue.shift()
    if (pendfn) {
      this.value = pendfn(this.value)
    } else {
      return
    }

    if (typeof this.value?.then === 'function') {
      this.value = this.value.then(() => this.resolve())
    } else {
      this.resolve()
    }
  }

  reject() {
    // TODO
  }

  then(fn: (value: any) => any) {
    this.queue.push(fn)
    return this
  }
}
