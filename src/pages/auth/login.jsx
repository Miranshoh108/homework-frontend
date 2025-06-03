import { User, Lock, Building2, UserCheck } from "lucide-react";

import React, { useState } from "react";
import Logo from "../../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { $axios } from "../../http";
import { notification } from "../../components/notification";

export default function Login() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("projects");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { login, password } = e.target;

    try {
      const res = await $axios.post(
        "/auth/login",
        {
          login_id: login.value,
          password: password.value,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate("/");
      }
    } catch (error) {
      notification(error.response.data?.message);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-tr from-white via-emerald-50 to-white p-10 flex items-center justify-center backdrop-blur-md">
      <div className="w-full h-full flex ">
        {/* Chap panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#249B73] to-[#1e7a5f] p-12 flex-col justify-center text-white relative overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="relative z-10">
            <div className="mb-8 flex flex-col items-center justify-center">
              <div className="w-50   rounded-2xl flex items-center justify-center mb-6">
                <img className="w-[250px] mx-auto " src={Logo} alt="" />
              </div>
              <h1 className="text-3xl font-bold mb-2">BOJXONASERVIS.UZ</h1>
              <div className="w-16 h-1 bg-white/60 rounded-full"></div>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl text-center font-semibold leading-tight">
                DAVLAT DAROMADIGA O'TKAZILGAN MOL-MULKNI SAQLASH VA SOTISHNING
                RAQAMLASHTIRIRILGAN TIZIMI
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">
                    Raqamli yechimlar orqali shaffoflik va samaradorlik
                    ta'minlanadi!
                  </p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm leading-relaxed">
                    Bojxona tartiblarini raqamlashtirish orqali faoliyat
                    samaradorligini oshiradi!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* O'ng panel (login forma) */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center rounded-3xl">
          <div className="max-w-md mx-auto w-full">
            {/* Mobil header */}
            <div className="lg:hidden mb-8 text-center">
              <div className="w-16 h-16 bg-[#249B73] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#249B73]">
                BOJXONASERVIS.UZ
              </h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Kirish</h2>
              <p className="text-gray-600 leading-relaxed">
                Iltimos, login va parol olish uchun Bojxona servis IT jamoasiga
                murojaat qiling!
              </p>
            </div>

            {/* Lavozim tanlash */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sizning lavozimingiz nima?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: "projects",
                    label: "Bojxona servis xodimi",
                    icon: <User />,
                  },
                  { key: "designs", label: "Rahbar", icon: <UserCheck /> },
                ].map(({ key, label, icon }) => (
                  <div
                    key={key}
                    onClick={() => setSelected(key)}
                    className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selected === key
                        ? "border-[#249B73] bg-[#249B73]/5 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected === key
                          ? "border-[#249B73]"
                          : "border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          selected === key
                            ? "bg-[#249B73] scale-100"
                            : "bg-transparent scale-0"
                        }`}
                      ></div>
                    </div>
                    <div className="flex items-center gap-2">
                      {React.cloneElement(icon, {
                        className: `w-4 h-4 ${
                          selected === key ? "text-[#249B73]" : "text-gray-500"
                        }`,
                      })}
                      <span
                        className={`text-sm font-medium ${
                          selected === key ? "text-[#249B73]" : "text-gray-700"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Login forma */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="login"
                  className="block text-sm font-medium text-gray-700 mb-2 "
                >
                  Login
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="login"
                    name="login"
                    placeholder="admin"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#249B73] bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Parol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="parol"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#249B73] bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#249B73] hover:bg-[#1e7a5f] text-white font-semibold py-3 px-6 rounded-lg transition-all"
              >
                Kirish
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                © 2025 Bojxona Servis. Barcha huquqlar himoyalangan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
