class OwnPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('Executor must be a function');
    }

    this.state = 'PENDING';
    this.chained = [];

    const resolve = res => {
      if (this.state !== 'PENDING') {
        return;
      }

      this.state = 'FULFILLED';
      this.internalValue = res;

      for (const { onFulfilled } of this.chained) {
        onFulfilled(res);
      }
    };

    const reject = err => {
      if (this.state !== 'PENDING') {
        return;
      }
      this.state = 'REJECTED';
      this.internalValue = err;

      for (const { onRejected } of this.chained) {
        onRejected(err);
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  static all(iterable) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new OwnPromise((resolve, reject) => {
      const isEmptyIterable = iterable => {
        for (let key of iterable) {
          return false;
        }
        return true;
      };

      if (isEmptyIterable(iterable)) {
        return resolve([]);
      }

      const values = new Array(iterable.length);
      let counter = 0;
      const tryResolve = i => value => {
        values[i] = value;
        counter += 1;

        if (counter === iterable.length) {
          resolve(values);
        }
      };

      for (let i = 0; i < iterable.length; i++) {
        const promise = iterable[i];
        promise.then(tryResolve(i), reject);
      }
    });
  }

  then(onFulfilled, onRejected) {
    return new OwnPromise((resolve, reject) => {
      const _onFulfilled = res => {
        try {
          resolve(onFulfilled(res));
        } catch (err) {
          reject(err);
        }
      };

      const _onRejected = err => {
        try {
          reject(onRejected(err));
        } catch (_err) {
          reject(_err);
        }
      };

      if (this.state === 'FULFILLED') {
        setTimeout(_onFulfilled, 0, this.internalValue);
      } else if (this.state === 'REJECTED') {
        setTimeout(_onRejected, 0, this.internalValue);
      } else {
        this.chained.push({
          onFulfilled: _onFulfilled,
          onRejected: _onRejected
        });
      }
    });
  }

  static resolve(val) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    if (val instanceof OwnPromise) {
      return val;
    }

    return new OwnPromise(resolve => resolve(val));
  }

  static reject(val) {
    if (typeof this !== 'function') {
      throw new TypeError('this is not a constructor');
    }

    return new OwnPromise((resolve, reject) => reject(val));
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

module.exports = OwnPromise;