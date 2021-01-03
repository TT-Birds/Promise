function Promise(executor) {

	this.PromiseState = 'pending';
	this.PromiseResult = null;
	this.callbacks = [];

	const self = this;
	
	function resolve(data) {
		if (self.PromiseState !== 'pending') return;
		self.PromiseState = 'fulfilled';
		self.PromiseResult = data;

		setTimeout(() => {
			self.callbacks.forEach(item => {
				item.onResolved();
			})
		});
	}

	function reject(data) {
		if (self.PromiseState !== 'pending') return;
		self.PromiseState = 'rejected';
		self.PromiseResult = data;

		setTimeout(() => {
			self.callbacks.forEach(item => {
				item.onRejected();
			})
		});
	}
	try {
		executor(resolve, reject);
	} catch (error) {
		reject(error)
	}
}

Promise.prototype.then = function (onResolved, onRejected) {

	const self = this;

	if (typeof onResolved !== 'function') {
		onResolved = value => value
	}
	if (typeof onRejected !== 'function') {
		onRejected = reason => {
			throw reason
		}
	}

	return new Promise((resolve, reject) => {
		
		function callback(typeFun) {
			try {
				const result = typeFun(self.PromiseResult)
				if (result instanceof Promise) {
					result.then(v => {
						resolve(v)
					}, r => {
						reject(r)
					})
				} else {
					resolve(result)
				}
			} catch (error) {
				reject(error)
			}
		}
	
		if (self.PromiseState === 'fulfilled') {
			setTimeout(() => {
				callback(onResolved)
			});
		}
		if (self.PromiseState === 'rejected') {
			setTimeout(() => {
				callback(onRejected)
			});
		}
		if (self.PromiseState === 'pending') {
			self.callbacks.push({
				onResolved: () => {
					callback(onResolved)
				},
				onRejected: () => {
					callback(onRejected)
				}
			})
		}
	})
}

Promise.prototype.catch = function (onRejected) {
	return this.then(undefined, onRejected)
}

Promise.resolve = function (value) {
	return new Promise((resolve, reject) => {
		if (value instanceof Promise) {
			value.then(v => {
				resolve(v)
			}, r => {
				reject(r)
			})
		} else {
			resolve(value)
		}
	})
}

Promise.reject = function (value) {
	return new Promise((resolve, reject) => {
		reject(value)
	})
}

Promise.all = function (promises) {
	return new Promise((resolve, reject) => {
		let count = 0;
		let resArr = [];
		promises.forEach((item, index) => {
			item.then(v => {
				count++;
				resArr[index] = v;
				if (count === promises.length) {
					resolve(resArr);
				}
			}, r => {
				reject(r)
			})
		})
	})
}

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