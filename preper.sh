# 系统基础准备
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip build-essential

# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# 重载环境变量
source ~/.bashrc

# 安装node
nvm install --lts  # 安装最新 LTS 版本
nvm use --lts

# 安装nrm
npm install -g nrm
# 列出可用镜像
nrm ls
# 使用淘宝镜像（国内推荐）
nrm use taobao

# 安装pnpm
# 启用 corepack
corepack enable
# 安装最新 pnpm
corepack prepare pnpm@latest --activate
# 验证
pnpm -v

# 创建项目
pnpm create next-app@latest my-heroui-app
# 根据提示选择配置（推荐 TypeScript + Tailwind CSS）
cd my-heroui-app

# 安装heroui
pnpm add @heroui/react framer-motion @heroicons/react