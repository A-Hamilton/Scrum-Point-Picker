class User { id = ''; displayName = ''; }

export default function createUser(): void {
  const nameStored = localStorage.getItem('userName');
  const idStored = localStorage.getItem('userID');
  if (nameStored && idStored) return;

  const name = prompt('Enter your display name:')?.trim();
  if (!name) return createUser();

  const id = crypto.randomUUID().substr(0, 12);
  localStorage.setItem('userName', name);
  localStorage.setItem('userID', id);
}
