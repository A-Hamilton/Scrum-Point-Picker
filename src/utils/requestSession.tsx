import api from './api';
import getUser from './getUser';

export default async function requestSession(): Promise<string> {
  const user = getUser();
  const resp = await api.post<string>('/createSession', user);
  return resp.data;
}
