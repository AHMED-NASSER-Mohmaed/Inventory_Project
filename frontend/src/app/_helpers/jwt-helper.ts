import { jwtDecode } from 'jwt-decode';

export function decodeToken(token: string): any {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
}


