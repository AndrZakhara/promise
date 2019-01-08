class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('Executor is not a function');
    }

    this.state = 'PENDING';
    this.value = null;
    this.queue = [];
    executor(OwnPromise.resolve, OwnPromise.reject);
  }

  static resolve(value) {
    this.state = 'FULFILLED';
    this.value = value;
    return value && ({}).hasOwnProperty.call(value, 'then')
      ? value
      : new OwnPromise(resolve => {
        resolve(value);
      });
  }

  static reject(reason) {
    this.state = 'REJECTED';
    this.value = reason;
    return new OwnPromise((_, reject) => reject(reason));
  }
}

module.exports = OwnPromise;