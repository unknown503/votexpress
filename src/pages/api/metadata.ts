import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from "@clerk/nextjs/server";
import { getUserPrivMetadata } from '@/lib/user';
import { errorResponse } from '@/config/types';

type Data = {
  metadata: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | errorResponse>
) {
  if (req.method === 'GET') {
    const { userId } = getAuth(req)
    if (!userId) {
      res.status(403).json({ error: 403, message: "Not authorized" })
      return
    }

    const metadata = await getUserPrivMetadata(userId)
    res.status(200).json({ metadata })
  } else {
    res.status(401).json({ error: 401, message: "There was an error" })
  }
}
