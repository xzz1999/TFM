import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { getPassword } from './app/lib/actions';


// buscar el usuario por su correo electronico

 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
          if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
           
           const hasher = await getPassword(email);
           console.log("hasher:",hasher);
           console.log("type of hasher",typeof hasher);
           if (typeof hasher !== 'string') {
            return null;
          } else {
            const passwordsMatch = await bcrypt.compare(password, hasher);
            if (passwordsMatch) {
              const user = {
                "email": email,
                "password":password

              }
              return user;
            }
    
          }
           
        }
        console.log('Credencial Inválida');
        return null;
      },
    }),
  ],
});