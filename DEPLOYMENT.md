# 🚀 Deployment Guide - ecard.vn

## 📋 Environment Files Structure

```
.env                  # Base environment (tracked in git - NO SECRETS!)
.env.local           # Local development (ignored by git)
.env.production      # Production environment (ignored by git)
```

## 🔧 Development Environment (Port 3000)

**API Calls:** `http://localhost:3000/api/*`

**Commands:**

```bash
# Start development server
npm run dev

# Runs at: http://localhost:3000
```

## 🌐 Production Environment (ecard.vn)

**API Calls:** `https://ecard.vn/api/*`

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub:**

```bash
git add .
git commit -m "Ready for production"
git push origin main
```

2. **Deploy on Vercel:**

   - Go to https://vercel.com
   - Import GitHub repository
   - Add Environment Variables from `.env.production`:
     ```
     NEXT_PUBLIC_API_URL=https://ecard.vn
     NEXT_PUBLIC_APP_URL=https://ecard.vn
     FIREBASE_PROJECT_ID=visit-cards-e33e3
     FIREBASE_PRIVATE_KEY=(paste full private key)
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@...
     JWT_SECRET=(your strong secret)
     ... (all other vars)
     ```

3. **Configure Custom Domain:**

   - In Vercel Dashboard → Settings → Domains
   - Add: `ecard.vn` and `www.ecard.vn`
   - Update DNS at your domain registrar:
     ```
     Type    Name    Value
     A       @       76.76.21.21
     CNAME   www     cname.vercel-dns.com
     ```

4. **Deploy:**
   - Vercel automatically builds and deploys
   - Access at: `https://ecard.vn`

### Option 2: Deploy to VPS

1. **Build on VPS:**

```bash
# SSH to your VPS
ssh user@your-vps-ip

# Clone repository
git clone https://github.com/huutien1904/card-visit.git
cd card-visit

# Install dependencies
npm install

# Copy and edit production env
cp .env.production .env.production.local
nano .env.production.local
# Update NEXT_PUBLIC_API_URL to https://ecard.vn

# Build for production
npm run build:prod

# Start with PM2
npm install -g pm2
pm2 start npm --name "ecard" -- run start:prod
pm2 startup
pm2 save
```

2. **Configure Nginx:**

```nginx
server {
    listen 80;
    server_name ecard.vn www.ecard.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. **Enable SSL:**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ecard.vn -d www.ecard.vn
```

4. **Configure DNS:**

```
Type    Name    Value
A       @       [Your VPS IP]
A       www     [Your VPS IP]
```

## 🔒 Security Checklist

- [ ] Change `JWT_SECRET` in `.env.production` to a strong random string
- [ ] Never commit `.env.production` to git
- [ ] Enable Firebase Security Rules
- [ ] Use environment variables in Vercel/VPS, not hardcoded
- [ ] Enable CORS only for your domain
- [ ] Set up rate limiting on API routes

## 📊 How API Calls Work

### Development (localhost:3000)

```javascript
// Client-side code
fetch("/api/cards"); // → http://localhost:3000/api/cards
```

### Production (ecard.vn)

```javascript
// Client-side code
fetch("/api/cards"); // → https://ecard.vn/api/cards
```

**Note:** Next.js automatically handles API routing. You don't need to specify full URLs for API calls within your app.

## 🧪 Testing Production Build Locally

```bash
# Build with production env
npm run build:prod

# Start production server
npm run start:prod

# Test at: http://localhost:3000
```

## 🔄 Continuous Deployment

### With Vercel:

- Push to `main` branch → Auto deploy to production
- Push to `develop` branch → Auto deploy to preview URL

### With VPS:

```bash
# Create deploy script
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /path/to/card-visit
git pull origin main
npm install
npm run build:prod
pm2 restart ecard
EOF

chmod +x deploy.sh
./deploy.sh
```

## 📝 Environment Variables Reference

| Variable              | Development             | Production               |
| --------------------- | ----------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | `https://ecard.vn`       |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://ecard.vn`       |
| Firebase Config       | Same for both           | Same for both            |
| `JWT_SECRET`          | Simple for testing      | **Strong random string** |

## 🆘 Troubleshooting

**Issue:** API calls return 404

- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify domain is pointing to correct server

**Issue:** Environment variables not working

- Restart dev server after changing .env files
- In Vercel, redeploy after updating env vars

**Issue:** Firebase authentication fails

- Verify Firebase config is correct
- Check Firebase project settings

## 📞 Support

For issues, contact: vnsky@123456
