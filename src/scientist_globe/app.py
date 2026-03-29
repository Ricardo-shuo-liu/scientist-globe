from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path

app = FastAPI(title="全球计算机科学家 3D 地球仪后端")

# 获取当前文件所在目录的 static 子目录
# 使用 Path 确保跨平台兼容性
BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"

# 挂载静态文件目录 (HTML/JS/CSS)
if STATIC_DIR.exists():
    # 挂载整个 static 目录到 /static，或者为了保持路径简洁，挂载子目录
    app.mount("/js", StaticFiles(directory=str(STATIC_DIR / "js")), name="js")
    app.mount("/css", StaticFiles(directory=str(STATIC_DIR / "css")), name="css")
    # 如果有图片或其他资源，也可以直接挂载根目录
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/")
async def read_index():
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"error": "Index file not found in package static directory"}
