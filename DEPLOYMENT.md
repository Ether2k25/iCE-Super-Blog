# ICE SUPER Blog - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - ICE SUPER Blog"

# Push to GitHub (create a new repository on GitHub first)
git remote add origin https://github.com/yourusername/ice-super-blog.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: ice-super-blog (or your preferred name)
# - Directory: ./
# - Override settings? N
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings (see below)

### 3. Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app
```

### 4. Important Notes

#### ⚠️ File Storage Limitation
Your current project uses file-based storage (`data/` directory). On Vercel:
- Files are **NOT persistent** between deployments
- Data will reset when you redeploy
- For production, consider migrating to a database

#### 🔧 Quick Fixes for Vercel
The project is configured to work on Vercel, but data will reset on each deployment.

#### 🗄️ Database Migration (Recommended for Production)
Consider migrating to:
- **Vercel Postgres** (easy integration)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **MongoDB Atlas**

## 🌐 After Deployment

1. **Update Site URL**: Replace `NEXT_PUBLIC_SITE_URL` with your actual Vercel domain
2. **Change Admin Password**: Login and change the default password immediately
3. **Test All Features**: Verify admin panel, blog posts, and customization work
4. **Custom Domain** (Optional): Add your custom domain in Vercel settings

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Remove any test data
- [ ] Verify all API endpoints work
- [ ] Test admin authentication

## 📝 Post-Deployment Tasks

1. **Content**: Add your blog posts through the admin panel
2. **Customization**: Configure site settings via Site Customization
3. **Media**: Upload images through Media Library
4. **SEO**: Update meta tags and site information

## 🆘 Troubleshooting

### Common Issues:
1. **Build Errors**: Check package.json dependencies
2. **Environment Variables**: Ensure all required env vars are set
3. **API Routes**: Verify all API endpoints return proper responses
4. **File Paths**: Ensure all imports use correct relative paths

### Support:
- Check Vercel deployment logs
- Verify environment variables
- Test locally first: `npm run build && npm start`

## 🔄 Redeployment

```bash
# For updates, simply push to main branch
git add .
git commit -m "Update content"
git push origin main

# Or use Vercel CLI
vercel --prod
```

---

**Note**: This deployment guide assumes file-based storage. For production use, consider migrating to a proper database solution.
