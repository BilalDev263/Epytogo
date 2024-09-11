import { Login } from "@/components/Login";

interface Props {
  searchParams: {
    callbackUrl?: string;
  };
}

const LoginPage = ({ searchParams }: Props) => {
  return <Login callbackUrl={searchParams.callbackUrl} />;
};

export default LoginPage;
