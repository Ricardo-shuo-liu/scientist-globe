# 全球计算机科学家 3D 互动地球仪

---
[🌐 Switch to English Version](./README.md)
---

<a name="chinese"></a>
## 🌍 中文版本

这是一个已打包为标准 Python 库的 3D 交互式前端项目。你现在可以通过简单的命令行指令，启动一个功能完整、支持 Emoji 交互的赛博朋克风格地球仪。

### 🚀 安装指南

#### 1. 从 PyPI 安装（推荐）
直接通过 pip 在线安装，无需下载源码：
```bash
pip install scientist-globe
```

#### 2. 本地安装（开发模式）
在项目根目录下执行：
```bash
pip install .
```

安装完成后，你将获得一个全局命令 `scientist-globe`。

### ✨ 运行命令

安装完成后，只需一行命令即可启动服务并访问：

```bash
# 启动本地服务
scientist-globe --serve
```

你也可以指定自定义端口或监听地址：

```bash
# 指定端口启动
scientist-globe --serve --port 9000 --host 0.0.0.0
```

访问地址：👉 **[http://localhost:8000](http://localhost:8000)**

### 📦 项目结构（包结构）

本项目已重构为标准 Python 包结构（`src` 布局），便于集成与分发：

```text
.
├── pyproject.toml             # 项目元信息与命令入口配置
├── README.md                  # 运行说明文档
└── src/
    └── scientist_globe/       # 核心包
        ├── app.py             # FastAPI 应用实例
        ├── cli.py             # 命令行入口（基于 argparse）
        └── static/            # 地球仪前端静态资源（HTML/JS/CSS）
```

### 🛠️ 技术栈
- **后端**：[FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- **前端**：[Three.js](https://threejs.org/)（3D 渲染）
- **打包**：[setuptools](https://setuptools.pypa.io/)（pyproject.toml）

### 👨‍🚀 关于开发者
- **作者**：Ricardo
- **地区**：中国·河南·郑州