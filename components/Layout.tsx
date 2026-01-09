import React, { useState, useEffect } from 'react';
import { AppScreen, UIStyle } from '../types';
import { supabase } from '../services/supabaseClient';

interface LayoutProps {
  currentScreen: AppScreen;
  userEmail?: string;
  onNavigate: (screen: AppScreen) => void;
  onLogout: () => void;
  children: React.ReactNode;
  language: 'en' | 'pt' | 'es';
  setLanguage: (lang: 'en' | 'pt' | 'es') => void;
  uiStyle: UIStyle;
  onUIStyleChange: (style: UIStyle) => void;
  onLogoClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentScreen, 
  userEmail, 
  onNavigate, 
  onLogout, 
  children,
  language,
  setLanguage,
  uiStyle,
  onUIStyleChange,
  onLogoClick
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUsername(user.user_metadata.full_name);
      } else {
        setUsername(userEmail?.split('@')[0] || 'Trader');
      }
    };
    if (userEmail) getProfile();
  }, [userEmail]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: username }
    });
    setLoading(false);
    if (error) alert("Failed to update profile");
    else {
      alert("Profile updated successfully");
      setShowSettings(false);
    }
  };

  const isSimpleLayout = currentScreen === AppScreen.LANDING || currentScreen === AppScreen.LOGIN;

  return (
    <>
      {isSimpleLayout ? (
        children
      ) : (
        <div className="flex flex-col min-h-screen bg-black text-gray-300 font-mono selection:bg-neon selection:text-black">
          <header className="h-16 border-b border-[#111] bg-black flex items-center justify-between px-6 shrink-0 sticky top-0 z-[100]">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={onLogoClick}
            >
              <div className="w-4 h-4 bg-neon rounded-sm neon-glow animate-pulse group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,255,65,0.6)]"></div>
              <h1 className="text-2xl font-black tracking-widest text-white">
                ALPHA<span className="text-neon">MARKET</span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-[10px] text-gray-600 tracking-widest">
                 <div className="flex items-center gap-1">
                   <div className="w-1 h-1 bg-neon rounded-full"></div>
                   {language === 'pt' ? 'SISTEMA: ONLINE' : (language === 'es' ? 'SISTEMA: EN LÍNEA' : 'SYSTEM: ONLINE')}
                 </div>
                 <span className="text-[#222]">|</span>
                 <div className="flex items-center gap-1">
                   <div className="w-1 h-1 bg-neon rounded-full"></div>
                   {language === 'pt' ? 'LATÊNCIA: 12ms' : 'LATENCY: 12ms'}
                 </div>
              </div>

              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-3 bg-[#050505] hover:bg-[#111] border border-[#222] hover:border-neon px-4 py-2 rounded-sm transition-all"
              >
                <div className="w-6 h-6 bg-neon text-black rounded-sm flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(0,255,65,0.3)]">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-gray-300 hidden sm:block tracking-wider">{username.toUpperCase()}</span>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </header>

          {showSettings && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-[#000] border border-neon/50 p-8 shadow-[0_0_100px_rgba(0,255,65,0.1)] relative">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
                >
                  ✕
                </button>
                
                <h2 className="text-xl font-bold text-white mb-8 border-b border-[#222] pb-4 tracking-wider">
                  {language === 'pt' ? 'CONFIGURAÇÕES' : (language === 'es' ? 'CONFIGURACIÓN' : 'TERMINAL SETTINGS')}
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-neon tracking-widest mb-2 uppercase">
                      {language === 'pt' ? 'APELIDO DE OPERADOR' : 'OPERATOR ALIAS'}
                    </label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#050505] border border-[#222] text-white p-3 focus:border-neon focus:bg-[#0a0a0a] focus:outline-none transition-all uppercase font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neon tracking-widest mb-2 uppercase">
                      {language === 'pt' ? 'INTERFACE GRÁFICA' : 'INTERFACE STYLE'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                       <button 
                        onClick={() => onUIStyleChange('NEW')} 
                        className={`py-2 text-[10px] border font-black tracking-widest ${uiStyle === 'NEW' ? 'bg-neon text-black border-neon shadow-[0_0_15px_rgba(var(--neon-rgb),0.3)]' : 'bg-black text-gray-500 border-[#333] hover:border-white'}`}
                       >
                        UI NOVA
                       </button>
                       <button 
                        onClick={() => onUIStyleChange('STANDARD')} 
                        className={`py-2 text-[10px] border font-black tracking-widest ${uiStyle === 'STANDARD' ? 'bg-neon text-black border-neon shadow-[0_0_15px_rgba(var(--neon-rgb),0.3)]' : 'bg-black text-gray-500 border-[#333] hover:border-white'}`}
                       >
                        UI PADRÃO
                       </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neon tracking-widest mb-2 uppercase">
                      {language === 'pt' ? 'IDIOMA DO SISTEMA' : (language === 'es' ? 'IDIOMA DEL SISTEMA' : 'SYSTEM LANGUAGE')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                       <button onClick={() => setLanguage('pt')} className={`py-2 text-xs border ${language === 'pt' ? 'bg-neon text-black border-neon' : 'bg-black text-gray-500 border-[#333] hover:border-white'}`}>PT-BR</button>
                       <button onClick={() => setLanguage('en')} className={`py-2 text-xs border ${language === 'en' ? 'bg-neon text-black border-neon' : 'bg-black text-gray-500 border-[#333] hover:border-white'}`}>USA (EN)</button>
                       <button onClick={() => setLanguage('es')} className={`py-2 text-xs border ${language === 'es' ? 'bg-neon text-black border-neon' : 'bg-black text-gray-500 border-[#333] hover:border-white'}`}>ESP (ES)</button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#111]">
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex-1 bg-neon text-black font-bold py-3 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all uppercase text-xs tracking-widest"
                    >
                      {loading ? '...' : (language === 'pt' ? 'SALVAR' : 'SAVE')}
                    </button>
                    <button 
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex-1 bg-transparent text-red-500 border border-red-900/50 font-bold py-3 hover:bg-red-900/10 hover:border-red-500 transition-all uppercase text-xs tracking-widest"
                    >
                      {language === 'pt' ? 'SAIR' : 'EXIT'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in zoom-in-95 duration-200">
               <div className="w-full max-w-sm bg-black border border-red-900 p-8 text-center relative shadow-[0_0_80px_rgba(255,0,0,0.15)]">
                  <div className="text-red-600 mb-6">
                    <svg className="w-16 h-16 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">
                    {language === 'pt' ? 'CONFIRMAR SAÍDA' : 'CONFIRM LOGOUT'}
                  </h3>
                  
                  <div className="flex gap-4 mt-8">
                    <button 
                      onClick={() => setShowLogoutConfirm(false)}
                      className="flex-1 py-3 border border-[#333] text-gray-400 hover:text-white hover:border-white transition-all uppercase font-bold text-[10px] tracking-widest"
                    >
                      CANCEL
                    </button>
                    <button 
                      onClick={() => {
                        setShowLogoutConfirm(false);
                        setShowSettings(false);
                        onLogout();
                      }}
                      className="flex-1 py-3 bg-red-600 text-black hover:bg-red-500 uppercase font-bold text-[10px] tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                      LOGOUT
                    </button>
                  </div>
               </div>
            </div>
          )}

          <main className="flex-1 relative">
            {children}
          </main>
        </div>
      )}
    </>
  );
};