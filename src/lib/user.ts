import { getUserResponse, privateMetadataTypes, UserWithMetadata } from "@/config/types";
import { clerkClient } from "@clerk/nextjs/server";

export const getUserInfo = async (userId: string): Promise<UserWithMetadata> => {
  const user = await clerkClient.users.getUser(userId);
  return user as UserWithMetadata
}

export const getUserPrivMetadata = async (userId: string): Promise<privateMetadataTypes> => {
  const user = await getUserInfo(userId);
  return user.privateMetadata
}

export const fetchMetadata = async (): Promise<{ metadata: privateMetadataTypes }> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/metadata`)
  const metadata = await res.json()
  return metadata
}

export const fetchUserList = async (): Promise<getUserResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/getUsers`)
  const userData = await res.json()
  return userData
}

export const updateUserRole = async (userId: string, role: number) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/update/role`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, role })
  })
  const updateRole = await res.json()
  return updateRole
}

export const updateUserCC = async (userId: string, cc: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/update/userCc`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, cc })
  })
  const updateCc = await res.json()
  return updateCc
}

export const updateUserVote = async (userId: string, vote: { status: boolean, candidate: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/update/vote`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, vote })
  })
  const updateRes = await res.json()
  return updateRes
}

export const deleteUser = async (id: string) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/deleteUser`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  })
  const deleteU = await res.json()
  return deleteU
}



export const getNumberOfVoters = async () => {
  const userData = await fetchUserList()
  let votersCount = 0
  userData.userList.map(user => {
    if (user.privateMetadata.vote.status) {
      votersCount++
    }
  })
  return votersCount
}