'use client;'
import { lusitana} from '@/app/components/fonts';
import BotsList from '@/app/components/bot/botsList';
function botsPage() {
    return (
        <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{  flex: 1, paddingRight: '20px' }}> 
          <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
            ASSISTANTS
          </h1>
          <BotsList/>
          </div>
          
         </main> 
    )
}
export default botsPage;