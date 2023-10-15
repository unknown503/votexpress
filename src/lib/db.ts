import { db, storage } from "@/config/firebase.config"
import { addCandidateI, BallotTypes, DocumentI, VotesCol } from "@/config/types"
import { addDoc, collection, deleteDoc, doc, DocumentData, getCountFromServer, getDoc, getDocs, increment, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage"
import RandomColor from "./RandomColor"
import { fetchUserList, updateUserVote } from "./user"

const CANDIDATES = "candidates"
const BALLOT = "ballot"
const VOTES = "votes"

/**
 * Candidates
 */

export const getCandidates = async () => {
  const candidatesRef = collection(db, CANDIDATES)

  const q = query(candidatesRef, orderBy("timestamp", "desc"))
  const docs = await getDocs(q)
  const candidates: DocumentI[] = []
  docs.docs.map(doc => candidates.push({ data: doc.data(), id: doc.id }))
  return candidates
}

export const getCandidatesByVotes = async () => {
  const candidatesRef = collection(db, CANDIDATES)

  const q = query(candidatesRef, orderBy("votes", "desc"))
  const docs = await getDocs(q)
  const candidates: DocumentI[] = []
  docs.docs.map(doc => candidates.push({ data: doc.data(), id: doc.id }))
  return candidates
}

export const addCandidate = async ({ fullname, pictureUrl, pictureName, group, proposals, birth_date, enabled }: addCandidateI) => {

  const res = await addDoc(collection(db, CANDIDATES), {
    fullname, pictureUrl, pictureName, group, proposals, birth_date, timestamp: serverTimestamp(), votes: 0, enabled,
    color: JSON.stringify(RandomColor())
  })
  return res
}

export const deleteCandidate = async (id: string, pic: string) => {
  const candidateRef = doc(db, CANDIDATES, id)

  if (pic && pic !== "") {
    const picRef = ref(storage, `${CANDIDATES}/${pic}`)
    deleteObject(picRef)
  }
  await deleteDoc(candidateRef)
}

export const deleteAllCandidates = async () => {
  const candidates = await getCandidates()

  candidates.map(async candidate => {
    await deleteCandidate(candidate.id, candidate.data.pictureName)
  })
}

export const uploadCandidatePicture = async (pic: File, random: string) => {
  const array = pic.name.split(".")
  const ext = array.pop()
  const name = array.join(".")
  const fullName = `${name}-${random}.${ext}`

  const imageRef = ref(storage, `${CANDIDATES}/${fullName}`)
  const res = await uploadBytes(imageRef, pic)
  const url = await getDownloadURL(res.ref)
  return { url, fullName }
}

export const increaseCandidateVote = async (candId: string, userId: string) => {
  const candidateRef = doc(db, CANDIDATES, candId)

  await updateDoc(candidateRef, {
    votes: increment(1)
  });

  const res = await updateUserVote(userId, {
    candidate: candId,
    status: true
  })
  return res
}


export const toggleEnabledCandidate = async (id: string, current: boolean) => {
  const candidateRef = doc(db, CANDIDATES, id)

  await updateDoc(candidateRef, {
    enabled: !current
  });
}


/**
 *  Ballot
 */

export const getBallotSettings = async (): Promise<BallotTypes> => {
  const ballotDoc = doc(db, BALLOT, "settings")

  const ballotData = await getDoc(ballotDoc)
  const exists = ballotData.exists()

  if (exists) {
    return ballotData.data() as BallotTypes
  } else {
    const data = {
      inProgress: false,
      timestamp: serverTimestamp(),
      setTimer: false,
      date: Date.now(),
      clean: true
    }

    await setDoc(ballotDoc, data);
    return data
  }
}

export const startBallot = async () => {
  const ballotDoc = doc(db, BALLOT, "settings")

  await updateDoc(ballotDoc, {
    inProgress: true,
    timestamp: serverTimestamp(),
    clean: false
  });

  resetCandidatesVotes()
  resetUserVotes()
  resetVotesLogs()
}

export const resetBallot = async () => {
  const ballotDoc = doc(db, BALLOT, "settings")

  await updateDoc(ballotDoc, {
    inProgress: false,
    timestamp: serverTimestamp(),
    date: Date.now(),
    clean: true
  });

  resetCandidatesVotes()
  resetUserVotes()
  resetVotesLogs()
}

export const changeTimerSettings = async (setTimer: boolean, date: number) => {
  const ballotDoc = doc(db, BALLOT, "settings")

  await updateDoc(ballotDoc, {
    setTimer,
    date
  });
}

export const finishBallot = async () => {
  const ballotDoc = doc(db, BALLOT, "settings")

  const settings = await getBallotSettings()
  if (settings && !settings.inProgress) return

  const data = {
    inProgress: false,
    timestamp: serverTimestamp(),
    date: Date.now(),
    setTimer: false,
  }

  await updateDoc(ballotDoc, data);
}

/**
 * Votes
 */

export const addNewVoteWithDate = async (candId: string, userId: string) => {
  await addDoc(collection(db, VOTES), {
    candId, userId, timestamp: Date.now()
  })
}

export const getVotesCollection = async () => {
  const votesRef = collection(db, VOTES)

  const q = query(votesRef)
  const docs = await getDocs(q)
  const votes: DocumentData[] = []
  docs.docs.map(doc => votes.push(doc.data()))
  return votes as VotesCol[]
}


export const getAllVotes = async () => {
  const votesRef = collection(db, VOTES)

  const q = query(votesRef)
  const docs = await getDocs(q)
  const votes: DocumentI[] = []
  docs.docs.map(doc => votes.push({ data: doc.data(), id: doc.id }))
  return votes
}


export const getVotesCount = async () => {
  const votesRef = collection(db, VOTES)
  const snapshot = await getCountFromServer(votesRef);
  return snapshot.data().count
}

/**
 * Resets
 */

async function resetUserVotes() {
  try {
    const users = await fetchUserList()
    users.userList.map(async user => {
      await updateUserVote(user.id, {
        candidate: "",
        status: false
      })
    })
  } catch (error) {
    console.error({ error })
  }
}

async function resetCandidatesVotes() {
  const candidates = await getCandidates()

  candidates.map(async candidate => {
    const candidateRef = doc(db, CANDIDATES, candidate.id)

    await updateDoc(candidateRef, {
      votes: 0
    });
  })
}

async function resetVotesLogs() {
  const votes = await getAllVotes()
  votes.map(async vote => {
    const candidateRef = doc(db, VOTES, vote.id)
    await deleteDoc(candidateRef)
  })
}