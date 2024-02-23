'use client';
import { lusitana} from '@/app/ui/fonts';

function botsPage() {
    return (
        <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{  flex: 1, paddingRight: '20px' }}> 
          <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
            Chat
          </h1>
         
          </div>
          
         </main> 
    )
}
export default botsPage;