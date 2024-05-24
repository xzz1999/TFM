import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnChat = nextUrl.pathname.startsWith('/chats');
      const isOnPage = nextUrl.pathname.startsWith('/pages');

      // Permitir acceso a chats y páginas independientemente de la autenticación
      if (isOnChat || isOnPage) {
        return true;
      }

      // Si está en dashboard y está autenticado, permitir acceso
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/login', nextUrl));
      }

      // Si está autenticado y no está en una ruta protegida, redirigir a dashboard
      if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Si no está autenticado y no está en una ruta protegida, permitir acceso
      return true;
    },
  },
  providers: [],
  secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCxamsg=",
} satisfies NextAuthConfig;
