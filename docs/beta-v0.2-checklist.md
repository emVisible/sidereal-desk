# Sidereal Desk v0.2 Beta 验收清单

用于发布 **v0.3.0-beta** 前的手动验收。每项应可独立复现。

## 环境

- [ ] `pnpm install && pnpm build` 成功
- [ ] `pnpm tauri:build` 成功（Windows）
- [ ] `node scripts/verify-lst.mjs` 输出 LST，与 Stellarium 对比误差 < 1 分钟

## 1. 5 秒理解 LST

- [ ] 以 **Minimal** 模式启动（或切换至 Minimal）
- [ ] 钟面旁图例可见：蓝针 = LST、金点 = 民用时、金弧 = 日照
- [ ] 首次进入 Minimal 显示 3 秒操作提示
- [ ] 新用户无需教程即可识别「这是恒星时」

## 2. 不挡工作

- [ ] Minimal 窗口约 300×300，可贴角放置
- [ ] 透明底，仅钟面与必要 UI 可见
- [ ] 设置中可关闭「始终置顶」
- [ ] 拖动顶栏可 reposition

## 3. 暮光可感知

在设置中固定观测地，用时间控制或滚轮 scrub 经过以下相位，截图对比面板色调：

- [ ] `day` — 暖金 accent
- [ ] `civil` — 暮光橙
- [ ] `nautical` — 蓝灰
- [ ] `astronomical` — 深靛
- [ ] `night` — 深夜蓝黑

## 4. LST 精度

- [ ] 选定经纬度（如北京 39.9°N 116.4°E）
- [ ] 记录当前 UTC 时刻
- [ ] 运行 `node scripts/verify-lst.mjs 39.9 116.4 <ISO-UTC>`
- [ ] Stellarium 同地点同时刻 LST 与脚本输出差 < 1 min

## 5. 桌面常驻（Widget Ready）

- [ ] 关闭窗口 → 应用隐藏到托盘，**不退出**
- [ ] 托盘左键 → toggle 显示/隐藏
- [ ] 托盘右键 → 设置 / 退出（中英文随 UI 语言）
- [ ] 重启后 **已保存位置** 优先于 IP 定位
- [ ] 海拔 elevation 修改后重启仍保留
- [ ] `displayMode`（Full / Compact / Minimal）重启后保留

## 6. 时间探索（Time Lab）

- [ ] 滚轮 scrub 显示偏移量（如 `+2h 15m`）与模拟日期
- [ ] scrub 后继续以所选速度播放（不永久冻结）
- [ ] 设置或顶栏：速度 1× / 1h/s / 1d/s、暂停、±15min / ±1h
- [ ] 双击钟面或 ⟲ 重置到现在
- [ ] 快捷键：`Esc` 关设置、`Space` 暂停、`R` 重置、`←/→` ±15min、`M` 切换布局

## 7. 安全与打包

- [ ] CSP 已配置（`tauri.conf.json`），无内联脚本注入
- [ ] capabilities 声明 `get_location` / `set_location` / `update_tray_locale`
- [ ] IP 定位使用 HTTPS（`ipapi.co`）
- [ ] 安装包可启动，托盘与钟面正常
