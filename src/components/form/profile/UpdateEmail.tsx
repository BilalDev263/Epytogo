"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserQuery } from "@/hooks/useUserQuery";
import { UpdateEmailPayload, emailSchema } from "@/validators/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SubmitButton } from "../SubmitButton";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";

const UpdateEmail = () => {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<UpdateEmailPayload>({
    resolver: zodResolver(emailSchema),
  });

  const { updateEmail } = useUserQuery();

  const onSubmit: SubmitHandler<UpdateEmailPayload> = async ({ email }) => {
    await updateEmail({
      userId: session?.user.id as string,
      email,
      reset,
    });

    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-2">
        <Input
          placeholder="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />
      </div>
      <div className="flex justify-end">
        <SubmitButton
          label={isSubmitting ? "Chargement..." : "Modifier"}
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default UpdateEmail;
