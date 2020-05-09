---
title: 环境配置记录
date: 2019-08-11 22:54:08
index_img: /img/enviroment-config/config.png
tags: [环境配置]
categories: [环境配置]
excerpt: 一些环境配置的记录
---

## 2019-8-11 更新

#### Git配置

###### 用户信息

```bash
# 配置用户名和邮箱
$ git config --global user.name "test"
$ git config --global user.email "test@test.com"
```

###### SSH

*此配置在  C:\Users\User\ 下进行*

```bash
## 生成ssh
$ ssh-keygen -t rsa -C "test@test.com"
# 不断回车后得到 id_rsa 和 id_rsa.pub
# 添加SSH到ssh-agent
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_rsa
```

进入 *C:\Users\User\ .ssh* ，复制 *id_rsa.pub* 的内容后，登录 Github

![](https://i.loli.net/2019/08/12/ciaStEl1efT3kHb.png)

![](https://i.loli.net/2019/08/12/5elwc2VOfDI6naH.png)

![](https://i.loli.net/2019/08/12/bRDJWBgEtaoY3dp.png)

![](https://i.loli.net/2019/08/12/SDMhdboigqw9458.png)

完成后测试：

```bash
$ ssh -T git@github.com
# 若出现 Are you sure you want to continue connecting (yes/no)? 输入 yes
```

![](https://i.loli.net/2019/08/12/EuiXwp6N738aBQ2.png)

自此完成。

------

