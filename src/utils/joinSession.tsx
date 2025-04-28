// example: src/utils/joinSession.ts
import api from './api';
import getUser from './getUser';

export default function joinSession(sessionID: string) {
  const user = getUser();
  return api.post('/joinSession', { ...user, sessionID });
}
