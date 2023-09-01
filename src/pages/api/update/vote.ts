import type { NextApiRequest, NextApiResponse } from 'next'
import { clerkClient } from "@clerk/nextjs/server";
import { getUserPrivMetadata } from '@/lib/user';
import { errorResponse, ResponseReturn } from '@/config/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseReturn | errorResponse>) {
  if (req.method === 'PUT') {
    const { vote, userId } = req.body
    if (!userId) {
      res.status(403).json({ error: 403, message: "Not authorized" })
      return
    }

    const metadata = await getUserPrivMetadata(userId)

    await clerkClient.users.updateUser(userId, {
      privateMetadata: {
        ...metadata,
        vote
      }
    });
    res.status(200).json({ message: "Voto guardado." })
  } else {
    res.status(401).json({ error: true, message: "No put request." })
  }
}