import { RegisterPayload } from "@/validators/registerSchema";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Checkbox } from "../../ui/checkbox";

type TermsAndConditionsProps = {
  control: Control<RegisterPayload>;
  errors: FieldErrors<RegisterPayload>;
};

export const TermsAndConditions = ({
  control,
  errors,
}: TermsAndConditionsProps) => (
  <div className="flex w-full flex-col gap-1">
    <div className="flex items-center space-x-2 w-full">
      <Controller
        control={control}
        name="accepted"
        render={({ field }) => (
          <Checkbox
            {...field}
            onCheckedChange={(checked) => {
              field.onChange(checked);
            }}
            onBlur={field.onBlur}
            value={field.value ? "true" : "false"}
          />
        )}
      />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
    {errors.accepted?.message && (
      <p className="text-error text-xs">{errors.accepted.message}</p>
    )}
  </div>
);
