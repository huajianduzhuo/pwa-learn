# Service Worker

Service Worker 是一个运行在浏览器后台的线程，与网页不同的是，Service Worker 为那些无需页面和用户交互的功能开启了一扇大门。目前已经实现的功能包括 推送通知 和 后台同步。

## Service Worker 生命周期

Service Worker 的生命周期与我们的网页是完全分开的。

想要在网页中使用 Service Worker，需要在我们网页的 javascript 中注册它。注册一个 Service Worker，浏览器会在后台开始一个 Service Worker 的**安装步骤**。

代表性的，在安装 Service Worker 期间，我们会想要缓存一些静态资源。如果所有文件全部缓存成功，Service Worker 则为 **installed** 状态。如果任何一个文件加载并缓存失败，则安装步骤将会失败，Service Worker 则不会被激活。不过，如果文件加载失败，也无需担心，因为 Service Worker 会重新去尝试加载。

安装步骤成功之后，接下来便是**激活步骤**。激活步骤可以用来处理一些旧的版本的 Service Worker 中缓存的资源。

激活成功之后，serviceWorker 就可以控制页面了，但是只针对在成功注册了 Service Worker 后打开的页面。也就是说，页面打开时有没有 Service Worker，决定了接下来页面的生命周期内受不受 Service Worker 控制。所以，只有当页面刷新后，之前不受 Service Worker 控制的页面才有可能被控制起来。

一旦 Service Worker 控制了页面，它将会有两种状态：terminated（中止状态），可以节省内存，或者在网页发起请求时，处理 fetch 和 message 事件。

下面是一个简单版本的 Service Worker **第一次安装时**的生命周期图。

![image](http://ovqy85q1k.bkt.clouddn.com/sw-lifecycle.png)

## 使用 Service Worker 的先决条件

### 浏览器支持

Service Worker 目前已经被 chrome、firefox、opera 支持。Edge 浏览器已经表示了支持，safari 未来也会支持 Service Worker。

### 需要 HTTPS

开发阶段，可以在 `localhost` 和 `127.0.0.1` 中使用 Service Worker，但是部署之后，则必需使用 HTTPS。

使用 Service Worker 我们可以劫持连接，伪造并过滤响应。这个强大的功能容易被黑客恶意使用，为了防止这种情况，我们必须使用 HTTPS 来保证连接不被干扰。

> 可以使用 Github Pages 来调试我们的 demos。

## 注册一个 Service Worker

首先需要创建一个 Service Worker 线程的 js 文件（`/public/sw.js`）

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

我们可以没有负担的在每一次页面加载时调用 `register()`，浏览器会去查看当前网页是否已经注册过 Service Worker 线程并做出相应的处理。

需要注意 register 函数的第一个参数 `sw.js`，即 Service Worker 的 javascript 文件的位置。如果该文件位于项目的根目录，则 Service Worker 的作用域即为整个域名，换句话说，Service Worker 将会捕捉该域名下所有的 fetch 事件。如果 Service Worker 文件放在 `/example/sw.js`，则 Service Worker 仅捕捉 `/example/` URL 下的 fetch 事件。

register 函数的 `scope` 参数是可选的，用于指定想要 Service Worker 控制的内容的目录。如本例中，因为 `sw.js` 文件不是位于根目录，指定 scope 为 '/'，则可以让 Service Worker 捕捉整个页面的 fetch 事件。

## 安装一个 Service Worker

当页面已经成功注册了一个 Service Worker，我们就可以将注意力转移到 Service Worker 的 js 文件，在该文件中我们可以处理 `install` 事件。

最基本的例子，我们需要为 install 事件添加一个 callback，并确定需要缓存的文件。

```javascript
self.addEventListener('install', function(event) {
  // Perform install steps
})
```

在 install callback 中，我们需要遵从以下步骤：

* 打开一个 Cache
* 缓存文件
* 确认是否所有需要缓存的文件全部缓存成功

```javascript
var CACHE_NAME = 'my-first-cache-v1'
var urlsToCache = [
  '/style.css'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('opened cache')
        return cache.addAll(urlsToCache)
      })
  )
})
```

`event.waitUntil()` 方法接收一个 promise，并通过它知道安装消耗的时间，以及是否安装成功。

如果所有文件缓存成功，Service Worker 则为 installed。如果任何一个文件缓存失败，则 Service Worker 安装失败。

我们还可以在 install 事件中执行其他任务，或者避免把所有任务放在一个 install 事件中。

## 缓存和返回请求

Service Worker 安装成功，并且用户跳转到一个不同的页面或者刷新之后，Service Worker 将开始捕捉 fetch 事件。

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // cache 命中 - 返回response
        console.log('response', response)
        if (response) {
          return response
        }
        return fetch(event.request)
      })
  )
})
```

> 在 chrome 中测试发现，仅刷新页面缓存的文件没有从 cache 中获取，新打开一个页面可以看到 Service Worker 的 fetch 事件的效果。

如果你想要渐进式的缓存资源，可以通过处理 fetch request 的 response，将其添加进 cache。

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // cache 命中 - 返回response
        if (response) {
          return response
        }
        // cache 没命中，请求资源并且将响应添加进缓存
        // 因为 request 和 response 都是 stream，仅可以被使用一次，
        // 但是我们的浏览器页面和 cache 都要使用，所有需要复制一份
        var fetchRequest = event.request.clone()
        return fetch(fetchRequest).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            var responseToCache = response.clone()
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })
            
            return response
          }
        )
      })
  )
})
```

response 的 type 为 basic，说明请求的资源来自当前域名。上面的代码校验不等于 basic 直接返回，意为来自其他域名的资源不进行缓存。

## Service Worker 版本更新

更新 Service Worker 需要遵从以下步骤：

1. 更新 Service Worker javascript 文件。当用户打开我们的网站，浏览器会重新加载 Service Worker 的 js 文件，只要有改动，即会被视为新的。
2. 开启新的 Service Worker，并触发 `install` 事件。
3. 此时，旧的 Service Worker 仍然在控制当前页面，所以新的 Service Worker 将会进入 `waiting` 状态。
4. 所有已打开的页面关闭之后，旧的 Service Worker 自动停止，新的 Service Worker 会在重新打开的页面生效。
5. 一旦新的 Service Worker 生效，它的 `activate` 事件会被触发。

在 `activate` 事件回调里，一个共同的任务是 cache 管理。必须在 `activate` 事件清理旧版本的 Service Worker，而不是在 `install` 事件中清理的原因是，如果在 `install` 事件中清理，则包括正在控制当前页面的 Service Worker 在内的所有旧版本 Service Worker，都会被停止，使得当前页面没有可以使用的 Service Worker。

## 资料

英文：[https://developers.google.cn/web/fundamentals/primers/service-workers/](https://developers.google.cn/web/fundamentals/primers/service-workers/)

中文：[https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker](https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker)
