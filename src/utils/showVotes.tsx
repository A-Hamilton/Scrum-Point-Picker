import axios from 'axios';

export default function showVotes(sessionID: string): void {
  axios.post('/showVotes', { sessionID });
}
