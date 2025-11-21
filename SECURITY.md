# Security Guidelines

## 🔐 API Keys and Secrets

### What to Keep Secret

**NEVER commit these files:**
- `.env` - Contains API keys
- `firebase-service-account.json` - Firebase admin credentials
- Any file with `secret`, `key`, or `token` in the name

### What's Safe to Commit

**These are OK to commit:**
- Firebase client configuration (in `firebase-config.js`)
  - Firebase client config is designed to be public
  - Security is handled by Firebase Security Rules
- `.env.example` - Template without actual keys
- Public configuration files

## 📝 Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cd webmap_viz/data-collection
cp .env.example .env
```

### 2. Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `webmap_viz/data-collection/firebase-service-account.json`
4. **Never commit this file!**

## 🚨 If You Accidentally Commit Secrets

### 1. Immediately Revoke the Keys

- **Apify**: https://console.apify.com/account/integrations
- **OpenWeather**: https://home.openweathermap.org/api_keys
- **NewsAPI**: https://newsapi.org/account
- **Firebase**: Regenerate service account key

### 2. Remove from Git History

```bash
# Remove file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ dangerous!)
git push origin --force --all
```

### 3. Generate New Keys

Get new API keys and update your `.env` file.

## ✅ Checklist Before Committing

- [ ] No `.env` files
- [ ] No `firebase-service-account.json`
- [ ] No hardcoded API keys in code
- [ ] `.gitignore` is up to date
- [ ] Only `.env.example` with placeholder values

## 📚 Resources

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules)
- [GitHub: Removing Sensitive Data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

