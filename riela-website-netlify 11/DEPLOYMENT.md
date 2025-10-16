# Riela Website - Netlify Deployment Guide

## 🚀 Quick Deploy to Netlify

### Option 1: Drag & Drop (Easiest)
1. **Zip the project folder** (excluding `node_modules`)
2. **Go to [Netlify](https://netlify.com)**
3. **Drag and drop** the zip file to the deploy area
4. **Set environment variables** (see below)
5. **Deploy!**

### Option 2: Git Integration
1. **Push to GitHub/GitLab**
2. **Connect repository** to Netlify
3. **Set build settings**:
   - Build command: `echo 'Static site - no build needed'`
   - Publish directory: `public`
4. **Set environment variables**
5. **Deploy!**

## 🔧 Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```
MOMENCE_CLIENT_ID=your_client_id_here
MOMENCE_CLIENT_SECRET=your_client_secret_here
MOMENCE_HOST_ID=your_host_id_here
ALLOWED_ORIGIN=https://your-site-name.netlify.app
```

## 📁 Project Structure for Deployment

```
riela-website/
├── public/                 # Static files (served directly)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── assets/
├── netlify/
│   └── functions/
│       └── server.js       # Serverless function
├── netlify.toml            # Netlify configuration
├── package.json
└── DEPLOYMENT.md
```

## ⚡ Features Included

- ✅ **Serverless Functions** - API routes work without a server
- ✅ **Caching** - 5-minute cache for Momence API calls
- ✅ **Security Headers** - XSS protection, content type validation
- ✅ **Performance** - Static asset caching (1 year)
- ✅ **CORS** - Proper cross-origin configuration
- ✅ **Rate Limiting** - 60 requests per minute

## 🔍 Testing After Deployment

1. **Visit your site**: `https://your-site-name.netlify.app`
2. **Test API**: `https://your-site-name.netlify.app/api/events`
3. **Check health**: `https://your-site-name.netlify.app/.netlify/functions/server/health`

## 🐛 Troubleshooting

### API Not Working?
- Check environment variables are set correctly
- Verify Momence credentials are valid
- Check Netlify function logs

### Static Files Not Loading?
- Ensure `public` folder is the publish directory
- Check file paths in HTML/CSS are correct

### Performance Issues?
- Check browser dev tools for errors
- Verify caching headers are working
- Monitor Netlify function execution time

## 📞 Support

If you encounter issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for errors

