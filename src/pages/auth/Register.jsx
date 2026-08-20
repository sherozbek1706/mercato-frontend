import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  User,
  Lock,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import TelegramWidget from "../../components/auth/TelegramWidget";

const Register = () => {
  const { fetchUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [telegramData, setTelegramData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const botUsername =
    import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "mercato_game_bot";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTelegramAuth = (user) => {
    setTelegramData(user);
    toast.success("Telegram orqali muvaffaqiyatli tasdiqlandi!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!telegramData) {
      toast.error("Iltimos, avval Telegram orqali tasdiqlang!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        ...formData,
        telegramData,
      });
      localStorage.setItem("token", res.data.token);
      await fetchUser();
      toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="glass-panel p-8 relative overflow-hidden group">
          {/* Subtle gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-tl from-secondary/30 to-primary/30 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 shadow-lg mb-4"
            >
              <UserPlus className="w-8 h-8 text-secondary" />
            </motion.div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
              Yangi O'yinchi
            </h2>
            <p className="text-slate-400 text-sm">
              Sarguzashtni boshlash uchun ro'yxatdan o'ting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {/* Telegram verification section */}
            <div className="mb-6">
              {!telegramData ? (
                <div className="bg-slate-900/60 p-5 rounded-xl border border-dashed border-slate-600 text-center backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                  <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto mb-3 opacity-80" />
                  <p className="text-sm text-slate-300 mb-4 font-medium">
                    Firibgarlik (ferma) ni oldini olish uchun akkauntingizni Telegram bilan bog'lashingiz shart.
                  </p>
                  <div className="flex justify-center">
                    <TelegramWidget
                      botName={botUsername}
                      onAuth={handleTelegramAuth}
                    />
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-center space-x-4 backdrop-blur-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <img
                    src={telegramData.photo_url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  />
                  <div>
                    <p className="font-bold flex items-center text-emerald-400 text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Telegram tasdiqlandi
                    </p>
                    <p className="text-slate-300 text-xs font-medium">
                      {telegramData.first_name} {telegramData.last_name}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Foydalanuvchi nomi"
                    className="pl-10 w-full input-glass h-12 text-base transition-all focus:bg-slate-800/80"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Xavfsiz parol kiriting"
                    className="pl-10 w-full input-glass h-12 text-base transition-all focus:bg-slate-800/80"
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={!telegramData || isSubmitting}
              className={`w-full h-12 mt-6 flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300 rounded-lg shadow-lg font-bold text-lg
                ${
                  telegramData && !isSubmitting
                    ? "bg-secondary hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-[1.02]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                }
              `}
            >
              <span className="relative z-10">
                {isSubmitting ? 'Bajarilmoqda...' : 'Boshlash'}
              </span>
              {telegramData && !isSubmitting && (
                <ArrowRight className="w-5 h-5 relative z-10" />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-slate-400">
              Allaqachon akkauntingiz bormi?{" "}
              <Link
                to="/login"
                className="text-secondary hover:text-purple-400 font-semibold transition-colors"
              >
                Tizimga kirish
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
