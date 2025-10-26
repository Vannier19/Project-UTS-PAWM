# Virtual Physics Laboratory

Created By:
Stevan Einer Bonagabe / 18223028
Ryota Takenaka / 18225901


## How to Run

### 1. Setup Environment Files (IMPORTANT!)

Create a `.env` file in the `Back_End/` folder based on `.env.example`
(See `.env.example` for required environment variables)


### 2. Install Dependencies
```bash
cd Back_End
npm install
```

### 3. Run Backend Server
```bash
cd Back_End
node server.js
```

Server will run at: `http://localhost:3001`

## Project Structure

```
Back_End/
├── server.js              # Production server with Firebase
├── package.json           # Dependencies
└── .env.example           # Environment template

Front_End/
├── login.html             # Login/Register page
├── index.html             # Main application (requires authentication)
├── css/                   # Stylesheet files
│   ├── auth.css           # Login/register styles (updated for neumorphism)
│   ├── main.css           # Base application styles
│   ├── sidebar.css        # Sidebar navigation
│   ├── content.css        # Content area styles
│   ├── lab.css            # Virtual laboratory styles
│   ├── kuis.css           # Quiz system styles
│   ├── materi-enhancement.css
│   ├── modal.css          # Modal dialog styles
│   ├── dark-mode-fix.css  # Dark mode adjustments
│   └── neumorphism.css    # Neumorphism design system (UTS)
├── js/                    # JavaScript files
│   ├── auth.js            # Authentication logic
│   ├── main.js            # Main application logic
│   ├── theme.js           # Dark/Light mode
│   ├── materi.js          # Learning materials module
│   ├── lab.js             # Virtual laboratory module
│   ├── kuis.js            # Quiz module
│   └── data.js            # Quiz questions data
└── assets/                # Images
    ├── car.png
    ├── rock.png
    └── parabola.png
```

## API Endpoints

### `GET /`
Returns server status

### `POST /register`
Register new user
```json
{
  "username": "Tester",
  "password": "password"
}
```

### `POST /login`
User login - returns JWT token
```json
{
  "username": "Tester",
  "password": "password"
}
```

### `POST /auth/google`
Google OAuth authentication - returns JWT token
```json
{
  "idToken": "Firebase ID token from Google Sign-In"
}
```

### `GET /progress-kuis`
Retrieve user's quiz progress (requires token)
```
Headers: { Authorization: 'Bearer <token>' }
```

### `POST /progress-kuis`
Save user's quiz progress (requires token)
```json
{
  "topik": "glb",
  "skor": 8,
  "jawaban": [0, 1, 2, ...],
  "selesai": true
}
```

## Application Features

### 🔐 Authentication
- Username/Password registration and login
- Google OAuth authentication
- JWT token-based session management
- Auto-redirect to login if not authenticated

### 🎓 Learning Materials
- 4 Physics Topics: GLB, GLBB, Vertical Motion, Projectile Motion
- YouTube learning videos
- Complete explanations with examples
- Study tips for each topic
- Formula box with important equations

### 🧪 Virtual Laboratory
- GLB Simulation (Uniform Linear Motion)
- GLBB Simulation (Uniformly Accelerated Linear Motion)
- Vertical Motion Simulation (Free Fall)
- Projectile Motion Simulation
- Real-time visualization with graphs
- Data analysis panel

### 📝 Interactive Quiz
- 10 questions per topic (40 questions total)
- Progress automatically saved to database
- "✓ Completed" badge for finished quizzes
- Score display and answer history
- Can retake quizzes

### 🌓 Dark Mode
- Toggle dark/light theme
- Consistent colors in all modes
- Saved in localStorage

## Troubleshooting

**"Cannot connect to server"**
- Make sure backend is running: `node server.js`
- Check if port 3001 is available

**"Username already taken"**
- Use a different username

**"Invalid token" or page redirects to login**
- Clear browser localStorage (F12 → Application → Local Storage → Clear)
- Login again

**"Firebase Error" or "Cannot connect to Firebase"**
- Verify Firebase project is active and environment variables are set correctly
- Check authorized domains in Firebase Console (Authentication → Settings → Authorized domains)

**"auth/unauthorized-domain" when using Google login**
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains
- For production: Add your Vercel/Railway domain

**"Lab images have white background"**
- Make sure PNG files are actually transparent
- Clear browser cache (Ctrl+F5)
- Check browser console for image loading errors

## Environment Requirements

- Node.js (version 14 or newer)
- npm
- Firebase account (for database)
- Modern browser (Chrome, Firefox, Edge)
