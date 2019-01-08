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

  static all(promises) {
    if ((!Array.isArray(promises)) || !(promises instanceof OwnPromise)) {
      throw new TypeError('Promise.all arguments must be an array.');
    } else {
      const results = [];

      return new OwnPromise((resolve, reject) => {
        promises.forEach((promise, i) => {
          if (!(promise instanceof OwnPromise)) {
            throw new TypeError('variable must be a Promise instance.');
          }
          promise.then(res => {
            results[i] = res;

            if (results.length === promises.length) {
              resolve(results);
            }
          }, err => {
            reject(err);
          });
        });
      });
    }
  }
}

module.exports = OwnPromise;