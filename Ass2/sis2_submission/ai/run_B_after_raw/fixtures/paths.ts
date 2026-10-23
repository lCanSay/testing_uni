import path from 'node:path';

const AUTH_DIR = path.resolve(__dirname, '..', '.auth');

/** Browser state (localStorage with the JWT) written by tests/auth.setup.ts. */
export const STORAGE_STATE = path.join(AUTH_DIR, 'user.json');

/** Credentials/address of the user that belongs to STORAGE_STATE. */
export const SESSION_USER_FILE = path.join(AUTH_DIR, 'session-user.json');
export { AUTH_DIR };
