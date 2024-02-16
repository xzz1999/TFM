import ChatLogo from '@/app/ui/logo';
import LoginForm from '@/app/ui/login-form';

 
export default function LoginPage() {
  return (
        <main className="flex min-h-screen flex-col p-6">
          <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
            <ChatLogo/>
          </div>
          <LoginForm/>
          
          </main>
    
  );
}