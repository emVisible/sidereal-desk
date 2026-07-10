# Sidereal Desk 宣传页

这是一个纯前端的产品宣传页，可直接部署到 Vercel。

## 文件结构

```
public/landing/
├── index.html           # 宣传页主页面
├── app-screenshot.png   # 应用截图（需要放入）
└── README.md            # 本文件
```

## 如何放置应用截图

1. 将你运行应用后的截图（本质为恒星时钟显示界面）保存为 `app-screenshot.png`
2. 放入 `public/landing/` 目录
3. 宣传页会自动加载并显示

## 部署到 Vercel

1. 推送项目到 GitHub
2. 登录 Vercel
3. 新建项目并选择该仓库
4. 设置：
   - Output Directory: `public/landing`
   - Build Command: `npm run build` (实际不需要，仅为静态)
5. 部署完成

## 说明

- 宣传页使用现代深色主题，与应用风格相符
- 采用优雅的铜金色调（#d7c59f、#e8d9a8）
- Instrument Serif 字体用于标题，DM Sans 用于正文
- 完全纯前端，无需后端构建
