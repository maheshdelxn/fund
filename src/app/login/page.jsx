'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api-client';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Small artificial delay for animation smoothness if response is too fast
      await new Promise(r => setTimeout(r, 800));

      const res = await authAPI.login({ email, password });

      if (res.success) {
        toast.success("लॉगिन यशस्वी!", {
          description: "शिवांजली फंड मध्ये आपले स्वागत आहे."
        });
        router.push('/dashboard');
      } else {
        toast.error("लॉगिन अयशस्वी", {
          description: res.error || "कृपया ईमेल आणि पासवर्ड तपासा."
        });
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("काहीतरी चूक झाली", {
        description: "कृपया पुन्हा प्रयत्न करा."
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 md:p-12">

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              शिवांजली फंड
            </h2>
            <p className="text-gray-500 font-medium">स्वागत आहे / नमस्ते</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">ईमेल</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none font-medium text-gray-700"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">पासवर्ड</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none font-medium text-gray-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-200/50 transform transition-all active:scale-[0.98]",
                isLoading ? "opacity-90 cursor-not-allowed" : "hover:-translate-y-0.5"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  तपासत आहे...
                </>
              ) : (
                <>
                  लॉगिन करा <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>


        </div>

        <p className="text-center mt-6 text-gray-500 text-sm font-medium">
          शिवांजली चॅरिटेबल ट्रस्ट
        </p>
      </div>
    </div>
  );
}