import type { NextAuthConfig } from 'next-auth';
import { IM_Fell_DW_Pica_SC } from 'next/font/google';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      //console.log("isLoggedIn:", isLoggedIn);
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnChat = nextUrl.pathname.startsWith('/chats');
      if(isOnChat){
        return true;
      }
    
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // redirigir a los usuarios a la pagina de login
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
       // return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], 
  secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCxamsg=",
} satisfies NextAuthConfig;