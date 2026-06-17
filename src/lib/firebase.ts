/* ==============================================================
   Firebase bootstrap
   --------------------------------------------------------------
   Initializes the Firebase app, Auth, and a Google provider used
   by the sign-up popup. The web apiKey here is NOT a secret — for
   Firebase web apps it's a public client identifier; access is
   controlled by Auth settings and security rules, not by hiding it.
   ============================================================== */
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCqZ14egxflgt-6d9GXCdHCUyklKGC9T2g',
  authDomain: 'networking-byartin.firebaseapp.com',
  projectId: 'networking-byartin',
  storageBucket: 'networking-byartin.firebasestorage.app',
  messagingSenderId: '730372944740',
  appId: '1:730372944740:web:a5691b75f7548a36d68071',
  measurementId: 'G-RQYD9PWEP9',
}

export const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

// Always offer the Google account chooser instead of silently reusing
// the last account — friendlier for a beta sign-up.
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Analytics only works in supported browser environments (needs cookies /
// not running in SSR), so guard it to avoid throwing on init.
isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app)
  })
  .catch(() => {
    /* analytics unavailable — safe to ignore */
  })
