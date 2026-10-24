import { api } from './api.js';
import { state } from './state.js';

// Activity sessions expire 24 hours after they were requested.
export const SESSION_TTL_MS = 86400000;

let session = null,
  expiresAt = 0,
  request = null;

// Adopts the session a route or brief response returned, superseding any pending acquisition.
export function adoptSession(id, started) {
  request = null;
  session = id;
  expiresAt = session ? started + SESSION_TTL_MS : 0;
}

export function resetSession() {
  session = null;
  expiresAt = 0;
  request = null;
}

// Drops a session the server no longer accepted, unless a newer one replaced it meanwhile.
export function dropSession(attempted) {
  if (session === attempted) {
    session = null;
    expiresAt = 0;
  }
}

// Returns a live session, acquiring one when none is held or the held one expired.
export async function currentSession() {
  if (session && Date.now() >= expiresAt) {
    session = null;
    expiresAt = 0;
  }
  if (!session) {
    if (!request) {
      const started = Date.now();
      // Only the current acquisition may update state after a snapshot refresh or search.
      const pending = api('/api/session', {})
        .then(result => {
          if (request === pending && result.snapshot === state.graph.snapshot) {
            session = result.session;
            expiresAt = session ? started + SESSION_TTL_MS : 0;
          }
        })
        .catch(() => {
          if (request === pending) {
            session = null;
            expiresAt = 0;
          }
        })
        .finally(() => {
          if (request === pending) request = null;
        });
      request = pending;
    }
    await request;
  }
  return session;
}
