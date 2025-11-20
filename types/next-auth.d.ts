import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      dateOfBirth?: string;
      isPublic?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username: string;
    dateOfBirth?: string;
    isPublic?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    dateOfBirth?: string;
    isPublic?: boolean;
  }
}
