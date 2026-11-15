import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocFromServer,
  doc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface FormattedAuthError {
  code: string;
  message: string;
  isPopupBlocked: boolean;
  isUnauthorizedDomain: boolean;
}

export function formatFirebaseAuthError(error: unknown): FormattedAuthError {
  const errObj = error as { code?: string; message?: string } | null;
  const code = errObj?.code || 'auth/unknown-error';
  const rawMessage = errObj?.message || (error instanceof Error ? error.message : String(error));
  const currentHost =
    typeof window !== 'undefined' ? window.location.hostname : 'this domain';

  if (code === 'auth/popup-blocked') {
    return {
      code,
      isPopupBlocked: true,
      isUnauthorizedDomain: false,
      message:
        'Your browser or preview iframe blocked the Google Sign-In popup (auth/popup-blocked). Allow popups for this site or open the storefront in a new browser tab to sign in.',
    };
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      code,
      isPopupBlocked: false,
      isUnauthorizedDomain: false,
      message:
        'The Google Sign-In window was closed before completing verification. Click Sign In again and select your authorized Google account (ananyapoudel641@gmail.com).',
    };
  }
  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      isPopupBlocked: false,
      isUnauthorizedDomain: true,
      message: `Domain "${currentHost}" is not in Firebase Auth Authorized Domains (auth/unauthorized-domain). Access via the AI Studio app URL or add "${currentHost}" in Firebase Console → Authentication → Settings → Authorized domains.`,
    };
  }
  if (code === 'auth/operation-not-allowed') {
    return {
      code,
      isPopupBlocked: false,
      isUnauthorizedDomain: false,
      message:
        'Google Sign-In provider is disabled in Firebase Authentication (auth/operation-not-allowed).',
    };
  }
  if (code === 'auth/network-request-failed') {
    return {
      code,
      isPopupBlocked: false,
      isUnauthorizedDomain: false,
      message:
        'Network error while contacting Google Authentication servers (auth/network-request-failed). Check your internet connection or VPN and retry.',
    };
  }

  return {
    code,
    isPopupBlocked: false,
    isUnauthorizedDomain: false,
    message: `Google Sign-In failed (${code}): ${rawMessage}`,
  };
}

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export {
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  onAuthStateChanged,
};
export type { User };
