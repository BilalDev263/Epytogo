"use client";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import { useUserQuery } from "@/hooks/useUserQuery";
import { ContainerForm } from "./form/ContainerForm";
import { AuthLink } from "./form/Redirection";
import { Title } from "./ui/title";
import { RegisterPayload, RegisterSchema } from "@/validators/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordStrength } from "check-password-strength";
import { SubmitButton } from "./form/SubmitButton";
import { TermsAndConditions } from "./form/register/TermsAndConditions";
import { PasswordFields } from "./form/register/PasswordFIeld";
import { NameFields } from "./form/register/NameFields";
import { EmailField } from "./form/register/EmailField";
import { Carousel } from "@/components/Carousel";

export const Register = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const isRegisterPage = pathname === "/register";
  const [strength, setStrength] = useState(0);
  const { registerUser } = useUserQuery();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(RegisterSchema),
  });

  const password = watch("password");

  useEffect(() => {
    if (password) setStrength(passwordStrength(password).id);
  }, [password]);

  const save: SubmitHandler<RegisterPayload> = async (data) => {
    await registerUser({
      data,
      reset,
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center lg:flex-row">
      <Carousel className="w-4/6 text-white" />
      <ContainerForm handleSubmit={handleSubmit(save)} className="flex-1">
        <Title
          tag="h2"
          className="w-full text-start text-2xl font-semibold tracking-tight"
        >
          Inscrivez-vous
        </Title>
        <NameFields register={register} errors={errors} />
        <EmailField register={register} errors={errors} />
        <PasswordFields
          register={register}
          errors={errors}
          strength={strength}
        />

        <div className="flex items-center w-full">
          <TermsAndConditions control={control} errors={errors} />
          <SubmitButton
            label={isSubmitting ? "Chargement..." : "S'inscrire"}
            disabled={isSubmitting}
          />
        </div>
        <AuthLink isRegisterPage={isRegisterPage} />
      </ContainerForm>
    </div>
  );
};
