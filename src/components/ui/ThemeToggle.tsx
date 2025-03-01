// src/components/ui/ThemeToggle.tsx
"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { name: "light", icon: Sun, label: "Clair" },
    { name: "dark", icon: Moon, label: "Sombre" },
    { name: "system", icon: Monitor, label: "Système" },
  ];

  const currentThemeData = themes.find(t => t.name === theme) || themes[0];
  const CurrentIcon = currentThemeData.icon;

  return (
    <div className="relative">
      {/* Bouton principal */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-10 h-10 rounded-xl transition-all duration-300",
          "hover:bg-gray-100 dark:hover:bg-white/10",
          "border border-gray-200 dark:border-white/20",
          resolvedTheme === "dark" 
            ? "bg-slate-800/50 text-white" 
            : "bg-gray-50 text-gray-700 shadow-sm"
        )}
      >
        <CurrentIcon className="h-5 w-5 transition-transform duration-300" />
        
        {/* Indicateur de mode actuel */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 transition-all duration-300",
          resolvedTheme === "dark" 
            ? "bg-blue-500 border-slate-800" 
            : "bg-yellow-500 border-white",
          "animate-pulse"
        )} />
      </Button>

      {/* Menu déroulant */}
      {isOpen && (
        <>
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-12 z-20 w-48 py-2 bg-white/95 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-white/20 shadow-2xl">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.name;
              
              return (
                <button
                  key={themeOption.name}
                  onClick={() => {
                    setTheme(themeOption.name as "light" | "dark" | "system");
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-sm transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-white/10",
                    isActive 
                      ? "bg-gradient-to-r from-yellow-400/20 to-orange-400/20 text-yellow-700 dark:text-yellow-200" 
                      : "text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{themeOption.label}</span>
                  
                  {/* Indicateur actif */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
            
            {/* Info sur le mode système */}
            {theme === "system" && (
              <div className="mx-4 mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-white/60">
                  Mode actuel : {resolvedTheme === "dark" ? "Sombre" : "Clair"}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Version simplifiée pour mobile
export function ThemeToggleSimple() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-xl transition-all duration-300",
        "hover:bg-gray-100 dark:hover:bg-white/20",
        "border border-gray-200 dark:border-white/20",
        resolvedTheme === "dark" 
          ? "bg-slate-800/50 text-white" 
          : "bg-gray-50 text-gray-700 shadow-sm"
      )}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-300 rotate-0" />
      )}
    </Button>
  );
}