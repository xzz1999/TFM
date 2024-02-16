import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import data from './usuarios.json';


// buscar el usuario por su correo electronico
async function getUser(email: string): Promise<User | undefined> {
  try {
    //const data = await fs.readFile(archivo, 'utf8');
    //const users = JSON.parse(data).usuarios as User[];

    return data.find(user => user.email === email);
    //return usuarios.find(usuario => usuario.correo ===email);
  } catch (error) {
    console.error('error en buscar usuario en el archivo JSON:', error);
    throw new Error('Error en la busquedad.');
  }
}
 
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
            const user = await getUser(email);
            //console.log("email:",user);
            //console.log("cons:", password);
            //console.log("cons1:",user?.password);
            if (!user) return null;
           const hasher = await  bcrypt.hash(user.password, 10);
           //console.log("hashedao:",hasher);
            const passwordsMatch = await bcrypt.compare(password, hasher);
            //console.log("contraseña:",passwordsMatch);
            //console.log(user);
            if (passwordsMatch) return user;
        }
        console.log('Credencial Inválida');
        return null;
      },
    }),
  ],
});