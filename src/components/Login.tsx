"use client";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { ContainerForm } from "./form/ContainerForm";
import { Title } from "@/components/ui/title";
import { AuthLink } from "./form/Redirection";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginPayload, loginSchema } from "@/validators/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Carousel } from "@/components/Carousel";
import { SubmitButton } from "./form/SubmitButton";
import { useUserQuery } from "@/hooks/useUserQuery";

type Props = {
  className?: string;
  callbackUrl?: string;
};

export const Login = ({ className, callbackUrl }: Props) => {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/register";
  const { loginUser } = useUserQuery();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
  });

  const save: SubmitHandler<LoginPayload> = async (data) =>
    await loginUser({
      data,
      reset,
      callbackUrl,
    });

  return (
    <div className="min-h-screen egyptian-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particules de sable animées */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="sand-particles"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Hiéroglyphes en arrière-plan */}
      <div className="absolute inset-0 egyptian-hieroglyphs opacity-10"></div>

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10">
        {/* Section gauche - Carousel égyptien */}
        <div className="w-full lg:w-3/5 relative">
          <div className="egyptian-float">
            <Carousel className="w-full text-white relative z-10" />
          </div>
          
          {/* Décoration pyramide */}
          <div className="absolute -top-10 -left-10 w-32 h-32 opacity-20 hidden lg:block">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-300">
              <polygon points="50,10 10,90 90,90" />
            </svg>
          </div>
        </div>

        {/* Section droite - Formulaire de connexion */}
        <div className="w-full lg:w-2/5">
          <div className="egyptian-card p-8 relative">
            {/* Bordure dorée animée */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 p-[2px] egyptian-glow">
              <div className="h-full w-full bg-white dark:bg-gray-900 rounded-2xl"></div>
            </div>

            {/* Contenu du formulaire */}
            <div className="relative z-10">
              {/* En-tête avec hiéroglyphes décoratifs */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                  <span className="mx-4 text-4xl">𓂀</span>
                  <div className="w-12 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                </div>
                
                <Title
                  tag="h2"
                  className="egyptian-title text-3xl font-bold mb-2"
                >
                  Bienvenue en Égypte
                </Title>
                
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Connectez-vous pour découvrir les merveilles du pays des pharaons
                </p>
              </div>

              <ContainerForm handleSubmit={handleSubmit(save)} className="space-y-6">
                {/* Champ email avec icône */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-amber-500 group-focus-within:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <Input
                    className="egyptian-input pl-10 h-12 text-base"
                    placeholder="📧 Votre adresse email"
                    type="email"
                    aria-label="Adresse e-mail"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                </div>

                {/* Champ mot de passe avec icône */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-amber-500 group-focus-within:text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    className="egyptian-input pl-10 h-12 text-base"
                    placeholder="🔒 Votre mot de passe"
                    type="password"
                    aria-label="Mot de passe"
                    error={errors.password?.message}
                    {...register("password")}
                  />
                </div>

                {/* Section boutons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <AuthLink isRegisterPage={isRegisterPage} />
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="egyptian-button min-w-[140px] relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Connexion...
                        </>
                      ) : (
                        <>
                          <span>Se connecter</span>
                          <span className="text-lg">𓋹</span>
                        </>
                      )}
                    </span>
                    
                    {/* Effet de brillance au hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </div>
              </ContainerForm>

              {/* Séparateur décoratif */}
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                  <span className="text-sm">𓈖</span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                  <span className="text-sm">𓊽</span>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                  <span className="text-sm">𓋾</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dunes stylisées en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-32 opacity-30">
        <svg viewBox="0 0 1200 120" className="w-full h-full">
          <path d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z" fill="url(#duneGradient)" />
          <defs>
            <linearGradient id="duneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 95%, 55%)" />
              <stop offset="100%" stopColor="hsl(40, 85%, 45%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};