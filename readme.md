# PWA 学习笔记

[Progressive Web App Checklist](https://developers.google.cn/web/progressive-web-apps/checklist)

## serviceWorker

### 创建一个 serviceWorker

创建一个 serviceWorker

首先需要创建一个 serviceWorker 线程的 js 文件（`/public/sw.js`）

页面添加下面的代码

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {
        scope: '/'
      })
      .then(function (registration) {
        // 注册成功
        console.log('ServiceWorker registration successful with scope: ', registration.scope)
      })
      .catch(function (err) {
        // 注册失败:(
        console.log('ServiceWorker registration failed: ', err)
      })
  })
}
```

在浏览器中打开页面，查看 application --> service wrokers，就可以看到当前 serviceWorker

- 查看上面 then 方法的参数 `registration`，是一个 [ServiceWorkerRegistration](https://developer.mozilla.org/zh-CN/docs/Web/API/ServiceWorkerRegistration) 类型的对象

- 在 `sw.js` 中查看 `this`，是一个 [ServiceWorkerGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope) 类型的对象

### serviceWorker 使用步骤

- 首先我们需要在页面的 JavaScript 主线程中使用 serviceWorkerContainer.register() 来注册 Service Worker ，在注册的过程中，浏览器会在后台启动尝试 Service Worker 的安装步骤。

- 如果注册成功，Service Worker 在 ServiceWorkerGlobalScope 环境中运行； 这是一个特殊的 worker context，与主脚本的运行线程相独立，同时也没有访问 DOM 的能力。

- 后台开始安装步骤， 通常在安装的过程中需要缓存一些静态资源。如果所有的资源成功缓存则安装成功，如果有任何静态资源缓存失败则安装失败，在这里失败的不要紧，会自动继续安装直到安装成功，如果安装不成功无法进行下一步 — 激活 Service Worker。

- 开始激活 Service Worker，必须要在 Service Worker 安装成功之后，才能开始激活步骤，当 Service Worker 安装完成后，会接收到一个激活事件（activate event）。激活事件的处理函数中，主要操作是清理旧版本的 Service Worker 脚本中使用资源。

- 激活成功后 Service Worker 可以控制页面了，但是只针对在成功注册了 Service Worker 后打开的页面。也就是说，页面打开时有没有 Service Worker，决定了接下来页面的生命周期内受不受 Service Worker 控制。所以，只有当页面刷新后，之前不受 Service Worker 控制的页面才有可能被控制起来。

### 资料

英文：[https://developers.google.cn/web/fundamentals/primers/service-workers/](https://developers.google.cn/web/fundamentals/primers/service-workers/)

中文：[https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker](https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker)
