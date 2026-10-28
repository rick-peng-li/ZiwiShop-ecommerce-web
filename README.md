# ZiwiShop E-commerce Web

Git 仓库：<https://github.com/rick-peng-li/ZiwiShop-ecommerce-web>

ZiwiShop 是一套面向服装零售的全栈电商系统，包含面向顾客的购物商城和面向运营人员的后台管理面板。前端使用 React 18 + Vite 构建，后端基于 Node.js + Express，数据存储在 MongoDB，商品图片存放于 Cloudinary，支付接入 Stripe 与 PayPal。界面文案统一使用英文，代码结构按「前端 client / 后端 server」划分。

## 目录

- [功能概览](#功能概览)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [页面与模块](#页面与模块)
- [接口设计](#接口设计)
- [数据模型](#数据模型)
- [本地启动](#本地启动)
- [环境变量](#环境变量)
- [生产构建](#生产构建)

## 功能概览

- 顾客端：浏览首页推荐、按分类/品牌/尺码/价格筛选搜索、查看商品详情、选择尺码加入购物车、四步结算、在线支付或货到付款、查看订单历史与个人资料。
- 账号体系：邮箱注册与邮箱验证、密码登录、忘记/重置密码、Google OAuth、Facebook 登录；登录态由 Access Token + Refresh Token Cookie 维持，Access Token 过期后自动静默续期。
- 管理端：数据概览（用户数、库存、已支付订单、营收、近七日营收柱状图）、商品/分类/品牌/尺码的增删改查、订单查看与发货状态标记。
- 商品图片：前端支持最多 5 张图片上传，后端用 multer 接收、sharp 压缩为 webp 后上传 Cloudinary；删除商品或图片时同步清理云端资源。
- 权限控制：基于角色的访问控制（`USER` / `ADMIN`），后端中间件校验，前端路由按角色守卫。

## 技术架构

### 前端

| 方向 | 选型 |
| --- | --- |
| 框架 | React 18、Vite 4 |
| UI | MUI 5（Material UI）、Emotion |
| 路由 | React Router 6（懒加载 + 角色路由守卫） |
| 状态 | Redux Toolkit（购物车）、React Context（登录态/主题/分类） |
| 表单 | Formik + Yup |
| 请求 | Axios 实例 + 请求/响应拦截器（自动附带 Bearer Token、401 自动刷新） |
| 图表 | ApexCharts |
| 轮播 | Swiper |
| 支付 | `@stripe/react-stripe-js`、`@paypal/react-paypal-js` |

### 后端

| 方向 | 选型 |
| --- | --- |
| 运行时 | Node.js、Express 4 |
| 数据库 | MongoDB、Mongoose 6 |
| 认证 | JWT（Access Token 20 分钟、Refresh Token 7 天，httpOnly Cookie）、bcryptjs |
| 校验 | 自定义 validator 模块 |
| 文件 | multer（内存存储）、sharp（转 webp）、cloudinary |
| 邮件 | Nodemailer + Express Handlebars 模板 |
| 支付 | Stripe SDK、PayPal JS SDK |
| 第三方登录 | Google OAuth 2.0（直接调用 token/userinfo 接口，未使用 Passport）、Facebook Graph API |

请求链路：浏览器 → Axios（自动携带 Token）→ Express 路由 → 鉴权中间件 → 控制器 → Mongoose → MongoDB；图片类请求额外经过 multer/sharp/Cloudinary。

## 项目结构

```text
ZiwiShop-ecommerce-web/
├── client/                  # 前端
│   ├── src/
│   │   ├── api/             # 按业务域拆分的接口封装（auth/product/order...）
│   │   ├── app/             # Redux store 与 cart slice
│   │   ├── assets/          # 图片、图标、动画
│   │   ├── components/      # 通用组件与业务组件
│   │   ├── contexts/        # 登录态、主题、分类上下文
│   │   ├── hooks/           # 自定义 hooks
│   │   ├── layouts/         # 顶部导航、侧边栏、页脚
│   │   ├── pages/           # 页面（商城 + 后台）
│   │   ├── routes/          # 路由表与路由守卫
│   │   ├── theme/           # MUI 主题
│   │   └── utils/           # 格式化、分页、分类扁平化等工具
│   ├── index.html
│   └── vite.config.js
└── server/                  # 后端
    ├── config/              # 数据库连接
    ├── controllers/         # 业务控制器
    ├── middlewares/         # 鉴权、上传、图片压缩
    ├── models/              # Mongoose 模型
    ├── routes/              # REST 路由
    ├── utils/               # JWT、邮件、Cloudinary、分类树等
    ├── validator/           # 请求参数校验
    ├── views/               # 邮件模板（handlebars）
    ├── seed.js              # 演示数据初始化脚本
    └── server.js            # 应用入口
```

## 页面与模块

### 商城端

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/` | 首页 | 主视觉轮播、品牌轮播、服务介绍、精选商品列表、加入我们、页脚 |
| `/ZiwiShop/search` | 商品搜索 | 分类/品牌/尺码/价格区间筛选，按时间、价格、名称排序，分页；移动端筛选抽屉 |
| `/productDetails/:id` | 商品详情 | 图片展示、商品信息、尺码选择、加入购物车、同类商品推荐 |
| `/ZiwiShop/FAQ` | 常见问题 | 手风琴式问答 |
| `/signin`、`/signup` | 登录/注册 | 邮箱密码登录注册、Google/Facebook 第三方登录 |
| `/forgotpassword`、`/resetpassword` | 找回/重置密码 | 邮件链接重置密码 |
| `/emailverification` | 邮箱验证 | 通过激活 Token 完成验证并自动登录 |
| `/checkout` | 结算 | 四步流程：账单地址 → 联系方式 → 支付方式 → 确认订单 |
| `/order/:id` | 订单详情 | 地址、支付状态、商品明细、金额汇总；未支付时可按支付方式发起支付或删除订单 |
| `/OrderHistory` | 订单历史 | 当前用户订单列表，分页查看 |
| `/profile` | 个人中心 | 查看账号信息，修改昵称与头像地址 |

购物车以抽屉形式常驻，数据存放在 Redux 并持久化到 localStorage；支持增减数量、删除单项、查看小计并直接进入结算。

### 管理端

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/dashboard/overview` | 数据概览 | 用户数、库存总量、已支付订单数、总营收、近七日营收图表 |
| `/dashboard/products` | 商品列表 | 搜索、分页、编辑、删除 |
| `/dashboard/products/add`、`/edit/:id` | 商品编辑 | 名称、描述、价格、库存、分类、品牌、尺码、图片上传、精选/归档开关 |
| `/dashboard/categories` | 分类管理 | 树形分类（父分类/子分类）、新增、编辑、删除 |
| `/dashboard/brands` | 品牌管理 | 品牌增删改查 |
| `/dashboard/sizes` | 尺码管理 | 尺码名称与值增删改查 |
| `/dashboard/orders` | 订单管理 | 全量订单列表、查看详情、标记已发货 |

## 接口设计

统一前缀 `/api/v1`，返回 JSON。需要登录的接口在请求头携带 `Authorization: Bearer <accessToken>`；刷新令牌存放在 httpOnly Cookie 中，前端遇到 401 会自动调用刷新接口重放原请求。

### 认证 `/api/v1/auth`

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/signup` | 否 | 注册并发送验证邮件 |
| POST | `/emailverification?activationToken=` | 否 | 验证邮箱，返回 Access Token 并写入刷新 Cookie |
| POST | `/signin` | 否 | 邮箱密码登录 |
| GET | `/profile` | 是 | 获取当前用户资料 |
| PATCH | `/profile` | 是 | 修改昵称、头像，返回新的 Access Token |
| GET | `/refresh` | Cookie | 用刷新令牌换取新的 Access Token |
| POST | `/logout` | Cookie | 清除刷新 Cookie |
| GET | `/googleLogin?code=` | 否 | Google OAuth 回调 |
| POST | `/facebookLogin` | 否 | Facebook 登录 |
| POST | `/forgotpassword` | 否 | 发送重置密码邮件 |
| POST | `/resetpassword?resetPasswordToken=` | 否 | 重置密码并返回 Access Token |

### 商品 `/api/v1/product`

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/client/Products?page=` | 否 | 首页精选商品，每页 6 条 |
| GET | `/client/:id` | 否 | 商城商品详情 |
| GET | `/categories/client` | 否 | 商城分类树 |
| GET | `/ZiwiShop/search` | 否 | 搜索，支持 `query`、`category`、`brand`、`size`、`price`、`sort`、`page`，每页 9 条 |
| GET | `/relatedProducts/:id` | 否 | 同分类推荐商品 |
| GET | `/options` | ADMIN | 商品表单可选项（尺码、分类树、品牌） |
| GET | `/` | ADMIN | 后台商品列表 |
| GET | `/:id` | ADMIN | 后台商品详情 |
| POST | `/add` | ADMIN | 新建商品（multipart，最多 5 张图） |
| PATCH | `/:id` | ADMIN | 更新商品并追加图片 |
| PATCH | `/:id/image` | ADMIN | 删除单张图片并清理 Cloudinary |
| DELETE | `/:id` | ADMIN | 删除商品及其全部图片 |

### 分类 `/api/v1/category`、品牌 `/api/v1/brand`、尺码 `/api/v1/size`

三个模块均为管理员接口，结构一致：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/` | 列表 |
| GET | `/:id` | 详情 |
| POST | `/add` | 新增 |
| PATCH | `/:id` | 更新 |
| DELETE | `/:id` | 删除 |

分类额外提供 `GET /api/v1/category/categoryParents`，返回非叶子分类（可作为父分类的选项）。分类与品牌列表带 `href` 字段，可直接跳转搜索页。

### 订单 `/api/v1/order`

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/` | 是 | 创建订单 |
| GET | `/mine` | 是 | 当前用户订单 |
| GET | `/:id` | 是 | 订单详情 |
| PATCH | `/:id/pay` | 是 | 更新支付结果（`isPaid`、`paidAt`、`paymentResult`） |
| PATCH | `/:id/deliver` | ADMIN | 标记已发货 |
| DELETE | `/:id` | 是 | 删除订单 |
| GET | `/all` | ADMIN | 全部订单 |

### 支付 `/api/v1/payment`

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/stripeapikey` | 是 | 获取 Stripe 可发布 Key |
| POST | `/create-payment-intent` | 是 | 创建 Stripe PaymentIntent，返回 clientSecret |

PayPal 客户端 ID 通过 `GET /api/keys/paypal` 获取。

### 仪表盘 `/api/v1/dashboard`

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| GET | `/` | ADMIN | 用户数、库存总量、已支付订单数、总营收、近七日每日营收 |

## 数据模型

| 模型 | 关键字段 |
| --- | --- |
| `user` | name、email、password、image、role(`USER`/`ADMIN`)、verified、serviceProvider(`email`/`google`/`facebook`)、resetPasswordToken |
| `product` | name、description、price、category、sizes[]、images[]、countInStock、brand、isFeatured、isArchived |
| `category` | name、parentCategory（自关联，支持树形分类）、isLeaf |
| `brand` | name |
| `size` | name、value |
| `image` | url、cloudinary_id |
| `order` | orderItems[]、shippingAddress、paymentMethod、paymentResult、itemsPrice、shippingPrice、totalPrice、user、userEmail、userPhone、isPaid、paidAt、isDelivered、deliveredAt |

## 本地启动

### 前置条件

- Node.js 18+
- npm 9+
- Docker（用于运行 MongoDB），或本机已有的 MongoDB 服务

### 1. 启动 MongoDB

```bash
docker run -d --name ziwishop-mongo -p 27017:27017 -v ziwishop-mongo-data:/data/db mongo:7
```

如果已有 MongoDB，可跳过此步并直接使用现有连接串。

### 2. 启动后端

```bash
cd server
npm install
cp .env.example .env    # 按需填写密钥，本地演示可使用占位值
npm run seed             # 初始化演示数据与测试账号（会清空现有数据）
npm run dev              # 或 npm start
```

默认端口 `5000`。macOS 的 AirPlay 接收器会占用 5000，如遇端口冲突，把 `.env` 中的 `PORT` 改为 `5001`，并同步修改前端的 `VITE_API_URL`。

### 3. 启动前端

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

访问 <http://localhost:3000>。前端开发服务器只允许来自 `http://localhost:3000` 的跨域请求，若修改端口，需要同步更新 `server/utils/allowedOrigins.js`。

### 演示账号

| 角色 | 邮箱 | 密码 |
| --- | --- | --- |
| 管理员 | `admin@ziwishop.com` | `Admin123!` |
| 管理员（登录页提示的访客账号） | `ziwiShop@gmail.com` | `ziwiShop0000` |
| 顾客 | `user@ziwishop.com` | `User123!` |

执行 `npm run seed` 后即可直接登录。种子数据包含 5 个品牌、5 个尺码、2 个父分类及其 6 个子分类、9 件商品和 3 笔演示订单。

## 环境变量

### server/.env

```bash
PORT=5000
DATABASE=mongodb://127.0.0.1:27017/ziwishop
DATABASE_PASSWORD=

ACCESS_TOKEN_SECRET=
ACTIVATION_SECRET=
REFRESH_TOKEN_SECRET=
RESET_PASSWORD_SECRET=

FRONTEND_URL=http://localhost:3000
APP_NAME=ziwishop

CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_API_KEY=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=sandbox

Google_webClientId=
Google_secretId=
googleOauthRedirectUrl=http://localhost:5000/api/v1/auth/googleLogin

SMPT_HOST=smtp.gmail.com
SMPT_PORT=465
SMPT_SERVICE=gmail
SMPT_MAIL=
SMPT_PASSWORD=
```

说明：

- `DATABASE` 中的 `<password>` 会被 `DATABASE_PASSWORD` 替换，本地直连可不含占位符。
- Stripe 的 `STRIPE_SECRET_KEY` 必须存在（否则服务启动时 Stripe SDK 会报错），未配置真实密钥时仅影响在线支付，不影响浏览、下单（货到付款）等其他功能。
- Cloudinary 未配置时，上传商品图片会失败，可先用其他图片 URL 或仅在演示数据下浏览。
- 邮件相关变量未配置时，注册与找回密码的邮件发送会失败；本地演示可直接使用种子账号登录。

### client/.env

```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_OAUTH_REDIRECT_URL=http://localhost:5000/api/v1/auth/googleLogin
VITE_FACEBOOK_APP_ID=
```

## 生产构建

```bash
cd client && npm run build     # 产物输出到 client/dist
cd server && npm start         # 启动 API 服务
```

构建产物可交由 Nginx、Netlify 等静态服务托管，`client/netlify.toml` 已配置单页应用回退；后端需保证 `VITE_API_URL` 指向的地址可访问，并把该地址加入 CORS 白名单。

## License

MIT，详见 [LICENSE](./LICENSE)。
