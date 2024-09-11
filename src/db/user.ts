import db from "@/db/prisma";
import { RegisterPayload } from "@/validators/registerSchema";
import { User } from "@prisma/client";

export const findOneUser = async ({
  id,
  email,
}: {
  id?: string;
  email?: string;
}) => {
  try {
    return await db.user.findUnique({
      where: {
        ...(id ? { id } : { email }),
      },
    });
  } catch (error) {
    return null;
  }
};

export const createUser = async (
  user: Omit<RegisterPayload, "accepted" | "confirmPassword">,
  hashedPassword: string,
) => {
  try {
    return await db.user.create({
      data: { ...user, password: hashedPassword },
    });
  } catch (error) {
    return null;
  }
};

export const updateUser = async (id: string, user: Partial<User>) => {
  {
    try {
      return await db.user.update({
        where: { id },
        data: { ...user },
      });
    } catch (error) {
      return null;
    }
  }
};
