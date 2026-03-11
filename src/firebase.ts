import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBzUmlPAaEI1R6MUWWiZHj1Vc6HEDqqcSY',
  authDomain: 'rprsnt-f8e55.firebaseapp.com',
  projectId: 'rprsnt-f8e55',
  storageBucket: 'rprsnt-f8e55.firebasestorage.app',
  messagingSenderId: '1071609775056',
  appId: '1:1071609775056:web:278958e0da208860b6efd5',
  measurementId: 'G-NF8L1ELR26',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Analytics only runs in the browser; may be null if disabled or in unsupported environment
export const analytics =
  typeof window !== 'undefined'
    ? (() => {
        try {
          return getAnalytics(app)
        } catch {
          return null
        }
      })()
    : null
