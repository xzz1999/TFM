import { lusitana} from '@/app/components/fonts';
import TeleBotsList from '@/app/components/teleBot/teleBotList';
function teleBotsPage() {
    return (
        <main style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <div style={{  flex: 1, paddingRight: '20px' }}> 
          <h1 className={`${lusitana.className} mb-20 text-xl md:text-6xl`}>
            ASSISTANTS
          </h1>
          <TeleBotsList/>
          </div>
          
         </main> 
    )
}
export default teleBotsPage;