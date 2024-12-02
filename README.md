<h1 align="center">download-start-dash </h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/package-json/v/CaoMeiYouRen/download-start-dash.svg" />
  <a href="https://hub.docker.com/r/caomeiyouren/download-start-dash" target="_blank">
    <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/caomeiyouren/download-start-dash">
  </a>
  <a href="https://github.com/CaoMeiYouRen/download-start-dash/actions?query=workflow%3ARelease" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CaoMeiYouRen/download-start-dash/release.yml?branch=master">
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-blue.svg" />
  <a href="https://github.com/CaoMeiYouRen/download-start-dash#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/download-start-dash/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/download-start-dash/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/CaoMeiYouRen/download-start-dash?color=yellow" />
  </a>
</p>


> 一个支持 http 调用 you-get/aria2/yutto/yt-dlp/youtube-dl 等多种下载器的工具。支持 nodejs/docker 等部署方式。
>
> 项目名称来自《START: DASH!!》

## 🏠 主页

[https://github.com/CaoMeiYouRen/download-start-dash#readme](https://github.com/CaoMeiYouRen/download-start-dash#readme)


## 📦 依赖要求


- node >=18

## 🚀 部署

### Docker 镜像

支持两种注册表：

- Docker Hub: [`caomeiyouren/download-start-dash`](https://hub.docker.com/r/caomeiyouren/download-start-dash)
- GitHub: [`ghcr.io/caomeiyouren/download-start-dash`](https://github.com/caomeiyouren/download-start-dash/pkgs/container/rsshub-never-die)

支持以下架构：

- `linux/amd64`
- `linux/arm64`

有以下几种 tags：

| Tag            | 描述     | 举例          |
| :------------- | :------- | :------------ |
| `latest`       | 最新     | `latest`      |
| `{YYYY-MM-DD}` | 特定日期 | `2024-06-07`  |
| `{sha-hash}`   | 特定提交 | `sha-0891338` |
| `{version}`    | 特定版本 | `1.2.3`       |

### Docker Compose 部署

下载 [docker-compose.yml](https://github.com/caomeiyouren/download-start-dash/blob/master/docker-compose.yml)

```sh
wget https://raw.githubusercontent.com/caomeiyouren/download-start-dash/refs/heads/master/docker-compose.yml
```

检查有无需要修改的配置

```sh
vim docker-compose.yml  # 也可以是你喜欢的编辑器
```
> 在 `docker-compose.yml` 文件中修改环境变量。

启动

```sh
docker-compose up -d
```

在浏览器中打开 `http://{Server IP}:3000` 即可查看结果

### Node.js 部署

确保本地已安装 Node.js 和 pnpm。

```sh
# 下载源码
git clone https://github.com/caomeiyouren/download-start-dash.git  --depth=1
cd rsshub-never-die
# 安装依赖
pnpm i --frozen-lockfile
# 构建项目
pnpm build
# 启动项目
pnpm start
```

在浏览器中打开 `http://{Server IP}:3000` 即可查看结果。

> 在 `.env` 文件中修改环境变量。

## 👨‍💻 使用

### 配置项

```ini
# 运行端口
PORT=3000

# 超时时间(ms)
TIMEOUT=600000

NODEJS_HELPERS=0
# 是否写入日志到文件
LOGFILES=false

# 日志级别
# LOG_LEVEL=http

# 最大请求体大小(字节)，默认 100MB
# MAX_BODY_SIZE=104857600

# 认证 token，Bearer 认证。公网部署时请务必设置。
AUTH_TOKEN=

# 数据路径
DATA_PATH='./data'

# 下载路径
DOWNLOAD_PATH='./data/download'

# Cookies 路径
COOKIES_PATH='./data/cookies'

# 基础 URL，用于生成下载链接
BASE_URL='http://localhost:3000'

# CookieCloud 地址，详见 https://github.com/easychen/CookieCloud
# 也可以使用 cookie-cloudflare，提供兼容 API，详见 https://github.com/CaoMeiYouRen/cookie-cloudflare
COOKIE_CLOUD_URL=
# CookieCloud 加密密码
COOKIE_CLOUD_PASSWORD=
# 代理 URL
PROXY_URL=

```

## 🛠️ 开发

```sh
npm run dev
```

## 🔧 编译

```sh
npm run build
```

## 🧪 测试

```sh
npm run test
```

## 🔍 Lint

```sh
npm run lint
```

## 💾 Commit

```sh
npm run commit
```


## 👤 作者


**CaoMeiYouRen**

* Website: [https://blog.cmyr.ltd/](https://blog.cmyr.ltd/)

* GitHub: [@CaoMeiYouRen](https://github.com/CaoMeiYouRen)


## 🤝 贡献

欢迎 贡献、提问或提出新功能！<br />如有问题请查看 [issues page](https://github.com/CaoMeiYouRen/download-start-dash/issues). <br/>贡献或提出新功能可以查看[contributing guide](https://github.com/CaoMeiYouRen/download-start-dash/blob/master/CONTRIBUTING.md).

## 💰 支持

如果觉得这个项目有用的话请给一颗⭐️，非常感谢

<a href="https://afdian.com/@CaoMeiYouRen">
  <img src="https://cdn.jsdelivr.net/gh/CaoMeiYouRen/image-hosting-01@master/images/202306192324870.png" width="312px" height="78px" alt="在爱发电支持我">
</a>

<a href="https://patreon.com/CaoMeiYouRen">
    <img src="https://cdn.jsdelivr.net/gh/CaoMeiYouRen/image-hosting-01@master/images/202306142054108.svg" width="312px" height="78px" alt="become a patreon"/>
</a>

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=CaoMeiYouRen/download-start-dash&type=Date)](https://star-history.com/#CaoMeiYouRen/download-start-dash&Date)

## 📝 License

Copyright © 2024 [CaoMeiYouRen](https://github.com/CaoMeiYouRen).<br />
This project is [MIT](https://github.com/CaoMeiYouRen/download-start-dash/blob/master/LICENSE) licensed.

## 🖥️ 参考项目

- [DIYgod/download-webhook](https://github.com/DIYgod/download-webhook)

***
_This README was generated with ❤️ by [cmyr-template-cli](https://github.com/CaoMeiYouRen/cmyr-template-cli)_
