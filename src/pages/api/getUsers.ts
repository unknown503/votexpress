import type { NextApiRequest, NextApiResponse } from 'next'
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { getUserPrivMetadata } from '@/lib/user';
import { errorResponse, getUserResponse, ROLES, UserType } from '@/config/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<getUserResponse | errorResponse>
) {
  if (req.method === 'GET') {
    const { userId } = getAuth(req)
    if (!userId) {
      res.status(403).json({ error: 403, message: "Not authorized" })
      return
    }
    const metadata = await getUserPrivMetadata(userId)

    if (metadata.role === ROLES.ADMIN) {
      const userList = await clerkClient.users.getUserList() as unknown as UserType[]
      const userCount = await clerkClient.users.getCount()
      res.status(200).json({ userList, userCount })
    } else {
      res.status(403).json({ error: 403, message: "Not authorized" })
    }
  } else {
    res.status(401).json({ error: 401, message: "There was an error" })
  }
}
 