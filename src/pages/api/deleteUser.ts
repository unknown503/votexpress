import type { NextApiRequest, NextApiResponse } from 'next'
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { getUserPrivMetadata } from '@/lib/user';
import { ResponseReturn, ROLES } from '@/config/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseReturn>
) {
  const id = req.body.id;
  if (req.method === 'DELETE' && id) {
    const { userId } = getAuth(req)
    if (!userId) {
      res.status(403).json({ error: true, message: "Not authorized" })
      return
    }
    const metadata = await getUserPrivMetadata(userId)

    if (metadata.role === ROLES.ADMIN) {
      await clerkClient.users.deleteUser(id);
      res.status(200).json({ message: 'Usuario eliminado.' });
    } else {
      res.status(403).json({ error: true, message: "Not authorized" })
    }
  } else {
    res.status(401).json({ error: true, message: "There was an error" })
  }
}
