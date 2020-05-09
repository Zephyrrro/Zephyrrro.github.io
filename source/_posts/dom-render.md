---
title: DOM Render
date: 2020-05-09 20:30:01
index_img: /img/dom-render/render-tree-construction.png
tags: [DOM, brower]
---

{% note  secondary %}

一道老生常谈的问题：从输入URL到页面展示，经历了哪些过程......

这里并不全部讨论，来关注一下最后一个过程：浏览器的渲染过程。

{% endnote %}

根据 [Google Web](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction) ，大致可以分为以下五个阶段：

- 根据 `HTML` 生成 `DOM Tree` (此时并不渲染到页面上)
- 根据 `CSS` 生成对应的 `CSSOM Tree` (与 `DOM Tree`上的结点一一对应)
- `DOM Tree` 和 `CSSOM Tree` 合成生成 `Render Tree` (不包括 `head`, `meta` 等不可见的结点)
- `Layout` 布局渲染
- `Paint` 绘制渲染

------

## DOM Tree

`DOM`，全称 `Document Object Model`，是一种对象模型，转化成树的过程为：`Bytes → Characters → Tokens → Nodes → DOM`.(具体可以跳👉[constructing-the-object-model](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/constructing-the-object-model) )

## CSSOM Tree

同样也是树的结构，同时生成的过程也是对浏览器默认样式的逐步替换。

## Render Tree

`DOM Tree` 和 `CSSOM Tree` 合并生成 `Render Tree` (渲染树)

![](/img/dom-render/render-tree-construction.png)

`DOM Tree` 从根节点开始遍历每个可见结点(DFS/BFS?)并合并对应 `CSSOM` 结点中的样式信息。这里的“可见”是指，如果在合并过程中，某个 `DOM` 结点对应的 `CSSOM` 结点被设置了 `display: none` 之类的属性，便会跳过该结点的合并；但 `opacity: 0`, `visible: hidden` 这种仍然会占据空间，因此依旧会被合并。(PS：这里就会牵涉到性能问题)

## Layout

根据样式信息计算各个结点在设备视区的确切位置以及大小，即 `布局`.

## Paint

将各个结点渲染到屏幕的过程。

![](/img/dom-render/render-progress.jpg)

------

我们常说的：尽量避免去操作 `DOM`，因为成本很高。这里的成本即指时间耗费，也指资源耗费。如果使用 `JS` 去操作 `DOM` 和 `CSS` 时，`DOM Tree` 和 `CSSOM Tree` 的内容就会发生变更，从而导致整个渲染过程重复执行，而其中影响最大的就是重新执行 `Layout` 过程时触发的 `reflow(回流)` 以及重新执行 `Paint` 时触发的 `repaint(重绘)`.

## reflow

当发生以下情形时会触发 `reflow` 回流：

- 初始渲染时
- `DOM Tree` 结构发生变化时
- `Render Tree` 结构发生变化时
- 浏览器 `resize` 时

从上面的过程来看，`Layout` 在 `Paint` 之前，因此每次触发 `reflow` 都会导致整个页面的重新渲染。

## repaint

当发生以下情形时会触发 `repaint` 重绘：

- 触发 `reflow` 时
- 结点的 `background-color`, `color`等不影响其周围和内部布局的属性改变时

应注意 `repaint` 可以单独触发，且只会影响到属性改变的结点，不会影响到其他结点。

{% note info %}

从上面的描述很容易发现， `reflow` 的成本远高于 `repaint`，从性能优化上看，应该尽量减少 `reflow` 次数，例如

- 先将需要多次修改的 `DOM` 设置为 `display: none`，待操作完毕后再显示。(修改不在 `Render Tree` 上的结点并不会触发 `reflow` 和 `repaint` )
- 使结点脱离文档流

{% endnote %}

## 实例

`display: none`, `visible: hidden`, `opacity: 0`的优劣、区别