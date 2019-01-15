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

  handleCb(cb) {
    if (this.state === RESOLVED) {
      cb.onResolved && setTimeout(() => cb.onResolved(this.value), 0);
    } else if (this.state === REJECTED) {
      cb.onRejected && setTimeout(() => cb.onRejected(this.value), 0);
    } else {
      this.callbacks.push(cb);
    }
  }

  then(onResolved, onRejected) {
    return new OwnPromise((resolve, reject) => {
      const cb = {
        onResolved: data => {
          let nextValue = data;

          if (onResolved) {
            try {
              nextValue = onResolved(data);

              if (nextValue && nextValue instanceof OwnPromise) {
                nextValue.then();
                return nextValue.then(resolve, reject);
              }
            } catch (err) {
              return reject(err);
            }
          }
          resolve(nextValue);
        },
        onRejected: data => {
          let nextValue = data;

          if (onRejected) {
            try {
              nextValue = onRejected(data);

              if (nextValue && nextValue instanceof OwnPromise) {
                return nextValue.then(resolve, reject);
              }
            } catch (err) {
              return reject(err);
            }
          }
          reject(nextValue);
        }
      };
      this.handleCb(cb);
    });
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