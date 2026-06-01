import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  MessageCircle,
  Video,
  Users,
} from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useFileHandler, useInputValidation } from "6pp";
import { userExists } from "@/redux/reducers/auth";
import { emailValidator, usernameValidator } from "@/utils/features";
import ToggleThemeBtn from "@/components/shared/ToggleThemeBtn";
import api from "@/utils/axiosInstace.util";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const name = useInputValidation("");
  const email = useInputValidation("");
  const bio = useInputValidation("");
  const username = useInputValidation("", usernameValidator);
  const password = useInputValidation("", emailValidator);
  const avatar = useFileHandler("single");

  const dispatch = useDispatch();

  const toggleLogin = () => setIsLogin((prev) => !prev);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Connecting to Hellotalk...");
    setIsLoading(true);

    try {
      const { data } = await api.post(`/user/login`, {
        username: username.value,
        password: password.value,
      });
      dispatch(userExists(data.data));
      toast.success(data.message, { id: toastId });
    } catch (error) {
      toast.error(
        ((error as AxiosError).response?.data as any).message ||
          "Failed to authenticate",
        { id: toastId },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Setting up your chat bubble...");
    setIsLoading(true);

    const formData = new FormData();
    formData.append("avatar", avatar.file!);
    formData.append("email", email.value!);
    formData.append("name", name.value);
    formData.append("bio", bio.value);
    formData.append("username", username.value);
    formData.append("password", password.value);

    try {
      const { data } = await api.post(`/user/new`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(userExists(data.data));
      toast.success(data.message, { id: toastId });
    } catch (error) {
      toast.error(
        ((error as AxiosError).response?.data as any).message ||
          "Failed to create profile",
        { id: toastId },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      isLogin={isLogin}
      toggleLogin={toggleLogin}
      handleLogin={handleLogin}
      handleSignUp={handleSignUp}
      isLoading={isLoading}
      avatar={avatar}
      name={name}
      bio={bio}
      username={username}
      password={password}
      email={email}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
    />
  );
};

export default Login;

const AuthCard = ({
  isLogin,
  toggleLogin,
  handleLogin,
  handleSignUp,
  isLoading,
  avatar,
  name,
  bio,
  username,
  password,
  email,
  showPassword,
  setShowPassword,
}: any) => {
  return (
    <div className="min-h-screen w-full flex bg-[#fafafc] dark:bg-[#070709] p-4 md:p-6 text-sm font-sans antialiased relative overflow-hidden transition-colors duration-500 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      {/* 1. CINEMATIC BACKGROUND CANVAS (Soft Warm Organic Orbs) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] bg-[#f7ebd9] dark:bg-[#1c1912] rounded-full blur-[130px]"
          animate={{ scale: [1, 1.06, 1], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] bg-[#e3e3e8] dark:bg-[#111216] rounded-full blur-[120px]"
          animate={{ scale: [1, 1.1, 1], x: [0, -30, 0] }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Floating Theme Switcher Custom Overlay */}
      <div className="absolute top-6 right-6 z-50">
        <ToggleThemeBtn className="rounded-full cursor-pointer p-2.5 border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-[#0f0f12]/70 backdrop-blur-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors shadow-sm" />
      </div>

      {/* --- CHAT-APPLICATION CONCEPT DUAL VIEWPORT CONTAINER --- */}
      <div className="w-full max-w-5xl mx-auto my-auto h-full max-h-[760px] bg-white/60 dark:bg-[#0f0f12]/50 backdrop-blur-2xl border border-neutral-200/60 dark:border-neutral-800/40 shadow-[0_30px_70px_rgba(0,0,0,0.03)] dark:shadow-[0_40px_90px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden flex relative z-10">
        {/* LEFT COMPANION HERO SCREEN: Social Community Vibe (Hidden on Mobile panels) */}
        <div className="hidden md:flex md:w-[42%] bg-neutral-50/50 dark:bg-[#131317]/40 border-r border-neutral-200/60 dark:border-neutral-800/40 flex-col justify-between p-10 relative">
          {/* Decorative Top Segment */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-neutral-950 dark:bg-white flex items-center justify-center shadow-md">
              <img
                src="/logo.png"
                alt="Hellotalk"
                className="w-5 h-5 object-contain dark:invert"
              />
            </div>
            <span className="font-semibold tracking-tight text-neutral-900 dark:text-white text-base">
              Hellotalk
            </span>
          </div>

          {/* Social Vibe Card Interface Stacks */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-widest text-[#bba175] uppercase block">
                Real-time Calling
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                {isLogin
                  ? "Welcome back to the bubble."
                  : "Your circle is waiting for you."}
              </h3>
            </div>

            {/* Micro Chat UI simulation cards - Communicates immediately that this is a chat app */}
            <div className="pt-2 space-y-3">
              <div className="bg-white/90 dark:bg-[#1a1a22]/80 border border-neutral-200/50 dark:border-neutral-800/50 p-3.5 rounded-2xl flex items-start gap-3 shadow-sm max-w-[280px]">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Text Channels
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight">
                    Drop messages, links, files, and high-quality reactions
                    instantly.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 dark:bg-[#1a1a22]/80 border border-neutral-200/50 dark:border-neutral-800/50 p-3.5 rounded-2xl flex items-start gap-3 shadow-sm max-w-[280px] translate-x-4">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Video Spaces
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight">
                    Crystal clear peer-to-peer audio and dynamic room layouts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Active Presence indicators */}
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            <Users className="w-4 h-4" />
            Join thousands chatting today
          </div>
        </div>

        {/* RIGHT CORE CONTROLLER INTERFACE: Beautifully proportioned form canvas */}
        <div className="flex-grow flex flex-col justify-center px-6 py-12 md:p-12 lg:p-16 bg-white/40 dark:bg-transparent">
          <div className="max-w-[340px] w-full mx-auto space-y-8">
            {/* Header Identity Zone */}
            <div className="space-y-2 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="md:hidden w-10 h-10 rounded-2xl bg-neutral-950 dark:bg-white flex items-center justify-center shadow-md mb-2">
                <img
                  src="/logo.png"
                  alt="Hellotalk"
                  className="w-5 h-5 object-contain dark:invert"
                />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {isLogin ? "Sign In" : "Create Profile"}
              </h2>
              <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                {isLogin
                  ? "Hop back into your conversation streams."
                  : "Claim your username and launch your space."}
              </p>
            </div>

            {/* Input Form Fields Matrix */}
            <div className="w-full">
              <AnimatePresence mode="wait" initial={false}>
                <motion.form
                  key={isLogin ? "login" : "signup"}
                  onSubmit={isLogin ? handleLogin : handleSignUp}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Premium Round Consumer Avatar Node */}
                  {!isLogin && (
                    <div className="flex flex-col items-center justify-center pb-2">
                      <div className="relative w-18 h-18 group">
                        <img
                          src={avatar.preview || "/default-avatar.png"}
                          alt="Profile Node"
                          className="w-18 h-18 rounded-full object-cover border border-neutral-200 dark:border-neutral-800 bg-[#f8f8fa] dark:bg-[#141418] relative z-10"
                        />
                        <label className="absolute bottom-0 right-0 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 p-1.5 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md z-20 border border-white dark:border-[#0f0f12]">
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            onChange={avatar.changeHandler}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {avatar.error && (
                        <p className="text-rose-500 text-xs font-medium mt-2">
                          {avatar.error}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Text Input Branches */}
                  {!isLogin && (
                    <div className="space-y-3.5">
                      <input
                        type="text"
                        placeholder="Display name"
                        value={name.value}
                        onChange={name.changeHandler}
                        className="w-full px-4 h-11 border rounded-2xl bg-white dark:bg-[#16161c]/60 text-neutral-900 dark:text-neutral-100 border-neutral-200/80 dark:border-[#24242e] focus:border-neutral-900 dark:focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/[0.02] dark:focus:ring-white/[0.01] outline-none transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-[13px]"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email.value}
                        onChange={email.changeHandler}
                        className="w-full px-4 h-11 border rounded-2xl bg-white dark:bg-[#16161c]/60 text-neutral-900 dark:text-neutral-100 border-neutral-200/80 dark:border-[#24242e] focus:border-neutral-900 dark:focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/[0.02] dark:focus:ring-white/[0.01] outline-none transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-[13px]"
                      />
                      <input
                        type="text"
                        placeholder="Set a bio status..."
                        value={bio.value}
                        onChange={bio.changeHandler}
                        className="w-full px-4 h-11 border rounded-2xl bg-white dark:bg-[#16161c]/60 text-neutral-900 dark:text-neutral-100 border-neutral-200/80 dark:border-[#24242e] focus:border-neutral-900 dark:focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/[0.02] dark:focus:ring-white/[0.01] outline-none transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-[13px]"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username.value}
                      onChange={username.changeHandler}
                      className="w-full px-4 h-11 border rounded-2xl bg-white dark:bg-[#16161c]/60 text-neutral-900 dark:text-neutral-100 border-neutral-200/80 dark:border-[#24242e] focus:border-neutral-900 dark:focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/[0.02] dark:focus:ring-white/[0.01] outline-none transition-all placeholder-neutral-400 dark:placeholder-neutral-500 text-[13px]"
                    />
                    {username.error && (
                      <p className="text-rose-500 text-xs font-medium pl-1">
                        {username.error}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password.value}
                      onChange={password.changeHandler}
                      className="w-full px-4 h-11 border rounded-2xl bg-white dark:bg-[#16161c]/60 text-neutral-900 dark:text-neutral-100 border-neutral-200/80 dark:border-[#24242e] focus:border-neutral-900 dark:focus:border-neutral-400 focus:ring-4 focus:ring-neutral-900/[0.02] dark:focus:ring-white/[0.01] outline-none transition-all placeholder-neutral-400 dark:placeholder-neutral-500 pr-11 text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-0.5"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Rounded Premium Conversational CTA */}
                  <div className="pt-2">
                    <motion.button
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-2xl bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-semibold text-[13px] tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm"
                    >
                      {isLogin ? "Sign In" : "Start Chatting"}
                      {!isLogin && (
                        <Sparkles className="w-4 h-4 text-[#bba175] dark:text-amber-600 fill-current/10" />
                      )}
                    </motion.button>
                  </div>
                </motion.form>
              </AnimatePresence>
            </div>

            {/* Bottom View Switch Link */}
            <div className="text-center pt-5">
              <p className="text-[13px] text-neutral-400 dark:text-neutral-500">
                {isLogin ? "New to Hellotalk?" : "Already chatting?"}{" "}
                <button
                  type="button"
                  onClick={toggleLogin}
                  className="text-neutral-950 dark:text-white font-bold hover:underline underline-offset-4 ml-1 cursor-pointer transition-all"
                >
                  {isLogin ? "Create account free" : "Log in"}
                </button>
              </p>
            </div>
          </div>

          {/* Secure Network Trace Footer */}
          <div className="w-full flex items-center justify-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 pt-4 border-t border-neutral-100 dark:border-neutral-900">
            <Shield className="w-3.5 h-3.5 text-neutral-400" /> Secure encrypted
            platform connection
          </div>
        </div>
      </div>
    </div>
  );
};
