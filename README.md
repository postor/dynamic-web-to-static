# dynamic-web-to-static

从动态网站生成静态内容 | generate static site from dynamic

quick glance: https://www.youtube.com/watch?v=mTlFHIxuEVo&list=PLM1v95K5B1ntVsYvNJIxgRPppngrO_X4s

## usage | 使用方法

```
# 安装依赖 | install packages
yarn 

# 编译 typescript | build ts to js
yarn build

# 生成静态内容 | generate static
node build/start.js -u http://soft.antutu.com

# 启动静态服务 | serve static
http-server ./generated
```

## 又一个爬虫 | yet another static crawler

1. puppeteer is more a browser than just crawler, js and css may load resources

2. with `headless:false` and longer wait time, you can interact with page, which may and find hidden resource, then refine the logic

3. with `devtools:true` you can see network status

4. with typescript, better hint, easier to customize
