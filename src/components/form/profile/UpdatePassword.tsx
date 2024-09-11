"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserQuery } from "@/hooks/useUserQuery";
import {
  UpdatePasswordPayload,
  passwordSchema,
  updatePasswordSchema,
} from "@/validators/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SubmitButton } from "../SubmitButton";

const UpdatePassword = () => {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordPayload>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const { updatePassword } = useUserQuery();

  const onSubmit: SubmitHandler<Omit<UpdatePasswordPayload, "userId">> = async (
    data,
  ) => {
    await updatePassword({
      userId: session?.user.id as string,
      password: data.password,
      newPassword: data.newPassword,
      reset,
    });

    reset();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <Input
          placeholder="Mot de passe actuel"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
      </div>
      <div className="mb-2">
        <Input
          placeholder="Nouveau mot de passe"
          type="password"
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />
      </div>
      <div className="flex justify-end">
        <SubmitButton
          variant="outline"
          label={isSubmitting ? "Chargement..." : "Modifier"}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default UpdatePassword;
