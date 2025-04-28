import axios from 'axios';
import getUser from './getUser';

export default async function joinSession(sessionID: string): Promise<void> {
  const user = getUser();
  await axios.post('/joinSession', { ...user, sessionID });
}
