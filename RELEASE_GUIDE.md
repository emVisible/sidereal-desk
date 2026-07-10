# GitHub Release 发布指南

## 已生成的文件

项目已成功构建，生成了以下可供下载的文件：

```
src-tauri/target/release/bundle/
├── nsis/
│   └── Sidereal Desk_0.3.0_x64-setup.exe   (3.0 MB)
└── msi/
    └── Sidereal Desk_0.3.0_x64_en-US.msi   (4.3 MB)
```

## 上传到 GitHub Release

### 方式 1：网页界面（推荐）

1. 访问 GitHub 仓库：https://github.com/emVisible/sidereal-desk
2. 点击右侧 **Releases** 或访问 `/releases/new`
3. 填写信息：
   - **Tag version**: `v0.3.0`
   - **Release title**: `Sidereal Desk v0.3.0`
   - **Description**: 版本说明（如新增功能、修复等）
4. 上传文件：
   - 拖拽或点击 **Attach binaries** 上传：
     - `Sidereal Desk_0.3.0_x64-setup.exe`
     - `Sidereal Desk_0.3.0_x64_en-US.msi`
5. 点击 **Publish release**

### 方式 2：命令行（GitHub CLI）

```bash
# 安装 gh CLI (如已安装可跳过)
# https://cli.github.com/

# 创建 release 草稿
gh release create v0.3.0 \
  -t "Sidereal Desk v0.3.0" \
  -d

# 上传文件
gh release upload v0.3.0 \
  'src-tauri/target/release/bundle/nsis/Sidereal Desk_0.3.0_x64-setup.exe' \
  'src-tauri/target/release/bundle/msi/Sidereal Desk_0.3.0_x64_en-US.msi'

# 发布
gh release edit v0.3.0 --draft=false
```

## 版本说明模板

```markdown
## 新增功能
- 更新图标风格
- 双语宣传页上线
- 界面优化

## 修复
- 修复特定场景下的显示问题

## 下载
- **Windows NSIS 安装程序**: `Sidereal Desk_0.3.0_x64-setup.exe`
- **Windows MSI 安装程序**: `Sidereal Desk_0.3.0_x64_en-US.msi`

系统要求: Windows 10+

## 感谢
感谢所有贡献者和用户的支持！
```

## 发布后

- Release 页面用户可直接下载两种安装程序
- 可在宣传页或应用内添加"下载"按钮，链接到：
  - https://github.com/emVisible/sidereal-desk/releases/latest
  - 或直接链接到具体文件

## 自动化发布（可选）

可配置 GitHub Actions，在 tag 推送时自动构建和发布。
详见: https://tauri.app/docs/distribution/sign-windows/
