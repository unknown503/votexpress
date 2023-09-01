import Toast from "@/components/Toast";
import { QUERY_KEYS } from "@/config/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getCandidatesByVotes } from "../db";

export default function useFinalResults() {
  const { data: candidates, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES_BY_VOTES],
    queryFn: () => getCandidatesByVotes(),
    onError: (error: any) => Toast(error.message),
  })

  const res = useMemo(() => {
    if (!candidates || candidates.length === 0) return
    const highestVotes = candidates.reduce((prev, current) => (prev.data.votes > current.data.votes) ? prev : current)
    const sameVotes = candidates.filter((candidate) =>
      candidate.data.votes === highestVotes.data.votes && highestVotes.id !== candidate.id
    )
    const isDraw = sameVotes.length !== 0

    return { highestVotes, sameVotes, isDraw }
  }, [candidates])

  return { results: res, isLoading }
}
