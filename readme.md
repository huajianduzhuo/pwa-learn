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

### 资料

英文：[https://developers.google.cn/web/fundamentals/primers/service-workers/](https://developers.google.cn/web/fundamentals/primers/service-workers/)

中文：[https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker](https://lavas.baidu.com/pwa/offline-and-cache-loading/service-worker/how-to-use-service-worker)