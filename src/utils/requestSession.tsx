import axios from 'axios';
import getUser from './getUser';

export default async function requestSession(): Promise<string> {
  const user = getUser();
  const resp = await axios.post<string>('/createSession', user);
  return resp.data;
}
