FROM node:18.19.1-bullseye-slim

# 设置工作目录
WORKDIR /app

# 复制pnpm的相关文件到工作目录
COPY pnpm-lock.yaml pnpm-workspace.yaml ./


COPY packages/icon-service/package.json packages/icon-service/package.json

# 安装pnpm
RUN npm install -g pnpm --registry=https://registry.npmmirror.com

# 安装项目依赖
RUN pnpm install --registry=https://registry.npmmirror.com

COPY packages/icon-service packages/icon-service

RUN cd packages/icon-service && pnpm build

# 暴露端口，这应该是你的应用程序监听的端口
EXPOSE 4001

# 启动应用程序
CMD ["sh", "-c", "cd ./packages/icon-service && yarn start:prod"]
