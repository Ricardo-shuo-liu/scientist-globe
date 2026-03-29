# Global Computer Scientist 3D Interactive Globe

---

[🌐 Switch to Chinese Version (切换到中文)](./README_zh.md)

---

<a name="english"></a>
## 🌍 English Version

This is a packaged 3D interactive frontend project as a standard Python library. You can now launch a fully functional, Emoji-interactive cyberpunk globe via simple command-line instructions.

### 🚀 Installation Guide

#### 1. Install from PyPI (Recommended)
You can install the library directly from PyPI with **one command** (no local files required):
```bash
pip install scientist-globe
```

#### 2. Local Installation (For Development)
Install from the project root directory:
```bash
pip install .
```

After installation, you will have a global command `scientist-globe`.

### ✨ Run Command

After installation, just one line of command to start the server and access:

```bash
# Start local server
scientist-globe --serve
```

You can also specify a custom port or address:

```bash
# Start with specified port
scientist-globe --serve --port 9000 --host 0.0.0.0
```

Access URL: 👉 **[http://localhost:8000](http://localhost:8000)**

### 📦 Project Structure (Package Layout)

The project has been refactored into a standard Python package structure (`src` layout) for easy integration and distribution:

```text
.
├── pyproject.toml             # Project metadata and Entry Points configuration
├── README.md                  # Run instructions
└── src/
    └── scientist_globe/       # Core package
        ├── app.py             # FastAPI application instance
        ├── cli.py             # CLI entry point (argparse implementation)
        └── static/            # Globe static frontend resources (HTML/JS/CSS)
```

### 🛠️ Tech Stack
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/)
- **Frontend**: [Three.js](https://threejs.org/) (3D Rendering)
- **Packaging**: [setuptools](https://setuptools.pypa.io/) (pyproject.toml)

### 👨‍🚀 About the Developer
- **Author**: Ricardo
- **Location**: Zhengzhou, Henan, China

---