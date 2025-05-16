// src/utils/getOrCreateUserID.ts
import { v4 as uuidv4 } from 'uuid';

export function getOrCreateUserID(): string {
  let id = localStorage.getItem('userID');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('userID', id);
  }
  return id;
}
