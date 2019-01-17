const PENDING = 'PENDING';
const RESOLVED = 'RESOLVED';
const REJECTED = 'REJECTED';

class OwnPromise {
  constructor(executer) {
    if (typeof executer !== 'function') {
      throw new TypeError('Promise resolver must be a function');
    }

    this.state = PENDING;
    this.value = null;
    this.callbacks = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    executer(this.resolve, this.reject);
  }

  resolve(value) {
    if (this.state === PENDING) {
      this.state = RESOLVED;
      this.value = value;

      while (this.callbacks.length > 0) {
        const cb = this.callbacks.pop();

        if (this.state === RESOLVED) {
          if (cb.onResolved) {
            setTimeout(() => cb.onResolved(this.value), 0);
          }
        } else if (this.state === REJECTED) {
          if (cb.onRejected) {
            setTimeout(() => cb.onRejected(this.value), 0);
          }
        } else {
          this.callbacks.push(cb);
        }
      }
    }
  }

  reject(value) {
    if (this.state === PENDING) {
      this.state = REJECTED;
      this.value = value;

      while (this.callbacks.length > 0) {
        const cb = this.callbacks.pop();

        if (this.state === RESOLVED) {
          if (cb.onResolved) {
            setTimeout(() => cb.onResolved(this.value), 0);
          }
        } else if (this.state === REJECTED) {
          if (cb.onRejected) {
            setTimeout(() => cb.onRejected(this.value), 0);
          }
        } else {
          this.callbacks.push(cb);
        }
      }
    }
  }

  then(onResolved, onRejected) {
    return new OwnPromise((resolve, reject) => {
      const cb = {
        onResolved: value => {
          let nextValue = value;

          if (onResolved) {
            try {
              nextValue = onResolved(value);

              if (nextValue && nextValue.then) {
                return nextValue.then(resolve, reject);
              }
            } catch (err) {
              return reject(err);
            }
          }
          resolve(nextValue);
        },
        onRejected: value => {
          let nextValue = value;

          if (onRejected) {
            try {
              nextValue = onRejected(value);

              if (nextValue && nextValue.then) {
                return nextValue.then(resolve, reject);
              }
            } catch (err) {
              return reject(err);
            }
          }
          reject(nextValue);
        }
      };

      if (this.state === RESOLVED) {
        if (cb.onResolved) {
          setTimeout(() => cb.onResolved(this.value), 0);
        }
      } else if (this.state === REJECTED) {
        if (cb.onRejected) {
          setTimeout(() => cb.onRejected(this.value), 0);
        }
      } else {
        this.callbacks.push(cb);
      }
    });
  }

  done(onResolved) {
    return this.then(onResolved);
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    } else if (value instanceof OwnPromise) {
      return value;
    }

    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      resolve(value);
    });
  }

  static reject(value) {
    return new this((resolve, reject) => {
      if (typeof resolve !== 'function' || typeof reject !== 'function') {
        throw new TypeError('Not a function');
      }
      reject(value);
    });
  }

  static all(promises) {
    const isIterable = object => object !== null && typeof object[Symbol.iterator] === 'function';

    return new OwnPromise((resolve, reject) => {
      if (!isIterable(promises)) {
        throw new TypeError('ERROR');
      }

      const values = new Array(promises.length);
      let counter = 0;

      const tryResolve = i => value => {
        values[i] = value;
        counter += 1;

        if (counter === promises.length) {
          resolve(values);
        }
      };

      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i];
        promise.then(tryResolve(i), reject);
      }
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
}

module.exports = OwnPromise;