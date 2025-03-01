import { RegisterPayload } from "@/validators/registerSchema";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../ui/input";

type NameFieldsProps = {
  register: UseFormRegister<RegisterPayload>;
  errors: FieldErrors<RegisterPayload>;
};

export const NameFields = ({ register, errors }: NameFieldsProps) => (
  <div className="flex w-full gap-2">
    <Input
      label="Nom*"
      className="h-12 w-full"
      placeholder="Entrez votre nom"
      type="text"
      aria-label="Nom"
      error={errors.firstname?.message as string}
      {...register("firstname")}
    />
    <Input
      label="Prénom*"
      className="h-12 w-full"
      placeholder="Entrez votre prénom"
      type="text"
      aria-label="Prénom"
      error={errors.lastname?.message as string}
      {...register("lastname")}
    />
  </div>
);
