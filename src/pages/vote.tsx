import Toast from "@/components/Toast";
import CandidateCard from "@/components/util/CandidateCard";
import SkeletonGroup from "@/components/util/Skeleton";
import { BallotTypes, DocumentI, QUERY_KEYS } from "@/config/types";
import { addNewVoteWithDate, getBallotSettings, getCandidates, increaseCandidateVote } from "@/lib/db";
import { getUserPrivMetadata } from "@/lib/user";
import { useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { Button, Container, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface CandidateI {
  id: string,
  fullname: string,
}

export default function vote() {
  const [Voting, setVoting] = useState<boolean>(false)
  const [ChosenCandidate, setChosenCandidate] = useState<CandidateI | null>(null)
  const { user } = useUser()
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES],
    queryFn: () => getCandidates(),
    onError: (error: any) => Toast(error.message),
    select: (data: DocumentI[]) => data.filter(cand => cand.data.enabled === true)
  })

  const { data: ballot } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => {
      Toast(error.message)
    },
  })

  useEffect(() => {
    if (!ballot) return
    !ballot.inProgress && router.replace("/results")
  }, [ballot])

  const onVoteHandler = () => {
    if (ChosenCandidate === null) {
      Toast("Debes seleccionar un candidato primero.")
      return
    }
    openModal()
  }

  const onSelectCandidate = (candidate: string, fullname: string) => {
    if (ChosenCandidate === null || ChosenCandidate.id !== candidate) setChosenCandidate({ id: candidate, fullname })
    if (ChosenCandidate?.id === candidate) setChosenCandidate(null)
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (ChosenCandidate === null || !user || Voting) return
      setVoting(true)
      const res = await increaseCandidateVote(ChosenCandidate.id, user.id)
      await addNewVoteWithDate(ChosenCandidate.id, user.id)
      return res
    },
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: (data) => {
      router.replace("/results")
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANDIDATES, QUERY_KEYS.CANDIDATES_BY_VOTES] })
      Toast(data.message, true)
    },
  })

  const openModal = () => modals.openConfirmModal({
    title: 'Confirmación',
    children: (
      <Text size="sm" fz="md" mt={10}>
        Seguro que quieres votar por <b>{ChosenCandidate?.fullname}</b> ?
      </Text>
    ),
    labels: { confirm: 'Confirmar voto', cancel: 'Cancelar' },
    confirmProps: { color: "teal", variant: "light", size: "sm" },
    cancelProps: { color: "gray", variant: "light", size: "sm" },
    onConfirm: () => mutation.mutate(),
  });

  return (
    <Container className="py-10 lg:py-20 mx-auto h-full">
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2 className="text-2xl font-semibold md:text-3xl md:leading-tight">Elige a un candidato</h2>
        {/* <Button
          component={Link}
          href="/candidates"
          variant="default"
          mt={20}
        >
          Ver más información
        </Button> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        <SkeletonGroup show={isLoading} h={112} length={9} />
        {isSuccess && data.map(candidate =>
          <CandidateCard
            name={candidate.data.fullname}
            group={candidate.data.group}
            pic={candidate.data.pictureUrl}
            proposals={candidate.data.proposals}
            birth_day={candidate.data.birth_date.seconds * 1000}
            key={candidate.id}
            onClick={() => onSelectCandidate(candidate.id, candidate.data.fullname)}
            selected={candidate.id === ChosenCandidate?.id}
          />
        )}
      </div>
      <div className="mt-14 text-center">
        <Button
          size="lg"
          variant="light"
          color="teal"
          disabled={Voting || mutation.isLoading}
          onClick={onVoteHandler}
          loading={mutation.isLoading}
        >
          Confirmar elección
        </Button>
      </div>
    </Container >
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { userId } = getAuth(ctx.req)

  const { vote } = await getUserPrivMetadata(userId || "")
  const ballot = await getBallotSettings()

  if (vote && vote.status || ballot && !ballot.inProgress) {
    return {
      redirect: {
        destination: "/results",
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}