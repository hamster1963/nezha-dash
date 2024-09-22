#!/bin/sh

# 如果 .env 文件不存在，则创建一个空的 .env 文件
if [ ! -f /app/.env ]; then
  touch /app/.env
fi

# 启动服务
exec "$@"
