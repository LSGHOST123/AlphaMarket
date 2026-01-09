import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Session handled by App.tsx subscription
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.href }
        });
        if (error) throw error;
        setMessage({ text: "Account created! Check your inbox to verify.", type: 'success' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon/5 via-black to-black"></div>
      
      <div className="w-full max-w-md bg-[#050505] border border-[#222] p-10 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white font-mono tracking-tighter mb-2 italic">
            ALPHA<span className="text-neon neon-text-glow">ID</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">Secure Access Gateway v2.4</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 text-xs font-mono border ${message.type === 'error' ? 'border-red-900 text-red-500 bg-red-900/10' : 'border-neon text-neon bg-neon/10'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono text-neon tracking-widest mb-2 uppercase">Identifier (Email)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-[#222] text-white p-4 focus:border-neon focus:outline-none transition-colors font-mono placeholder-gray-800"
              placeholder="ENTER EMAIL ADDRESS"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-neon tracking-widest mb-2 uppercase">Passphrase</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-[#222] text-white p-4 pr-12 focus:border-neon focus:outline-none transition-colors font-mono placeholder-gray-800"
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-neon transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div className="flex items-center gap-3">
             <div 
               onClick={() => setRememberMe(!rememberMe)}
               className={`w-4 h-4 border border-[#333] cursor-pointer flex items-center justify-center ${rememberMe ? 'bg-neon border-neon' : 'bg-black'}`}
             >
                {rememberMe && <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
             </div>
             <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
               Keep Session Active
             </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neon text-black font-black py-4 hover:bg-white transition-colors uppercase tracking-[0.2em] font-mono disabled:opacity-50 text-xs shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {loading ? 'PROCESSING...' : (isLogin ? 'INITIATE SESSION' : 'REGISTER IDENTITY')}
          </button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-[#111]">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage(null); }}
            className="text-[10px] font-mono text-gray-600 hover:text-neon transition-colors uppercase tracking-widest"
          >
            {isLogin ? "CREATE ACCOUNT" : "LOGIN ACCOUNT"}
          </button>
        </div>
      </div>
    </div>
  );
};