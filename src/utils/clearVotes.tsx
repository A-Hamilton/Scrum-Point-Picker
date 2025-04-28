import axios from 'axios';

export default function clearVotes(sessionID: string): void {
  axios.post('/clearVotes', { sessionID });
}
