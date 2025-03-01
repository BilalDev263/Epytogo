import { ItemId } from "@/components/navigation/types";
import { RegisterPayload } from "@/validators/registerSchema";
import { User } from "@prisma/client";
import { create } from "zustand";

export type Store = {
  itemId: ItemId;
  setItem: (item: ItemId) => void;
  credentials: RegisterPayload;
  setCredentials: (credentials: RegisterPayload) => void;
  token?: string;
  setToken: (currentUser?: string) => void;
  currentUser: Omit<User, "password"> | null;
  setCurrentUser: (currentUser: Omit<User, "password">) => void;
};

export const useStore = create<Store>((set) => ({
  itemId: "all",
  setItem: (itemId) => set({ itemId }),
  credentials: {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    accepted: true,
  },
  setCredentials: (credentials) => set({ credentials }),
  setToken: (token) => set({ token }),
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
