import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type Toast = {
  title?: string;
  description: string;
  variant: "default" | "destructive";
  redirectTo?: string;
};
const useShowToast = () => {
  const { toast } = useToast();
  const router = useRouter();
  const showToast = ({ title, description, variant, redirectTo }: Toast) => {
    toast({
      title,
      variant,
      description,
    });
    if (redirectTo) router.push(redirectTo);
  };
  return { showToast };
};
export default useShowToast;
