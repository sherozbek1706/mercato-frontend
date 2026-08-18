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
} from "lucide-react";
import TelegramWidget from "../../components/auth/TelegramWidget";

const Register = () => {
  const { fetchUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    profession_id: "",
  });
  const [professions, setProfessions] = useState([]);
  const [telegramData, setTelegramData] = useState(null);
  const navigate = useNavigate();

  const botUsername =
    import.meta.env.VITE_TELEGRAM_BOT_USERNAME || "mercato_game_bot";

  useEffect(() => {
    // Kasblarni yuklash
    api
      .get("/professions")
      .then((res) => setProfessions(res.data))
      .catch((err) => console.error(err));
  }, []);

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
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Xush Kelibsiz
          </h2>
          <p className="text-blue-100 text-sm">
            Yangi o'yinchi sifatida ro'yxatdan o'ting
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!telegramData ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center">
                <p className="text-sm text-slate-600 mb-4">
                  Firibgarlik (ferma) ni oldini olish uchun akkauntingizni
                  Telegram bilan bog'lashingiz shart.
                </p>
                <TelegramWidget
                  botName={botUsername}
                  onAuth={handleTelegramAuth}
                />
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-center space-x-3 text-green-700">
                <img
                  src={telegramData.photo_url}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-bold flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Telegram ulangan
                  </p>
                  <p className="text-xs">
                    {telegramData.first_name} {telegramData.last_name}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Kichik harflarda, bo'sh joysiz"
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Parol
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Xavfsiz parol kiriting"
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kasb tanlang
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-400" />
                </div>
                <select
                  name="profession_id"
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 appearance-none"
                  onChange={handleChange}
                  required
                >
                  <option value="">Kasbni tanlang...</option>
                  {professions.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronRight className="h-4 w-4 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!telegramData}
              className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                telegramData
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Boshlash
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Allaqachon akkauntingiz bormi?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Kirish
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
