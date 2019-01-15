const RESOLVED = 'RESOLVED';
const PENDING = 'PENDING';
const REJECTED = 'REJECTED';

class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('Executor is not a function');
    }
    this.state = PENDING;
    this.callbacks = [];
    this.value = null;

    const resolve = data => {
      if (this.state !== PENDING) {
        return;
      }
      this.state = RESOLVED;
      this.value = data;
      this.callbacks.forEach(({ res, rej }) => {
        this.value = res(this.value);
      });
    };

    const reject = err => {
      this.state = REJECTED;
      this.value = err;
      return new OwnPromise((resolve, reject) => reject(err));
    };

    executor(resolve, reject);
  }

  static race(iterable) {
    const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

    if (!isIterable(iterable)) {
      throw new TypeError('ERROR');
    }
    return new OwnPromise((resolve, reject) => {
      for (let i = 0; i < iterable.length; i++) {
        iterable[i].then(resolve, reject);
      }
    });
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

  static resolve(data) {
    return new OwnPromise(resolve => resolve(data));
  }

  static reject(data) {
    return new OwnPromise((resolve, reject) => reject(data));
  }
}

module.exports = OwnPromise;