/** 
 * 此文件在 ServiceWorkerGlobalScope 作用域下
 * this、self 是同一个 ServiceWorkerGlobalScope 类型对象
 */
var CACHE_NAME = 'my-first-cache-v1'
var urlsToCache = [
  'style.css'
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