# ☁️ 100% Zero-Cost ($0.00) AWS EC2 Deployment Guide for WAP

This guide provides an exact, step-by-step procedure to deploy the **Workforce Automation Portal (WAP)** on **AWS EC2 Free Tier** without incurring ANY surprise charges ($0.00 / completely free).

---

## 🛑 How We Keep This 100% Free ($0.00)

| Potential AWS Charge | How We Avoid It ($0.00 Cost) |
| :--- | :--- |
| **EC2 Instance Charges** | Use `t2.micro` (or `t3.micro` where available) — **750 hours/month free**. |
| **Elastic IP / Public IPv4 Charges** | **DO NOT allocate an Elastic IP.** Use the free auto-assigned Public IPv4 address included with the instance. |
| **Database (RDS) Charges** | **DO NOT create an AWS RDS instance.** Run MySQL 8.0 inside Docker on the EC2 instance for free. |
| **Load Balancer (ALB) Charges** | **DO NOT create an AWS Load Balancer.** Nginx runs inside Docker on port 80 as a built-in reverse proxy. |
| **EBS Storage Charges** | Allocate **20 GiB gp3** root volume (AWS gives **30 GiB free**). Keep default IOPS (3000) and throughput (125 MB/s). |
| **Out-Of-Memory (OOM) on 1GB RAM** | Enable **3 GB Linux Swap Memory** (using the free SSD storage) so Docker, Spring Boot, and MySQL run smoothly without crashing. |

---

## 🎯 Architecture Overview (All-in-One Free Container Stack)

```
  [ User Web Browser ]
         │
         ▼ (HTTP Port 80)
  [ AWS EC2 Public IPv4 Address ]
         │
  ┌──────▼─────────────────────────────────────────────────┐
  │ AWS EC2 (t2.micro / Ubuntu 24.04 LTS + 3GB Swap)       │
  │                                                        │
  │   [ Frontend Container :80 ] (Nginx + React SPA)       │
  │           │                                            │
  │           ▼ (Reverse Proxy /api)                       │
  │   [ Backend Container :8080 ] (Spring Boot 3 REST API) │
  │           │                                            │
  │           ▼ (Internal Network)                         │
  │   [ Database Container :3306 ] (MySQL 8.0)             │
  └────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Deployment

### Step 1: Launch the Free EC2 Instance

1. Log into [AWS Management Console](https://console.aws.amazon.com/ec2/).
2. Select your closest region (e.g. `ap-south-1` Mumbai, `us-east-1` N. Virginia, etc.).
3. Click **Launch Instance**:
   * **Name:** `WAP-Server`
   * **Application and OS Images:** **Ubuntu Server 24.04 LTS (HVM)**, SSD Volume Type (64-bit x86).
   * **Instance Type:** **`t2.micro`** *(Marked "Free tier eligible")*.
   * **Key pair (login):** Select **Create new key pair**:
     * Name: `wap-key`
     * Key pair type: **RSA**
     * Private key file format: **`.pem`**
     * Click **Create key pair** and save the downloaded `wap-key.pem` file.
   * **Network settings:** Click **Edit**:
     * **Auto-assign public IP:** **Enable** *(Crucial: do NOT use Elastic IPs)*.
     * **Firewall (Security Groups):** Create security group `wap-security-group` with these Inbound Rules:

| Rule Type | Protocol | Port | Source | Description |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `0.0.0.0/0` (or My IP) | Terminal access |
| **HTTP** | TCP | `80` | `0.0.0.0/0` (Anywhere) | Frontend web access & API proxy |
| **Custom TCP** | TCP | `8080` | `0.0.0.0/0` (Anywhere) | *(Optional)* Direct Swagger UI |

   * **Configure storage:** Change **8 GiB** to **20 GiB** `gp3` *(Leave IOPS and Throughput at default)*.
4. Click **Launch Instance**.
5. Go to EC2 Instances list, wait for Status = **Running**, and copy your **Public IPv4 address** (e.g. `13.233.54.120`).

---

### Step 2: Connect to Your EC2 Instance

Open PowerShell or Terminal in the folder where your `wap-key.pem` is saved:

```bash
# On macOS / Linux (set key permission):
chmod 400 wap-key.pem

# Connect to EC2 (replace with your actual EC2 Public IP):
ssh -i "wap-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

---

### Step 3: Configure 3GB Swap Memory (Prevents RAM Exhaustion)

Because `t2.micro` has 1GB RAM, create 3GB of swap virtual memory on your free 20GB SSD so Java & Docker build without freezing:

```bash
# Create 3GB swap file
sudo fallocate -l 3G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap is active (should show 3GB swap)
free -h
```

---

### Step 4: Install Docker & Git

Run these commands inside your EC2 terminal:

```bash
# Update Ubuntu package repository
sudo apt update && sudo apt upgrade -y

# Install Docker, Git, and utilities
sudo apt install -y docker.io docker-compose-v2 git curl

# Enable and start Docker service
sudo systemctl enable --now docker

# Add ubuntu user to docker group (avoids needing sudo for docker)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker
```

---

### Step 5: Transfer Code to EC2

#### Option A: Clone from GitHub (Recommended)
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/WAP.git
cd WAP
```

#### Option B: Copy Directly from your Local Machine
Open a new terminal on your Windows/Mac PC:
```powershell
scp -i "wap-key.pem" -r "D:\WAP" ubuntu@YOUR_EC2_PUBLIC_IP:~/WAP
```
Then in EC2 terminal:
```bash
cd ~/WAP
```

---

### Step 6: Create Production Environment Variables

Inside `~/WAP`:

```bash
cp .env.example .env
nano .env
```

Edit your `.env` settings:
```ini
# Database credentials
DB_PASSWORD=SecurePassword2026!
DB_USERNAME=root

# JWT Secret Key
JWT_SECRET=c2FrbW9kZXJuLXdvcmtmb3JjZS1hdXRvbWF0aW9uLXBvcnRhbC0yMDI2LXNlY3VyZS1rZXk=
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Set this to your EC2 Public IP
CORS_ALLOWED_ORIGINS=http://YOUR_EC2_PUBLIC_IP,http://localhost,http://localhost:80
```
*(Press `Ctrl + O` then `Enter` to save, and `Ctrl + X` to exit nano)*.

---

### Step 7: Build & Run the Application

Launch all services with a single command:

```bash
docker compose up -d --build
```

### Check Container Status:
```bash
docker compose ps
```
You should see:
- `wap-mysql` (Healthy)
- `wap-backend` (Healthy)
- `wap-frontend` (Running)

To view live backend logs:
```bash
docker compose logs -f backend
```

---

### Step 8: Access Your Live Application

Open your browser and navigate to:
* 🌐 **Frontend Application:** `http://YOUR_EC2_PUBLIC_IP`
* 📖 **Swagger API Docs:** `http://YOUR_EC2_PUBLIC_IP:8080/swagger-ui/index.html`

Log in with your existing admin credentials or register a new organization directly on the web page!

---

## 💡 Pro Tips for Zero Cost

1. **Do Not Attach Elastic IPs**: When you stop and start your EC2 instance, the public IP will change, but as long as it's running, the auto-assigned IP stays constant and costs **$0.00**.
2. **Delete Old Snapshots/Volumes**: In AWS Console → EC2 → **Volumes** & **Snapshots**, ensure you don't have unused detached volumes or snapshots left over from previous experiments.
3. **Set a Billing Alert ($0.01 threshold)**:
   - In AWS Console, search **AWS Budgets** → Click **Create Budget** → Choose **Zero Spend Budget** → Enter your email. If any charge occurs, AWS will immediately email you!
