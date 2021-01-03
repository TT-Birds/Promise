// 声明构造函数
function Promise(executor) {
  // 添加属性
  this.PromiseState = 'pending';
  this.PromiseResult = null;
  // 声明属性
  this.callbacks = [];
  // 保存实例对象的 this 的值
  const self = this;
  // resolve 函数
  function resolve(data) {
    // 判断状态
    if (self.PromiseState !== 'pending') return;
    // 1. 修改对象的状态 （promiseState）
    self.PromiseState = 'fulfilled';  // resolved
    // 2. 设置对象结果值  (promiseResult)
    self.PromiseResult = data;
    // 调用成功的回调函数
    self.callbacks.forEach(item => {
      item.onResolved(data);
    })
  }
  // reject 函数
  function reject(data) {
    // 判断状态
    if (self.PromiseState !== 'pending') return;
    // 1. 修改对象的状态 （promiseState）
    self.PromiseState = 'rejected';
    // 2. 设置对象结果值  (promiseResult)
    self.PromiseResult = data;
    // 调用失败的回调函数
    self.callbacks.forEach(item => {
      item.onRejected(data);
    })
  }
  try {
    // 同步调用『执行器函数』
    executor(resolve, reject);
  } catch (e) {
    // 修改 promise 对象状态为 『失败』
    reject(e)
  }
}

// 添加 then 方法
Promise.prototype.then = function (onResolved, onRejected) {
	const self = this;
	// 判断回调函数参数
	if (typeof onRejected !== 'function') {
		onRejected = reason => {
			throw reason;
		}
	}
	if (typeof onResolved !== 'function') {
		onResolved = value => value;
	}
  return new Promise((resolve, reject) => {
		// 封装callback函数
		function callback(typeFun) {
			try {
				// 获取回调函数的执行结果
				let result = typeFun(self.PromiseResult);
				// 判断
				if (result instanceof Promise) {
					// 如果是 promise 类型的对象
					result.then(v => {
						resolve(v);
					}, r => {
						reject(r)
					})
				} else {
					// 结果的对象状态为『成功』的
					resolve(result);
				}
			} catch (e) {
				reject(e)
			}
		}
    // 调用回调函数 PromiseState
    if (this.PromiseState === 'fulfilled') {
			callback(onResolved)
    }
    if (this.PromiseState === 'rejected') {
			callback(onRejected)
    }
    // 判断 pending 状态
    if (this.PromiseState === 'pending') {
      // 保存回调函数
      this.callbacks.push({
        onResolved: () => {
					callback(onResolved)
				},
        onRejected: () => {
					callback(onRejected)
				},
      })
    }
  })
}

// 添加 catch 方法
Promise.prototype.catch = function name(onRejected) {
	return this.then(undefined, onRejected);
}

// 添加 resolve 方法
Promise.resolve = function (value) {
	return new Promise((resolve, reject) => {
		if (value instanceof Promise) {
			value.then(v => {
				resolve(v);
			}, r => {
				reject(r);
			})
		} else {
			resolve(value);
		}
	})
}

// 添加 reject 方法
Promise.reject = function (reason) {
	return new Promise((resolve, reject) => {
		reject(reason)
	})
}

// 添加 all 方法
Promise.all = function (promises) {
	return new Promise((resolve, reject) => {
		// 声明变量
		let count = 0;
		let resArr = [];
		promises.forEach((item, index) => {
			item.then(v => {
				// 得知对象的状态是成功
				// 每个 promise 对象 都成功
				count++;
				// 将当前 promise 对象 的结果，按照顺序存入数组中
				resArr[index] = v;
				// 判断
				if (count === promises.length) {
					// 修改状态
					resolve(resArr);
				}
			}, r => {
				reject(r)
			})
		})
	})
}

// 添加 race 方法
Promise.race = function (promises) {
	return new Promise((resolve, reject) => {
		promises.forEach(item => {
			item.then(v => {
				resolve(v)
			}, r => {
				reject(r)
			})
		})
	})
}