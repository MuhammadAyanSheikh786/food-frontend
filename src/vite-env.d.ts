/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "framer-motion" {
  export const motion: any;
  export const AnimatePresence: any;
  export const useScroll: any;
  export const useTransform: any;
  export default motion;
}

declare module "firebase/app" {
  export function initializeApp(config: any): any;
  export function getApp(name?: string): any;
  export function getApps(): any[];
}

declare module "firebase/auth" {
  export function getAuth(app: any): any;
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export class GoogleAuthProvider {
    constructor();
  }
}
