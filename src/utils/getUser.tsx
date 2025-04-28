export default function getUser() {
    return {
      userID: localStorage.getItem('userID') || '',
      userName: localStorage.getItem('userName') || ''
    };
  }
  