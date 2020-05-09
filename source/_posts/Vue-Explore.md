---
title: Vue深入
date: 2019-08-17 22:51:13
index_img: /img/Vue-Explore/vue-logo.png
tags: [Vue]
categories: [Vue]
excerpt: Vue一些属性以及细节的深入
---

## 2019-08-17记录

#### watch属性深入

先放一段代码

```javascript
data: () => ({
    obj: {
        name: 'cucu6',
        age: 9999
    },
    example: ''
})
watch: {
    obj: {
        handler: 'handleObj',
        immediate: true, // false
        deep: true // false
    }
}
methods: {
    handleObj() {
        /* Do Something... */
    }
}
```

上面可以看到，watch属性中不像官网基础教程中给出的那样，只写了一个回调函数，而是有多个键值对，起不同作用。

- `handler`

  `handler`属性中存放回调函数，一旦侦听的值`obj`发生改变（被直接赋值），就会触发回调函数；

  需要注意的是，`handler`的值可以是一个函数（`function(newVal, oldVal)`)，也可以是写在`methods`中的方法名，但写成函数形式时应避免使用箭头函数，因为箭头函数绑定了父级作用域的上下文，逻辑上的`this`指针并不会像往常一样指向整个`Vue`实例，因此如果在函数里使用`this`指针时会导致出错，如在回调函数中写`this.example = 'whatever'`，这样是不可用的；

  此外，看官网中的`handler`也支持函数的数组，但没有尝试过，以后有时间看看。

- `immediate`

  `immediate`属性的值默认为`false`，当值为`true`时，在数据被绑定后会立即执行一次回调函数，即在组件渲染后会执行一次`handler`中的函数，这个应该没什么好讲的。

- `deep`

  `deep`属性据官网介绍：*回调会在任何被侦听的对象的 property 改变时被调用，不论其被嵌套多深*

  从表面上看，当我们改变`obj.name`的值时，`handler`的回调函数会被执行，其实不然，`watch`属性侦听对象是监听其引用的变化，也就是说，如果我们不对其进行直接赋值，`handler`是不会执行的；

  当`deep`的值为`true`时，如官网上所描述的，监听器会一层层往下遍历，当某一键值对改变时就会触发回调；

  当然，对每个属性进行监听的性能开销也会增大，此时可以使用`string`的形式进行侦听。

  ```javascript
  watch: {
  	'obj.name': {
  		handler: 'handleObj',
  		/* ... */
  	}
  }
  ```

  这样当`obj.name`发生改变时就会触发回调。

- `watch`侦听器的注销

  一般`watch`属性直接写在组件中，会随着组件的销毁而销毁侦听器；而根据 Google，有这样一个方法可以实现监听和销毁；

  ```javascript
  const watchDestructer = app.$watch(watchAttribute: string, callback: function(newVal, oldVal));
  watchDestructer(); // 销毁watch
  ```

  `app.$watch`的返回值是对应属性的注销方法，执行后就能注销侦听。

------

