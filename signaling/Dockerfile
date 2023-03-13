# 使用Node.js 14作为基础镜像
FROM node:14
# 设置工作目录
WORKDIR /app
# 将应用程序代码复制到容器中
COPY . .
# 安装pm2
RUN npm install pm2 -g

# 安装依赖
RUN npm install --production

# 启动应用程序
CMD ["pm2-runtime", "start", "ecosystem.config.js"]