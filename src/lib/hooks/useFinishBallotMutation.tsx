import Toast from "@/components/Toast";
import { QUERY_KEYS } from "@/config/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishBallot } from "../db";

export default function useFinishBallotMutation() {
  const queryClient = useQueryClient()
  
  const finishBallotMutation = useMutation({
    mutationFn: async () => {
      await finishBallot()
    },
    mutationKey: [QUERY_KEYS.FINISH_BALLOT],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALLOT_SETTINGS] })
    },
  })
  
  return finishBallotMutation
}
