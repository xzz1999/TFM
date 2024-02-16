"use client";
import { lusitana, roboto } from '@/app/ui/fonts';
import IA from '@/app/ui/dashboard/api';
import Token from '@/app/ui/dashboard/token';
import Role from '@/app/ui/dashboard/role';
import Name from '@/app/ui/dashboard/nombre'
//import NewComponent from '@/app/ui/dashboard/newComponent'; // Asumiendo que importas el nuevo componente

export default async function Page() {
  return (
    <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <div style={{  flex: 1, paddingRight: '20px' }}> 
        <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
          Dashboard
        </h1>
        <br></br>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Select AI API
        </h2>
        <IA />
        <br></br>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Introduce your IA token
        </h2>
        <Token />
        </div>
        <div style={{ flex: 2, }}> 
        <br></br>
        <br></br>
        <br></br>
        <br></br><br></br>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Name of the chatbot
        </h2>
        <Name/>
        <br></br>
        <h2 className={`${roboto.className} mb-4 text-xl md:text-2xl`}>
          Instruction of the chatbot
        </h2>
        <Role />
      </div>
    </main>
  );
}
