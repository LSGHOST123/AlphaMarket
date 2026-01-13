
import React from 'react';

interface LandingProps {
  onStart: () => void;
}

const InfoBlock = ({ title, desc, icon, meta }: { title: string, desc: string, icon: string, meta?: string }) => (
  <div className="bg-[#050505] border border-[#111] p-6 md:p-12 hover:border-neon transition-all duration-500 group relative overflow-hidden h-full flex flex-col justify-between">
    <div>
      <div className="text-neon mb-6 md:mb-8 text-5xl md:text-7xl group-hover:scale-110 transition-transform duration-500">{icon}</div>
      <h3 className="text-white font-black text-2xl md:text-3xl mb-4 md:mb-6 uppercase tracking-tighter relative z-10">{title}</h3>
      <p className="text-gray-400 text-base md:text-lg leading-relaxed font-sans relative z-10">{desc}</p>
    </div>
    {meta && (
      <div className="mt-8 pt-4 md:pt-6 border-t border-[#111] text-[8px] md:text-[10px] text-neon font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">
        {meta}
      </div>
    )}
  </div>
);

const ComparisonRow = ({ feature, traditional, pro }: { feature: string, traditional: string, pro: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#111] py-6 md:py-10 items-center gap-2 md:gap-0">
    <div className="text-gray-400 font-mono text-sm md:text-lg uppercase tracking-widest">{feature}</div>
    <div className="text-gray-700 font-mono text-[10px] md:text-sm uppercase md:text-center">
      <span className="md:hidden text-gray-800 mr-2">TRADICIONAL:</span>{traditional}
    </div>
    <div className="text-neon font-mono text-sm md:text-lg uppercase md:text-center font-black flex items-center md:justify-center gap-4">
      <div className="w-2 h-2 md:w-3 md:h-3 bg-neon rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--neon-rgb),0.8)]"></div>
      <span className="md:hidden text-neon/60 mr-2">PRO:</span>{pro}
    </div>
  </div>
);

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  const PIX_KEY = "00020101021126330014br.gov.bcb.pix0111520258988355204000053039865802BR5922LUCAS SIMIONI SCHIAVAN6008CAMPINAS62070503***63046804";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden font-mono selection:bg-neon selection:text-black">
      
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-10 py-4 md:py-6 bg-black/80 backdrop-blur-md border-b border-[#111]">
        <div className="text-xl md:text-3xl font-black tracking-tighter italic flex items-center gap-2 md:gap-4">
          <div className="w-4 h-4 md:w-6 md:h-6 bg-neon shadow-[0_0_25px_rgba(var(--neon-rgb),0.5)] rounded-sm"></div>
          ALPHA<span className="text-neon neon-text-glow">MARKET</span>
        </div>
        <button 
          onClick={onStart}
          className="px-4 py-2 md:px-8 md:py-4 bg-neon text-black text-[10px] md:text-xs font-black hover:bg-white transition-all duration-500 uppercase tracking-widest shadow-[0_0_40px_rgba(var(--neon-rgb),0.3)]"
        >
          ANALISAR
        </button>
      </nav>

      <main className="relative z-10 flex-1 pt-24 md:pt-32">
        <section className="pt-10 md:pt-20 pb-24 md:pb-48 px-6 md:px-10 text-center max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.9] md:leading-[0.85] uppercase mb-8 md:mb-12 animate-in fade-in zoom-in duration-1000">
            A NOVA ERA DA <br />
            <span className="text-neon neon-text-glow italic">INTELIGÊNCIA</span>
          </h1>
          <p className="text-base md:text-3xl text-gray-400 font-sans font-light tracking-wide max-w-4xl mx-auto leading-relaxed mb-12 md:mb-20">
            O primeiro terminal híbrido que une dados institucionais em tempo real com processamento neural de alta performance.
          </p>
          
          <div className="flex justify-center">
            <button 
              onClick={onStart}
              className="group relative px-10 py-5 md:px-24 md:py-8 border-2 border-neon/30 text-neon font-black text-sm md:text-lg tracking-[0.3em] md:tracking-[0.5em] hover:bg-neon hover:text-black transition-all duration-500 uppercase rounded-sm"
            >
              ANALISAR AGORA
              <div className="absolute -inset-4 border border-neon/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </button>
          </div>
        </section>

        <section className="py-20 md:py-32 bg-[#020202] border-y border-[#111]">
          <div className="max-w-[1800px] mx-auto px-6 md:px-10">
            <div className="mb-16 md:mb-24">
              <h2 className="text-neon text-[10px] md:text-sm font-black tracking-[0.4em] md:tracking-[0.6em] uppercase mb-4 md:mb-6 italic text-neon">ALPHA ARCHITECTURE</h2>
              <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">PROCESSAMENTO <span className="text-gray-700 uppercase">EXTREMO</span></h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              <InfoBlock 
                icon="⚡" 
                title="Latência Zero" 
                desc="Nossa infraestrutura processa feeds de 40+ bolsas globais em milissegundos, garantindo latência institucional para traders de elite."
                meta="FIBRA ÓPTICA DEDICADA"
              />
              <InfoBlock 
                icon="🤖" 
                title="Neural Analysis" 
                desc="Relatórios gerados por redes neurais treinadas em fluxos de ordens massivos. Decisões baseadas em processamento paralelo extremo."
                meta="LIGAÇÃO DIRETA GPT-5.1 NANO"
              />
              <InfoBlock 
                icon="🌐" 
                title="Liquidez Global" 
                desc="Conectividade direta com os maiores provedores de liquidez institucional, garantindo execução instantânea e spreads mínimos."
                meta="INSTITUTIONAL LIQUIDITY"
              />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-40 bg-black">
          <div className="max-w-[1800px] mx-auto px-6 md:px-10">
            <div className="mb-16 md:mb-24 md:text-right">
              <h2 className="text-neon text-[10px] md:text-sm font-black tracking-[0.6em] uppercase mb-4 md:mb-6 italic">BEYOND TRADITIONAL</h2>
              <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">VANTAGENS <span className="text-gray-700 uppercase">STRATEGIC</span></h3>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="hidden md:grid grid-cols-3 border-b-2 border-neon pb-6 md:pb-10 mb-8 md:mb-14">
                <div className="text-neon text-base md:text-lg font-black uppercase tracking-[0.3em]">Features</div>
                <div className="text-gray-600 text-center text-base md:text-lg font-black uppercase tracking-[0.3em]">TRADICIONAL</div>
                <div className="text-white text-center text-base md:text-lg font-black uppercase tracking-[0.3em]">ALPHA MARKET PRO</div>
              </div>
              <ComparisonRow feature="Dados em Tempo Real" traditional="Delay / Limitado" pro="Instantâneo / Ilimitado" />
              <ComparisonRow feature="Análise Neural IA" traditional="Básica / Ausente" pro="GPT-5.1 Nano Habilitado" />
              <ComparisonRow feature="Ativos B3 & Crypto" traditional="Separados" pro="Unificados" />
              <ComparisonRow feature="Previsão de Fluxo" traditional="Inexistente" pro="Habilitada" />
              <ComparisonRow feature="Infraestrutura" traditional="Legada / Lenta" pro="Cloud Native / 12ms" />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-40 bg-[#020202] border-t border-[#111] relative overflow-hidden">
            <div className="max-w-[1800px] mx-auto px-6 md:px-10 text-center relative z-10">
                <h2 className="text-neon text-[10px] md:text-sm font-black tracking-[0.4em] md:tracking-[0.8em] uppercase mb-12 md:mb-24">PRÓXIMAS ATUALIZAÇÕES</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-20 md:mb-32 max-w-6xl mx-auto">
                  <div className="bg-[#050505] border border-neon/30 p-8 md:p-12 text-left relative group hover:border-neon transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
                      <div className="text-6xl md:text-9xl font-black italic">01</div>
                    </div>
                    <div className="w-8 md:w-12 h-1 bg-neon mb-6 md:mb-8 group-hover:w-24 transition-all duration-500"></div>
                    <h4 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6 md:mb-8 leading-none">
                      DEIXAR A IA INVESTIR <br />
                      <span className="text-neon italic">PARA VOCÊ</span>
                    </h4>
                    <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-sans font-light">
                      Automação total de portfólio baseada em redes neurais de alta performance. Nosso motor de execução operará suas estratégias 24/7 com precisão institucional e gerenciamento de risco neural.
                    </p>
                    <div className="mt-8 md:mt-10 flex items-center gap-2">
                       <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
                       <span className="text-[8px] md:text-[10px] text-neon font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">AlphaMarket V2</span>
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-neon/30 p-8 md:p-12 text-left relative group hover:border-neon transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
                      <div className="text-6xl md:text-9xl font-black italic">02</div>
                    </div>
                    <div className="w-8 md:w-12 h-1 bg-neon mb-6 md:mb-8 group-hover:w-24 transition-all duration-500"></div>
                    <h4 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6 md:mb-8 leading-none">
                      API PARA DADOS <br />
                      <span className="text-neon italic transition-colors duration-500">FINANCEIROS</span>
                    </h4>
                    <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-sans font-light">
                      Liberação de API gratuita com dados financeiros em tempo real de todos os ativos do mundo. Infraestrutura robusta para desenvolvedores e analistas criarem suas próprias ferramentas sobre nosso ecossistema.
                    </p>
                    <div className="mt-8 md:mt-10 flex items-center gap-2">
                       <div className="w-2 h-2 bg-neon rounded-full animate-pulse"></div>
                       <span className="text-[8px] md:text-[10px] text-neon font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">AlphaMarket Open API</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-20 md:mt-40 flex justify-center">
                   <div className="relative border-4 border-dashed border-neon bg-black p-6 md:p-20 w-full max-w-6xl shadow-[0_0_150px_rgba(var(--neon-rgb),0.2)]">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 mb-10 md:mb-16">
                           <div className="hidden md:block h-[2px] w-24 bg-neon/60"></div>
                           <h4 className="text-neon font-black text-lg md:text-2xl tracking-[0.3em] md:tracking-[0.6em] uppercase text-center">
                              CONTRIBUA PARA A NOVA UPDATE
                           </h4>
                           <div className="hidden md:block h-[2px] w-24 bg-neon/60"></div>
                      </div>

                      <div className="flex flex-col xl:flex-row items-center justify-center gap-10 xl:gap-28">
                          <div className="bg-white p-4 md:p-6 pb-6 md:pb-10 rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500 shrink-0">
                              <div className="bg-white border-b border-gray-100 pb-2 md:pb-4 mb-2 md:mb-4 flex justify-center">
                                   <span className="text-orange-500 font-black tracking-tighter flex items-center gap-2 text-sm md:text-lg uppercase">
                                      <div className="w-4 h-4 md:w-6 md:h-6 bg-orange-500 rounded-sm"></div>
                                      inter
                                   </span>
                              </div>
                              <div className="w-48 h-48 md:w-64 md:h-64 bg-white flex items-center justify-center">
                                  <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(PIX_KEY)}&bgcolor=ffffff`} 
                                      alt="Pix QR Code" 
                                      className="w-full h-full object-contain"
                                  />
                              </div>
                              <div className="mt-4 md:mt-6 text-center">
                                  <div className="flex items-center justify-center gap-2 md:gap-3">
                                      <div className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                      <span className="text-black font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em]">BANCO INTER</span>
                                  </div>
                              </div>
                          </div>

                          <div className="flex flex-col gap-6 md:gap-8 text-left max-w-full md:max-w-xl overflow-hidden">
                              <div className="w-full">
                                  <label className="text-[10px] md:text-xs text-gray-500 font-mono uppercase tracking-[0.3em] block mb-2 md:mb-4">Chave Pix Copia e Cola</label>
                                  <div className="bg-[#080808] border-2 border-[#222] p-4 md:p-6 group cursor-pointer hover:border-neon transition-colors relative overflow-hidden rounded-sm">
                                      <div className="text-[9px] md:text-[11px] font-mono text-white/90 break-all leading-relaxed tracking-wider">
                                          {PIX_KEY}
                                      </div>
                                  </div>
                              </div>

                              <div>
                                  <label className="text-[10px] md:text-xs text-gray-500 font-mono uppercase tracking-[0.3em] block mb-1 md:mb-2">Nome do Beneficiário</label>
                                  <div className="text-lg md:text-2xl font-black text-white uppercase tracking-widest leading-none">LUCAS SIMIONI SCHIAVAN</div>
                              </div>

                              <div className="bg-neon/10 border-2 border-neon/40 p-4 md:p-8 mt-2 md:mt-4 rounded-sm">
                                   <p className="text-neon text-[10px] md:text-xs font-mono uppercase tracking-[0.1em] md:tracking-[0.2em] leading-relaxed text-center font-black">
                                      * SUA CONTRIBUIÇÃO ACELERA AS PRÓXIMAS UPDATES DO SISTEMA.
                                   </p>
                              </div>
                          </div>
                      </div>
                   </div>
                </div>
            </div>
        </section>

      </main>

      <footer className="w-full border-t border-[#111] bg-[#020202] py-12 md:py-24 px-6 md:px-10">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 text-[10px] md:text-xs text-gray-700 font-black tracking-[0.4em] md:tracking-[0.6em] uppercase text-center">
          <span>ALPHA MARKET © 2025</span>
          <span className="text-neon/80 uppercase">MADE BY LUCAS SIMIONI</span>
        </div>
      </footer>
    </div>
  );
};
