import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Firebase Configuration Loading
 * 
 * The Firebase configuration is loaded from global variables that should be set
 * before the application loads. These globals are expected to be injected via:
 * 
 * 1. A script tag in index.html that sets window.__firebase_config and window.__app_id
 * 2. Build-time replacement (e.g., via Vite's define option)
 * 3. Server-side injection during deployment
 * 
 * Example script in index.html:
 * <script>
 *   window.__firebase_config = '{"apiKey":"...","authDomain":"..."}';
 *   window.__app_id = 'your-app-id';
 * </script>
 * 
 * If the globals are not set, the app will fail to initialize Firebase.
 */
const firebaseConfig = JSON.parse(globalThis.__firebase_config || '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof globalThis.__app_id !== 'undefined' ? globalThis.__app_id : 'default-app-id';

export { auth, db, appId };
