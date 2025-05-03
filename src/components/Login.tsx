// src/components/Login.tsx
"use client";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";
import { ContainerForm } from "./form/ContainerForm";
import { Title } from "@/components/ui/title";
import { AuthLink } from "./form/Redirection";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginPayload, loginSchema } from "@/validators/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitButton } from "./form/SubmitButton";
import { useUserQuery } from "@/hooks/useUserQuery";
import { EgyptianCarousel } from "./EgyptianCarousel";
import { GoogleAuthButton } from "./auth/GoogleAuthButton";

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
    <div className="flex h-screen flex-col items-center justify-center lg:flex-row">
      <EgyptianCarousel className="w-4/6 text-white" />
      <ContainerForm handleSubmit={handleSubmit(save)} className="flex-1">
        <Title
          tag="h2"
          className="w-full text-start text-2xl font-semibold tracking-tight"
        >
          Connectez-vous
        </Title>

        {/* Bouton Google */}
        <GoogleAuthButton callbackUrl={callbackUrl} isLoading={isSubmitting} />

        {/* Séparateur */}
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Ou continuez avec
            </span>
          </div>
        </div>

        <Input
          className="h-12 w-full"
          placeholder="Entrez votre email"
          type="email"
          aria-label="Adresse e-mail"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          className="h-12 w-full"
          placeholder="Entrez votre mot de passe"
          type="password"
          aria-label="Mot de passe"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center w-full justify-between">
          <AuthLink isRegisterPage={isRegisterPage} />
          <SubmitButton
            label={isSubmitting ? "Chargement..." : "Se connecter"}
            disabled={isSubmitting}
          />
        </div>
      </ContainerForm>
    </div>
  );
};