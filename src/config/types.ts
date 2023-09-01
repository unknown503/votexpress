import { User } from "@clerk/nextjs/dist/api"
import { DocumentData } from "firebase/firestore"
import { ReactElement } from "react"

export type ResponseReturn = {
  message: string,
  error?: boolean
}

export interface Metadata {
  role?: number,
  cc?: number,
}

export interface SidebarLinkI {
  icon: ReactElement,
  label: string,
  href: string,
  subitems?: {
    label: string,
    href?: string,
  }[]
}

export interface DocumentI {
  data: DocumentData,
  id: string
}

export interface addCandidateI {
  fullname: string,
  pictureUrl: string,
  pictureName: string,
  group: string,
  proposals?: string,
  birth_date?: Date,
  enabled: boolean,
}

type NoMetadata = Omit<User, "privateMetadata">

export interface UserWithMetadata extends NoMetadata {
  privateMetadata: {
    cc: number,
    role: number,
    vote: {
      status: boolean,
      candidate: string
    }
  }
}

export interface privateMetadataTypes {
  cc: number
  role: number
  vote: {
    status: boolean
    candidate: string
  }
}

export interface UserType {
  id: string
  passwordEnabled: boolean
  totpEnabled: boolean
  banned: boolean
  createdAt: number
  updatedAt: number
  profileImageUrl: string
  gender: string
  birthday: string
  primaryEmailAddressId: string
  lastSignInAt: number
  firstName: string
  lastName: string
  privateMetadata: privateMetadataTypes
  emailAddresses: {
    id: string
    emailAddress: string
  }[]
}

export type getUserResponse = {
  userList: UserType[],
  userCount: number
}

export type errorResponse = {
  error: number,
  message: string
}

export interface BallotTypes {
  inProgress: boolean
  timestamp: any
  setTimer: boolean,
  date: number,
  clean: boolean
}

export interface VotesCol {
  candId: string,
  userId: string,
  timestamp: number,
}

export enum ROLES {
  ADMIN, USER
}

export enum QUERY_KEYS {
  METADATA,
  USERS,
  CANDIDATES,
  CANDIDATES_BY_VOTES,
  BALLOT_SETTINGS,
  START_BALLOT,
  FINISH_BALLOT,
  VOTERS,
  VOTES,
  RESET_BALLOT,
  DELETE_USER,
  VOTES_COLLECTION,
  USER_TO_ADMIN
}