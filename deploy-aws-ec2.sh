#!/bin/bash
# =============================================================================
# WAP Zero-Cost ($0.00) Automated EC2 Setup & Deployment Script
# =============================================================================
set -e

echo "🚀 Starting WAP Zero-Cost EC2 Deployment..."

# 1. Check and Configure 3GB Swap Memory for t2.micro / t3.micro (Prevents OOM)
if [ ! -f /swapfile ]; then
    echo "📦 Creating 3GB swap space on SSD..."
    sudo fallocate -l 3G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ 3GB Swap space created successfully."
else
    echo "✅ Swap file already exists."
fi

# 2. Update and Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker & Docker Compose..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io docker-compose-v2 git curl
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER"
    echo "✅ Docker installed successfully."
fi

# 3. Create .env if not present
if [ ! -f .env ]; then
    echo "⚙️ Creating .env configuration from template..."
    cp .env.example .env
fi

# 4. Fetch EC2 Public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me || echo "localhost")
echo "🌐 Detected Public IP: $PUBLIC_IP"

# 5. Launch Application via Docker Compose
echo "🚀 Building and launching WAP containers..."
sudo docker compose up -d --build

echo ""
echo "============================================================="
echo "🎉 WAP Deployment Complete!"
echo "🌐 Frontend URL:  http://$PUBLIC_IP"
echo "📖 Swagger Docs:  http://$PUBLIC_IP:8080/swagger-ui/index.html"
echo "============================================================="
