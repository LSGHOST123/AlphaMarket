import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient.ts';
import { Layout } from './components/Layout.tsx';
import { Landing } from './pages/Landing.tsx';
import { Auth } from './pages/Auth.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { AssetDetail } from './pages/AssetDetail.tsx';
import { AppScreen, UIStyle } from './types.ts';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.LANDING);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string>("NASDAQ:AAPL");
  const [language, setLanguage] = useState<'en' | 'pt' | 'es'>('en');
  const [uiStyle, setUiStyle] = useState<UIStyle>('NEW');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleUserSession(session.user);
        const savedLang = session.user.user_metadata?.language;
        if (savedLang) setLanguage(savedLang);
        const savedUI = session.user.user_metadata?.uiStyle;
        if (savedUI) setUiStyle(savedUI);
      } else {
        handleUserSession(null);
      }
      setIsLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUserSession(session?.user ?? null);
      if (session?.user?.user_metadata?.language) {
         setLanguage(session.user.user_metadata.language);
      }
      if (session?.user?.user_metadata?.uiStyle) {
         setUiStyle(session.user.user_metadata.uiStyle);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = (user: User | null) => {
    setSessionUser(user);
    if (user) {
      if (user.email_confirmed_at) {
        setScreen((prev) => (prev === AppScreen.LOGIN || prev === AppScreen.LANDING) ? AppScreen.DASHBOARD : prev);
      } else {
        setScreen(AppScreen.VERIFY_EMAIL);
      }
    } else {
      setScreen(AppScreen.LANDING);
    }
  };

  const handleAssetSelect = (symbol: string) => {
    setSelectedAsset(symbol);
    setScreen(AppScreen.ASSET_DETAIL);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setScreen(AppScreen.LOGIN);
  };

  const handleLogoClick = () => {
    if (screen === AppScreen.ASSET_DETAIL) {
      setScreen(AppScreen.DASHBOARD);
    } else {
      setScreen(AppScreen.LANDING);
    }
  };

  const handleLanguageChange = async (lang: 'en' | 'pt' | 'es') => {
    setLanguage(lang);
    if (sessionUser) {
      await supabase.auth.updateUser({
        data: { language: lang }
      });
    }
  };

  const handleUIStyleChange = async (style: UIStyle) => {
    setUiStyle(style);
    if (sessionUser) {
      await supabase.auth.updateUser({
        data: { uiStyle: style }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-l-2 border-neon rounded-full animate-spin"></div>
          <div className="text-neon font-mono text-xs tracking-widest animate-pulse">
            INITIALIZING ALPHA MARKET...
          </div>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.LANDING:
        return <Landing onStart={() => setScreen(sessionUser ? AppScreen.DASHBOARD : AppScreen.LOGIN)} />;
      
      case AppScreen.LOGIN:
        return <Auth onSuccess={() => {}} />;
      
      case AppScreen.VERIFY_EMAIL:
        return (
          <div className="min-h-screen bg-black flex items-center justify-center text-center p-4">
            <div className="bg-[#050505] border border-red-900 p-8 max-w-md shadow-2xl">
              <h2 className="text-xl text-red-500 font-mono font-bold mb-4">ACCESS DENIED</h2>
              <p className="text-gray-400 mb-6 font-mono text-sm">
                Identity verification pending. Check your inbox for the confirmation link sent to:
                <br /><span className="text-white mt-2 block">{sessionUser?.email}</span>
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-900 text-white px-6 py-3 border border-gray-800 font-mono hover:bg-gray-800 hover:border-gray-600 w-full mb-3 text-xs tracking-widest"
              >
                CHECK STATUS
              </button>
              <button 
                onClick={handleLogout} 
                className="text-gray-600 text-[10px] hover:text-white font-mono underline uppercase"
              >
                TERMINATE SESSION
              </button>
            </div>
          </div>
        );

      case AppScreen.DASHBOARD:
        return <Dashboard onSelectAsset={handleAssetSelect} language={language} />;
      
      case AppScreen.ASSET_DETAIL:
        return <AssetDetail symbol={selectedAsset} language={language} uiStyle={uiStyle} />;
        
      default:
        return <div>Error: Unknown State</div>;
    }
  };

  return (
    <Layout 
      currentScreen={screen} 
      userEmail={sessionUser?.email}
      onNavigate={setScreen}
      onLogout={handleLogout}
      language={language}
      setLanguage={handleLanguageChange} 
      uiStyle={uiStyle}
      onUIStyleChange={handleUIStyleChange}
      onLogoClick={handleLogoClick}
    >
      {renderScreen()}
    </Layout>
  );
};

export default App;