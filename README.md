# EMS 代收邮政关税项目 Mock 页面

这是一个基于 Vue 3 + Element Plus + Vite 的前端 Mock 页面，用于演示邮政包裹查询、关税费用计算和支付流程。

## 功能特性

### 1. 包裹查询页面
- 支持 EMS 国际件和 e 邮宝/挂号小包单号格式验证
- 目的地城市模糊搜索
- 光标自动聚焦到跟踪号输入框
- 提供示例单号快速填充

### 2. 包裹详情页面
- 展示包裹完整信息（始发城市、目的城市、重量、体积等）
- 显示商品信息（名称、HS 编码、金额）
- 关税费用展示（Mock 数据为 $0.10）
- 支持返回和继续支付操作

### 3. 支付页面
- 个人信息录入（姓名、邮箱）
- 账单地址填写
- 银行卡信息输入（支持 Luhn 算法校验）
- 有效期和 CVV 验证
- 模拟支付处理和结果反馈

## 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **Element Plus**: Vue 3 UI 组件库
- **Vue Router**: 官方路由管理器
- **Pinia**: 状态管理
- **Vite**: 下一代前端构建工具

## 设计规范

本项目遵循 [Item Design System](https://design.item.com) 的设计规范：

### 颜色系统
- **主色调**: Purple (#753BBD) - 用于主要按钮、链接和强调元素
- **成功色**: Green (#15803D) - 用于成功状态和提示
- **警告色**: Orange (#e79f04) - 用于警告提示
- **危险色**: Red (#F0283C) - 用于错误和删除操作
- **信息色**: Gray (#666666) - 用于一般信息提示

### 字体规范
- **字体家族**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial
- **字号系统**: 12px(xs) - 30px(3xl) 的完整字号体系
- **行高**: 1.25(紧凑)、1.5(正常)、1.75(宽松)

### 间距系统
- 4px、8px、16px、24px、32px、48px 的 8 倍数间距体系

### 圆角规范
- 小(6px)、中(8px)、大(12px)、超大(16px)

### 阴影系统
- 4 个层级的阴影效果，提供层次感

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动并自动打开浏览器。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 测试数据

系统内置了以下测试单号：

1. **EA12345678901CN** - EMS 国际件（洛杉矶）
2. **EC98765432109CN** - EMS 国际件（纽约）
3. **LV123456789CN** - e 邮宝小包（芝加哥）

目的地城市可以选择：Los Angeles, New York, Chicago, Houston, San Francisco, Seattle, Boston, Miami

## 单号格式规则

### EMS 国际件
- 格式：`EA/EC/EE` + 11位数字 + `CN`
- 示例：EA12345678901CN

### e 邮宝/挂号小包
- 格式：`LV/LX/RV/RX` + 9位数字 + `CN`
- 示例：LV123456789CN

## 支付信息验证

### 邮箱验证
- 必须包含 @ 符号
- 符合标准邮箱格式

### 银行卡验证
- 支持 13-19 位卡号
- 使用 Luhn 算法校验
- 自动格式化（每4位加空格）

### 有效期验证
- 格式：MM/YY
- 月份范围：01-12
- 不能是过期日期

### CVV 验证
- 3-4 位数字

## 项目结构

```
ems/
├── src/
│   ├── views/              # 页面组件
│   │   ├── PackageSearch.vue   # 包裹查询
│   │   ├── PackageInfo.vue     # 包裹详情
│   │   └── Payment.vue         # 支付页面
│   ├── stores/             # 状态管理
│   │   └── package.js      # 包裹数据 store
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── styles/             # 样式系统
│   │   └── variables.css   # 设计变量（Item Design System）
│   ├── App.vue             # 根组件
│   └── main.js             # 应用入口
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 注意事项

1. 这是一个 **Mock 页面**，所有数据都是模拟的
2. 关税费用固定为 $0.10（演示用）
3. 支付成功率为 90%（模拟真实场景）
4. 邮件发送功能未实现（仅在文档中说明）

## 后续开发计划

根据 Wiki 需求文档，以下功能标记为"本期不做要求"：

- [ ] 支付结果账单生成（面向邮政）
- [ ] 账单回传 EMS
- [ ] 支付关税费用到美国海关

待补充的接口：

- [ ] 邮政包裹查询接口
- [ ] 关税计费规则/接口
- [ ] 费用支付接口（BNP）
- [ ] 邮件推送服务

## 许可证

MIT

