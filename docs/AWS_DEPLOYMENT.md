# ☁️ Complete AWS Production Deployment Guide for WAP

This guide provides a comprehensive, step-by-step procedure to deploy the **Workforce Automation Portal (WAP)** to **Amazon Web Services (AWS)** using **AWS EC2 + Docker Compose + SSL/HTTPS**.

---

## 🎯 Architecture Overview (AWS EC2 + Docker Compose)

```
 [ User Browser ]
       │
       ▼  (HTTPS Port 443 / HTTP Port 80)
 [ AWS Elastic IP (Static Public IP) ]
       │
       ▼
 [ AWS EC2 Ubuntu Instance ]
  ┌────────────────────────────────────────────────────────┐
  │  Docker Compose Network (wap-net)                      │
  │                                                        │
  │   [ Frontend Container :80 ] (Nginx + React SPA)       │
  │           │ (Reverse proxy /api requests)              │
  │           ▼                                            │
  │   [ Backend Container :8080 ] (Spring Boot 3 REST API) │
  │           │                                            │
  │           ▼                                            │
  │   [ Database Container :3306 ] (MySQL 8.0 Persistent)  │
  └────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites
1. An active **AWS Account** ([aws.amazon.com](https://aws.amazon.com)).
2. An SSH Key Pair (created during EC2 setup).
3. *(Optional but recommended)*: A registered custom domain name (e.g. from Namecheap, GoDaddy, or AWS Route 53).

---

## Step 1: Launch an AWS EC2 Virtual Server

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Navigate to **EC2 Dashboard** → Click **Launch Instance**.
3. Configure the instance:
   * **Name:** `WAP-Production-Server`
   * **OS Image (AMI):** **Ubuntu Server 24.04 LTS (HVM)**, SSD Volume Type.
   * **Instance Type:**
     * **`t3.small`** (2 vCPU, 2 GB RAM) or **`t3.medium`** (Recommended for smooth Docker builds & JVM).
     * *(For AWS Free Tier: `t2.micro` or `t3.micro` with 2GB swap space enabled).*
   * **Key Pair:** Click **Create new key pair** → Name it `wap-ec2-key` → Select **RSA** + **.pem** format → Download and save the `.pem` file safely.

---

## Step 2: Configure AWS Security Group (Firewall)

In the **Network Settings** section of the launch wizard, configure these Inbound Rules:

| Type | Protocol | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | My IP *(or `0.0.0.0/0`)* | Secure terminal access |
| **HTTP** | TCP | `80` | `0.0.0.0/0` (Anywhere) | Web traffic & SSL challenge |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` (Anywhere) | Encrypted production web traffic |
| **Custom TCP** | TCP | `8080` | `0.0.0.0/0` *(Optional)* | Direct Swagger/Backend testing |

4. **Storage:** Set **20 GiB** (gp3 SSD) for Docker images and database volumes.
5. Click **Launch Instance**.

---

## Step 3: Allocate a Static Elastic IP (Recommended)

An Elastic IP ensures your server IP doesn't change when restarting the instance:

1. In EC2 Console, go to **Network & Security** → **Elastic IPs**.
2. Click **Allocate Elastic IP address** → **Allocate**.
3. Select the allocated IP → Click **Actions** → **Associate Elastic IP address**.
4. Choose your `WAP-Production-Server` instance and click **Associate**.

---

## Step 4: Connect to Your EC2 Instance via SSH

Open PowerShell (Windows) or Terminal (macOS/Linux) in the folder where your `.pem` key is saved:

```bash
# Set secure file permissions (Linux/macOS)
chmod 400 wap-ec2-key.pem

# Connect to EC2 (replace with your Elastic IP)
ssh -i "wap-ec2-key.pem" ubuntu@YOUR_ELASTIC_IP
```

---

## Step 5: Install Docker & Docker Compose on Ubuntu

Run these commands inside your EC2 terminal:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential tools and prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release git

# 3. Add Docker official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine and Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Allow ubuntu user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# 7. Verify Docker installation
docker --version
docker compose version
```

---

## Step 6: Deploy WAP Code to EC2

### Option A: Clone from Git Repository
```bash
cd ~
git clone https://github.com/your-username/WAP.git
cd WAP
```

### Option B: Copy Files Directly via SCP from your PC
```powershell
# Run from your local machine terminal:
scp -i "wap-ec2-key.pem" -r D:\WAP ubuntu@YOUR_ELASTIC_IP:~/WAP
```

---

## Step 7: Configure Production Environment Variables

Inside the `~/WAP` directory on your EC2 instance:

```bash
# Create production .env file
cp .env.example .env
nano .env
```

Update with strong production credentials:
```ini
# Production Database Credentials
DB_PASSWORD=YourSuperStrongProductionDBPassword2026!
DB_USERNAME=root

# Security & JWT (256-bit secret key)
JWT_SECRET=c2FrbW9kZXJuLXdvcmtmb3JjZS1hdXRvbWF0aW9uLXBvcnRhbC0yMDI2LXNlY3VyZS1rZXk=
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=http://YOUR_ELASTIC_IP,https://YOUR_DOMAIN.com

# Rate Limiting (10-20 requests/minute/IP)
AUTH_RATE_LIMIT=15

# SMTP Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=notifications@yourdomain.com
MAIL_PASSWORD=your_gmail_app_password
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit nano)*.

---

## Step 8: Build & Launch with Docker Compose

Run the single production command:

```bash
cd ~/WAP
docker compose up -d --build
```

### Check Container Health Status:
```bash
docker compose ps
docker compose logs -f
```

---

## Step 9: Verify Your Deployment

Open your browser and navigate to:
* 🌐 **Frontend Application:** `http://YOUR_ELASTIC_IP`
* 📖 **Swagger / OpenAPI Documentation:** `http://YOUR_ELASTIC_IP:8080/swagger-ui.html`
* 🔌 **Backend Health Check:** `http://YOUR_ELASTIC_IP:8080/v3/api-docs`

---

## Step 10: (Optional) Set up Free SSL / HTTPS with Let's Encrypt

If you have a domain pointing to your Elastic IP (e.g. `workforce.yourdomain.com`):

1. Install Certbot:
   ```bash
   sudo apt install -y certbot
   ```
2. Generate SSL Certificate:
   ```bash
   sudo certbot certonly --standalone -d workforce.yourdomain.com
   ```
3. Mount the certificates into your Nginx frontend container inside `docker-compose.yml` for automatic HTTPS!

---

## 🛠️ Useful Management & Maintenance Commands

| Task | Command |
| :--- | :--- |
| **View Live Container Logs** | `docker compose logs -f` |
| **Restart Backend Only** | `docker compose restart backend` |
| **Stop All Services** | `docker compose down` |
| **Update Code & Rebuild** | `git pull && docker compose up -d --build` |
| **Database Backup** | `docker exec wap-mysql mysqldump -u root -p$DB_PASSWORD wap_db > backup_$(date +%F).sql` |
| **Database Restore** | `docker exec -i wap-mysql mysql -u root -p$DB_PASSWORD wap_db < backup.sql` |
