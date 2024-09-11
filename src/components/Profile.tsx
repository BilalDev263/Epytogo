"use client";

import UpdateEmail from "./form/profile/UpdateEmail";
import { Modal } from "./ui/modal";
import { useStore } from "@/store/useStore";
import UpdatePassword from "./form/profile/UpdatePassword";

const Info = () => {
  const { currentUser } = useStore();
  return (
    <ul className="flex flex-col gap-2 w-full border p-4 rounded-md">
      <h2 className="font-bold">Mes information</h2>
      <li className="flex items-center gap-1">
        <h3 className="font-semibold">Utilisateur: </h3>
        <p>{`
        ${currentUser?.lastname}
        ${currentUser?.firstname}`}</p>
      </li>
      <li className="flex items-center gap-1">
        <h3 className="font-semibold">Email: </h3>
        <p>{currentUser?.email}</p>
      </li>
    </ul>
  );
};

type Props = {
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
};
export const Profile = ({ trigger, onOpenChange }: Props) => {
  return (
    <Modal
      classNames={{
        dialogContent: "w-5/6 md:w-4/6 lg:w-3/6 xl:w-2/6 p-6",
        dialogTitle: "mb-4",
      }}
      title="Profil"
      trigger={trigger}
      description={<Info />}
      onOpenChange={onOpenChange}
    >
      <div className="border rounded-md p-4">
        <div className="border-none shadow-none mb-4 text-sm text-muted-foreground">
          <h2 className="font-bold mb-2">Modifier l email</h2>
          <UpdateEmail />
        </div>
        <div className="border-none shadow-none mb-4 text-sm text-muted-foreground">
          <h2 className="font-bold mb-2">Modifier le mot de passe</h2>
          <UpdatePassword />
        </div>
      </div>
    </Modal>
  );
};
