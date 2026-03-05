# ثانوية صلاح الدين الأيوبي - School Management Website

**Saladin High School - Fez, Morocco** 🏫

A modern, fully-featured school management website built with Vanilla JavaScript, Supabase, and deployed on Vercel.

---

## 🌟 Features

### Public Website
- ✅ **Activities Management** - Display school activities and events
- ✅ **Announcements** - Share important notices and memos
- ✅ **Gallery** - Full-featured image gallery with lightbox viewer
- ✅ **Certificates** - Online certificate request submission (via Google Forms)
- ✅ **Contact Form** - Direct messaging system
- ✅ **Meetings** - Schedule and display school meetings
- ✅ **Holidays** - Calendar of school holidays

### Admin Dashboard
- ✅ **Content Management** - Create, edit, delete all content
- ✅ **Image Management** - Upload and manage gallery images
- ✅ **Certificate Requests** - Redirect students to Google Forms for requests
- ✅ **Contact Messages** - View and manage inquiries
- ✅ **User Management** - Handle admin accounts

### Technical Features
- ✅ **Image Compression** - 50-70% size reduction on uploads
- ✅ **Lazy Loading** - Optimized image loading with IntersectionObserver
- ✅ **Responsive Design** - Works on mobile, tablet, desktop
- ✅ **Accessibility** - WCAG 2.1 compliant
- ✅ **RTL Support** - Full Arabic language support
- ✅ **Security** - Input validation, sanitization, secure API
- ✅ **Dark Mode Ready** - Framework for dark theme

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
- Node.js 16+
- npm or yarn
- Supabase account (free at https://supabase.com)
- Git (optional)
```

### 2. Setup
```bash
# Clone project
git clone <repository-url>
cd LSA

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with Supabase credentials
# VITE_SUPABASE_URL=your-url
# VITE_SUPABASE_ANON_KEY=your-key
```

### 3. Database Setup
```bash
# Copy and run DATABASE_SETUP.sql in Supabase SQL Editor
```

### 4. Run Development Server
```bash
npm run dev
# Visit http://localhost:5173
```

---

## 📁 Project Structure

```
LSA/
├── 📄 index.html                      # Main website
├── 📄 dashboard.html                  # Admin panel
├── 📁 javascript/
│   ├── supabase-api.js                # ⭐ NEW: Unified API client
│   ├── config.js                      # ⭐ NEW: Configuration
│   ├── validation.js                  # ⭐ NEW: Input validation
│   ├── utils.js                       # ⭐ NEW: Utility functions
│   ├── app.js                         # Home page logic
│   ├── dashboard.js                   # Admin panel logic
│   ├── gallery-manager.js             # Gallery & lightbox
│   ├── contact.js                     # Contact form
│   ├── [Removed]                      # Certificates now uses Google Forms
│   └── [other modules]
├── 📁 css/
│   ├── styles.css                     # Main styles
│   ├── dashboard.css                  # Admin styles
│   └── lightbox.css                   # Gallery lightbox
├── 📁 assets/
│   └── gallery/                       # Gallery images
├── 📄 .env.example                    # ⭐ NEW: Environment template
├── 📄 .gitignore                      # ⭐ UPDATED: Security
├── 📄 package.json                    # Dependencies
├── 📄 DATABASE_SETUP.sql              # Database schema
├── 📄 PROJECT_ANALYSIS_AND_IMPROVEMENTS.md  # ⭐ NEW: Full analysis
├── 📄 SETUP_AND_DEPLOYMENT_GUIDE.md   # ⭐ NEW: Setup guide
├── 📄 README.md                       # ⭐ NEW: This file
└── [other docs]
```

---

## 🔐 Security Features

### ✅ Implemented
- Input validation on all forms
- XSS protection with sanitization
- Secure API client with error handling
- Environment variables for secrets
- .gitignore prevents committing secrets
- Rate limiting configuration
- Timeout protection

### ⚠️ Still Need
- [ ] CSRF token protection
- [ ] Rate limiting enforcement
- [ ] Advanced authentication
- [ ] Audit logging
- [ ] API key rotation

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_ANALYSIS_AND_IMPROVEMENTS.md](PROJECT_ANALYSIS_AND_IMPROVEMENTS.md) | Complete project analysis and improvement plan |
| [SETUP_AND_DEPLOYMENT_GUIDE.md](SETUP_AND_DEPLOYMENT_GUIDE.md) | Step-by-step setup and deployment guide |
| [ALL_FEATURES_GUIDE.md](ALL_FEATURES_GUIDE.md) | Feature documentation |
| [DATABASE_SETUP.sql](DATABASE_SETUP.sql) | Database schema |
| [CERTIFICATE_SETUP.md](CERTIFICATE_SETUP.md) | Certificate system documentation |
| [RLS_POLICIES_FIX.md](RLS_POLICIES_FIX.md) | Row Level Security setup |

---

## 🛠️ Development

### Available Commands
```bash
# Development
npm run dev          # Start dev server (port 5173)
npm run preview      # Preview build locally

# Build
npm run build        # Build for production

# Linting (when added)
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

### Code Style
- **Language**: Vanilla JavaScript (ES6+)
- **Naming**: camelCase for variables, PascalCase for classes
- **Comments**: JSDoc for functions
- **Modules**: Exported as window globals and module objects

### Key Modules

#### `supabase-api.js` ⭐ NEW
Unified API client for all database operations:
```javascript
API.activities.getAll()
API.activities.create(data)
API.contacts.create(data)
API.certificates.updateStatus(id, status)
// ... and more
```

#### `config.js` ⭐ NEW
Centralized configuration:
```javascript
AppConfig.colors.primary.blue
AppConfig.validation.email.maxLength
AppConfig.getErrorMessage('required')
```

#### `validation.js` ⭐ NEW
Input validation utilities:
```javascript
ValidationUtils.validateEmail(email)
ValidationUtils.validateForm(data, rules)
ValidationUtils.sanitizeInput(text)
```

#### `utils.js` ⭐ NEW
Helper functions:
```javascript
formatDate(date)
truncateText(text, 100)
debounce(fn, 300)
deepClone(obj)
```

---

## 📊 Database Schema

### Tables
1. **activities** - School activities and events
2. **announcements** - Official notices and memos
3. **gallery** - Images for gallery
4. **certificate_requests** - Student certificate requests
5. **contacts** - Contact form submissions
6. **meetings** - Scheduled meetings

See [DATABASE_SETUP.sql](DATABASE_SETUP.sql) for full schema.

---

## 🌐 Environment Variables

### Required
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### Optional
```env
VITE_SENDGRID_API_KEY=xxx
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true
```

See [.env.example](.env.example) for complete list.

---

## 🚀 Deployment

### To Vercel
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically on push

See [SETUP_AND_DEPLOYMENT_GUIDE.md](SETUP_AND_DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🎨 Customization

### Colors
Edit in `javascript/config.js`:
```javascript
AppConfig.colors.primary.blue = '#1A73E8'
AppConfig.colors.primary.green = '#2ECC71'
```

### Text & Messages
Edit in `javascript/config.js`:
```javascript
AppConfig.app.name = 'Your School Name'
AppConfig.errors.required = 'This field is required'
```

### Styling
Main CSS files:
- `css/styles.css` - General styles
- `css/dashboard.css` - Admin panel
- `css/lightbox.css` - Gallery

---

## 🐛 Bug Reports & Issues

### Known Issues
None currently tracked in this version.

### Reporting Issues
1. Check [PROJECT_ANALYSIS_AND_IMPROVEMENTS.md](PROJECT_ANALYSIS_AND_IMPROVEMENTS.md)
2. Review documentation files
3. Check browser console for errors

---

## 📈 Performance

### Current
- Bundle size: TBD (after build process setup)
- Lighthouse score: TBD
- Mobile performance: Good (responsive design)

### Optimization Roadmap
- [ ] Implement Vite bundling
- [ ] Add minification
- [ ] Service worker for offline
- [ ] Image optimization (WebP)
- [ ] Caching strategies

---

## 📱 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

---

## 🤝 Contributing

### Code Standards
- Use vanilla JavaScript (no frameworks unless necessary)
- Write JSDoc comments for functions
- Follow existing code patterns
- Test changes before committing
- Never commit `.env` files

### Pull Request Process
1. Create feature branch
2. Make changes with clear commits
3. Update documentation
4. Submit PR with description
5. Pass code review
6. Merge when approved

---

## 📄 License

[Specify your license - MIT, Apache, etc.]

---

## 👥 Team & Contact

**Project Manager:** Ahmed  
**Status:** Under Active Development  
**Last Updated:** January 8, 2026

For questions, refer to documentation or contact project manager.

---

## 🙏 Acknowledgments

- Supabase for backend services
- Vercel for hosting
- Cairo Font family for Arabic support
- Material Design principles for UI

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Happy coding! 🚀**
