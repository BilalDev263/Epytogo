"use client";

import UpdateEmail from "./form/profile/UpdateEmail";
import { Modal } from "./ui/modal";
import { useStore } from "@/store/useStore";
import UpdatePassword from "./form/profile/UpdatePassword";

const Info = () => {
  const { currentUser } = useStore();
  return (
    <ul className="flex flex-col gap-2 w-full border border-gray-200 dark:border-gray-700 p-4 rounded-md bg-white dark:bg-gray-800">
      <h2 className="font-bold text-gray-900 dark:text-white">Mes information</h2>
      <li className="flex items-center gap-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">Utilisateur: </h3>
        <p className="text-gray-700 dark:text-gray-300">{`
        ${currentUser?.lastname}
        ${currentUser?.firstname}`}</p>
      </li>
      <li className="flex items-center gap-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">Email: </h3>
        <p className="text-gray-700 dark:text-gray-300">{currentUser?.email}</p>
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
      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-white dark:bg-gray-800">
        <div className="border-none shadow-none mb-4">
          <h2 className="font-bold mb-2 text-gray-900 dark:text-white">Modifier l email</h2>
          <UpdateEmail />
        </div>
        <div className="border-none shadow-none mb-4">
          <h2 className="font-bold mb-2 text-gray-900 dark:text-white">Modifier le mot de passe</h2>
          <UpdatePassword />
        </div>
      </div>
    </Modal>
  );
};
