import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { sign } from 'jsonwebtoken'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createToken = (userId: string) => {
  const dataStoredInToken: DataStoredInToken = { _id: String(userId) };
  const secretKey:string = process.env.SECRET_KEY as string;

  return sign(dataStoredInToken, secretKey);
}