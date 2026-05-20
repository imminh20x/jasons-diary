import type { User } from '@supabase/supabase-js';
import { isMockMode } from '../supabaseClient';

export const isDevMockAuthEnabled = import.meta.env.DEV && isMockMode;

const DEV_CREDENTIALS = [
  { email: 'admin@blog.com', password: 'password' },
  { email: 'admin@example.com', password: 'admin' },
] as const;

export function validateDevMockLogin(email: string, password: string): boolean {
  if (!isDevMockAuthEnabled) {
    return false;
  }

  return DEV_CREDENTIALS.some(
    (credential) => credential.email === email && credential.password === password,
  );
}

export function isLocalMockAuthenticated(): boolean {
  return isDevMockAuthEnabled && localStorage.getItem('admin_authenticated') === 'true';
}

export function setLocalMockAuthenticated(authenticated: boolean): void {
  if (!isDevMockAuthEnabled) {
    localStorage.removeItem('admin_authenticated');
    return;
  }

  if (authenticated) {
    localStorage.setItem('admin_authenticated', 'true');
  } else {
    localStorage.removeItem('admin_authenticated');
  }

  window.dispatchEvent(new Event('storage'));
}

export function clearStaleMockAuth(): void {
  if (!isDevMockAuthEnabled) {
    localStorage.removeItem('admin_authenticated');
  }
}

export function isAdminAuthenticated(supabaseUser: User | null): boolean {
  if (isDevMockAuthEnabled && isLocalMockAuthenticated()) {
    return true;
  }

  if (!isMockMode && supabaseUser) {
    return true;
  }

  return false;
}
