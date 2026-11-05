import React, { useState } from "react";
import { Settings, User, Palette, Check, LogOut, Moon, Plus, ChevronRight, Pipette } from "lucide-react";
import { cn } from "../utils/classNames";
import PageHeader from "../components/ui/PageHeader";

const THEME_COLORS = [
  { id: "#98e5dd", name: "Mint Original" },
  { id: "#a4bcf9", name: "Azul Fin" },
  { id: "#fca5a5", name: "Rosê" },
  { id: "#fcd34d", name: "Amarelo Ouro" },
  { id: "#c4b5fd", name: "Roxo Nuvem" },
  { id: "#86efac", name: "Verde Neo" },
];

export default function SettingsView({
  theme,
  setTheme,
  user,
  setToken,
  setUser,
  authFetch,
  showToast,
}) {
  const [localColor, setLocalColor] = useState(user?.theme_color || "#98e5dd");

  const handleColorBlur = async (colorToSave = localColor) => {
    try {
      const res = await authFetch("/api/user/theme-color", {
        method: "PUT",
        body: JSON.stringify({ theme_color: colorToSave }),
      });
      if (res.ok) {
        setUser((prev) => ({ ...prev, theme_color: colorToSave }));
        showToast("Cor do tema atualizada com sucesso!");
      } else {
        showToast("Erro ao atualizar cor", "error");
      }
    } catch (e) {
      showToast("Erro de rede ao atualizar cor", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <PageHeader
        icon={Settings}
        title="Configurações"
        subtitle="Personalize sua experiência e gerencie as preferências da sua conta."
        label="Sistema"
      />

      <div className="bg-fin-surface rounded-[24px] border border-zinc-900/10 dark:border-white/5 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-900/10 dark:border-white/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold text-2xl text-fin-mint border-2 border-zinc-700 shadow-inner">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              {user?.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-4">
              Preferências de Aparência
            </h4>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-zinc-200/50 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5">
              <div className="flex-1">
                <p className="font-semibold text-zinc-900 dark:text-white">
                  Tema do Sistema
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Alterne entre o modo Claro e Escuro.
                </p>
              </div>
              <div className="flex bg-zinc-200/50 dark:bg-black/40 p-1 rounded-xl border border-zinc-900/10 dark:border-white/5 w-full md:w-auto">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    theme === "light"
                      ? "bg-fin-surface text-zinc-900 dark:text-white shadow"
                      : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:text-white",
                  )}
                >
                  Claro
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    theme === "dark"
                      ? "bg-fin-surface text-zinc-900 dark:text-white shadow"
                      : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:text-white",
                  )}
                >
                  Escuro
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-zinc-200/50 dark:bg-black/20 rounded-2xl border border-zinc-900/10 dark:border-white/5">
              <div className="flex-1">
                <p className="font-semibold text-zinc-900 dark:text-white">
                  Cor Principal (Tema)
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Personalize a cor de destaque do FinTrack.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      "#98e5dd",
                      "#10b981",
                      "#3b82f6",
                      "#8b5cf6",
                      "#f43f5e",
                      "#f59e0b",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setLocalColor(color);
                          document.documentElement.style.setProperty(
                            "--mint",
                            color,
                          );
                          handleColorBlur(color);
                        }}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-transform shadow-sm",
                          localColor === color
                            ? "border-zinc-900 dark:border-white scale-110"
                            : "border-transparent hover:scale-105",
                        )}
                        style={{ backgroundColor: color }}
                        title="Selecionar cor"
                      />
                    ))}
                  </div>

                  <div
                    className={cn(
                      "relative w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-900/10 dark:border-white/10 shadow-lg flex-shrink-0 group transition-all",
                      ![
                        "#98e5dd",
                        "#10b981",
                        "#3b82f6",
                        "#8b5cf6",
                        "#f43f5e",
                        "#f59e0b",
                      ].includes(localColor)
                        ? "scale-110 border-zinc-900 dark:border-white"
                        : "hover:scale-110"
                    )}
                    style={{
                      background: ![
                        "#98e5dd",
                        "#10b981",
                        "#3b82f6",
                        "#8b5cf6",
                        "#f43f5e",
                        "#f59e0b",
                      ].includes(localColor)
                        ? localColor
                        : "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                    }}
                    title="Cor personalizada"
                  >
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/20 group-hover:bg-black/10 transition-colors">
                      <Pipette
                        size={18}
                        className="text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                    <input
                      type="color"
                      value={localColor}
                      onChange={(e) => {
                        setLocalColor(e.target.value);
                        document.documentElement.style.setProperty(
                          "--mint",
                          e.target.value,
                        );
                      }}
                      onBlur={() => handleColorBlur(localColor)}
                      className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLocalColor("#98e5dd");
                    document.documentElement.style.setProperty(
                      "--mint",
                      "#98e5dd",
                    );
                    handleColorBlur("#98e5dd");
                  }}
                  className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  Restaurar Padrão
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-4">
              Gerenciamento de Conta
            </h4>
            <button
              onClick={() => {
                setToken(null);
                setUser(null);
                localStorage.setItem("token", "");
              }}
              className="w-full flex items-center justify-between p-4 bg-zinc-200/50 dark:bg-black/20 hover:bg-[#ff7b7b]/10 group rounded-2xl border border-zinc-900/10 dark:border-white/5 transition-colors"
            >
              <div className="text-left">
                <p className="font-semibold text-zinc-900 dark:text-white group-hover:text-[#ff7b7b] transition-colors">
                  Sair da Conta
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 group-hover:text-[#ff7b7b]/70 transition-colors">
                  Encerrar sessão no dispositivo atual.
                </p>
              </div>
              <ChevronRight className="text-zinc-600 dark:text-zinc-500 group-hover:text-[#ff7b7b]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
