// src/utils/addParticipant.ts
import api from './api';
import { v4 as uuid } from 'uuid';

/**
 * Adds a dummy participant to the given session.
 * Returns a native Promise<void>, fixing the IPromise vs Promise mismatch.
 */
export default async function addParticipant(
  sessionID: string,
  name: string
): Promise<void> {
  const userID = uuid().substr(0, 12);
  // await the POST so this function returns Promise<void>
  await api.post('/joinSession', {
    sessionID,
    userID,
    userName: name
  });
}
