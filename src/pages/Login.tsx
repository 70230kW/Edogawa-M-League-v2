import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calculator, Swords, BarChart2, Newspaper } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';

export const Login: React.FC = () => {
  const { signInWithGoogle } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { Icon: Calculator, text: 'Mリーグ公式ルール準拠のポイント自動計算' },
    { Icon: Swords, text: '役満・チョンボ記録（複合可否チェック付き）' },
    { Icon: BarChart2, text: '成績統計・グラフ分析' },
    { Icon: Newspaper, text: 'タイムライン・日報自動生成' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center space-y-8 relative"
      >
        {/* Logo */}
        <div className="space-y-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center"
          >
            <Trophy
              className="w-20 h-20 text-accent"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.6))' }}
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">MahjongLeague</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            仲間内のリーグ戦管理に特化した<br />麻雀成績管理アプリ
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2 text-left">
          {features.map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/60 text-sm">
              <Icon className="w-5 h-5 flex-shrink-0 text-accent/70" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <Button
          variant="gold"
          size="lg"
          className="w-full"
          onClick={handleLogin}
          loading={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </Button>

        <p className="text-white/20 text-xs">
          ログインすることでリーグを作成・参加できます
        </p>
      </motion.div>
    </div>
  );
};
