import argparse
import uvicorn
import sys

def main():
    parser = argparse.ArgumentParser(description="全球计算机科学家 3D 互动地球仪服务")
    parser.add_argument("--serve", action="store_true", help="启动本地服务器并访问地图")
    parser.add_argument("--port", type=int, default=8000, help="服务器运行端口 (默认: 8000)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="服务器监听地址 (默认: 127.0.0.1)")
    parser.add_argument("--reload", action="store_true", help="开启热重载 (开发模式使用)")

    args = parser.parse_args()

    if args.serve:
        print(f"🚀 正在启动 3D 互动地球仪...")
        print(f"🔗 请访问: http://{args.host}:{args.port}")
        
        # 启动 uvicorn
        # 这里的路径格式为 '包名.文件名:app'
        uvicorn.run(
            "scientist_globe.app:app", 
            host=args.host, 
            port=args.port, 
            reload=args.reload
        )
    else:
        parser.print_help()
        sys.exit(0)

if __name__ == "__main__":
    main()
