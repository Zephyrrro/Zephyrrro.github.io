---
title: JavaScript中的异步
date: 2020-05-10 17:02:00
index_img: /img/eventloop/eventloop.png
tags: [JavaScript, 异步]
category: [JavaScript]
excerpt: 大概一年前就初步认识到JavaScript在单线程的运行机制下是怎么运行异步代码的，但只是懵懵懂懂，这次复习了整个运行过程...
---

<p class="note note-info">
	大概一年前就初步认识到JavaScript在单线程的运行机制下是怎么运行异步代码的，但只是懵懵懂懂，直到最近才大致清楚的了解了整个运行过程...
</p>

## 单线程的JavaScript

众所周知 `Javascript` 是单线程执行的，这就意味着代码只能自顶向下按顺序执行，一旦某行代码运行时间过长，就会导致后续代码运行阻塞。在 `JavaScript` 诞生的初期，`JavaScript` 只是用于简单的浏览器交互，并没有考虑到十分复杂的情况，因此即使当时是以单线程方式运行也是完全足够的，但在如今大前端时代下，各类技术横纵向发展迅速~~(开花警告)~~，没有异步运行机制显然无法使 `JavaScript` 胜任如此大的工作量.

## 执行栈

单线程的 `JavaScript` 只维护一个执行栈。执行栈的运行机制大致如下：

- 在脚本初次运行时会先在底部推入 `Global` ，即我们常说的 `Global Context(全局执行上下文)` ，这一 `context` 保存着全局变量对象，只有在整个程序运行完毕后才会从执行栈内弹出，此时程序运行结束.

- 当遇到函数时，会向执行栈中推入 `Function Context(函数执行上下文)`，并开始运行函数内的代码，函数内同样可以调用其他函数，这也同样是一个 `Function Context` 被推入的过程，直到函数 `return` 后，该`context` 弹出.
- 当遇到同步代码时，在代码的 `context` 下执行并**等待**直至执行完毕；
- 当遇到异步代码时，在代码的 `context` 下执行并将其**挂起**，同时继续执行后续代码，当异步事件执行完毕后，将其加入**对应**的**事件队列**；

![](/img/eventloop/The_Javascript_Runtime_Environment_Example.svg)

## Eventloop

上述提到的**事件队列**，就是实现 `Event Loop` 的关键。执行栈在运行完当前栈内的**全部任务**后，会到**事件队列**中去查找是否存在任务等待执行，如果存在，就会按照队列**先进先出**的特点按顺序执行队列中的事件，执行过程同样遵循上述原则。如此反复，就形成了一个循环(`Event Loop`)

可以注意到，事件队列被描述为**对应的**，这意味着不同事件有着自己的队列，队列执行之间自然就存在着优先级，而这些事件大致可以分为两类：宏任务(`macro task`)、微任务(`micro task`)；

### 宏任务

| Task                     | Broswer | Node |
| ------------------------ | :-----: | :--: |
| `I/O`                    |    ✅    |  ✅   |
| `setTimeOut`             |    ✅    |  ✅   |
| `setInterval`            |    ✅    |  ✅   |
| `setImmediate`           |    ❌    |  ✅   |
| `requestAnimationoFrame` |    ✅    |  ❌   |

### 微任务

| Task               | Broswer | Node |
| ------------------ | :-----: | :--: |
| `process.nextTick` |    ❌    |  ✅   |
| `Promise`          |    ✅    |  ✅   |
| `MutationObserver` |    ✅    |  ❌   |

### 优先级

`process.nextTick` > `Promise` > `setTimeout(fn)`、`setInterval(fn)` > `setImmediate` > `setTimeout(fn, time)`、`setInterval(fn, time)`.

{% note info %}
`PS:`因为 `setTimeOut`、`setInterval` 在没有设置 `time` 参数时，会在主线程最近获得的空闲时间时运行，即尽可能早的运行，因此优先级大于设置 `time` 参数时
{% endnote %}

### 简单例子

```javascript
setImmediate(() => {
  console.log(1);
}, 0);

setTimeout(() => {
  console.log(2);
}, 0);

new Promise(resolve => {
  console.log(3);
  resolve();
  console.log(4);
}).then(() => {
  console.log(5);
});

console.log(6);

process.nextTick(() => {
  console.log(7);
});

console.log(8);
```

简单画图分析一下，函数开始运行时：

![](/img/eventloop/example1-step1.png)

自顶向下运行后，会依次打印出 `3 4 6 8`，且 `setTimeout`, `setImmediate`, `nextTick`, `Promise` 队列发生变化(注：`Promise` 的构造函数是同步过程)，如下图所示：

![](/img/eventloop/example1-step2.png)

此时栈清空，全部同步任务完成，检查**事件队列**中是否存在异步事件，并按照优先级和队列特点依次执行(先检查微任务，再检查宏任务)。因此又会依次打印 `7 5 2 1`.

此例运行到这里已经结束了，但正常来说会执行完此轮异步任务后，会再检查一次，如果事件队列中存在异步任务(在此轮异步任务执行时被推入队列)，则会重复以上操作，直至事件队列中不再存在异步事件后才会继续执行.

## async/await

`async/await` 是 `Promise` 的语法糖，它使异步代码更易编写和阅读，因为使用了 `async/await` 后，代码读起来就像同步代码一般，十分容易理解。

### async

`async` 使函数返回一个 `Promise`，在调用函数时就能使用 `then` 链连接后续的操作

```javascript
const asyncFun = async () => {
    return 'something';
}
asyncFun().then(res => console.log(res))	//	=>	'something'
```

等价于：

```javascript
Promise.resolve('something').then(res => console.log(res))	//	=>	'something'
```

### await

`await` 关键字只能在 `async Function` 中使用。`async Function` 运行到有 `await` 标记的异步函数时，会暂停在此行代码上，直到该异步任务完成，才会执行后续代码，这就使得代码结构与同步代码一般。

```javascript
const promiseFunc = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('after 2s')
        }, 2 * 1000)
    })
}
const asyncFunc = async () => {
    const res = await promiseFunc();
    console.log(res);
}
asyncFunc()	//	2s后输出 after 2s
```

### 使用async/await的Eventloop

```javascript
const async1 = async () => {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

const async2 = async () => {
  console.log("async2");
}

console.log("script start");

setTimeout(() => {
  console.log("setTimeout");
}, 0);

async1();

new Promise(resolve => {
  console.log("promise1");
  resolve();
}).then(() => {
  console.log("promise2");
});

console.log("script end");

/** 
 * script start
 * async1 start
 * async2
 * promise1
 * script end
 * promise2
 * async1 end
 * setTimeout
*/
```

其中，`async1` 等价于

```javascript
const async1 = () => {
  return new Promise(resolve => {
    console.log("async1 start");
    Promise.resolve(async2()).then(() => {	//	async2也是一个返回promise的函数
      console.log("async1 end");
    });
    resolve()
  });
};
```

可以看到 `async/await` 确实减少了很多代码量.

{% note primary %}
  <div>
      参考：
      <p>
          <a href="https://zhuanlan.zhihu.com/p/33058983">https://zhuanlan.zhihu.com/p/33058983</a>
      </p>
      <p>
          <a href="https://juejin.im/post/5b73d7a6518825610072b42b#heading-9">https://juejin.im/post/5b73d7a6518825610072b42b#heading-9</a>
      </p>
      <p>
          <a href="https://developer.mozilla.org/zh-CN/docs/learn/JavaScript/%E5%BC%82%E6%AD%A5/Async_await">https://developer.mozilla.org/zh-CN/docs/learn/JavaScript/%E5%BC%82%E6%AD%A5/Async_await</a>
      </p>
  </div>    
{% endnote %}





