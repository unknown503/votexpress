import Toast from "@/components/Toast";
import { CandidateCardDetailed } from "@/components/util/CandidateCardDetailed";
import SkeletonGroup from "@/components/util/Skeleton";
import { BallotTypes, DocumentI, QUERY_KEYS } from "@/config/types";
import { getBallotSettings, getCandidatesByVotes } from "@/lib/db";
import { Avatar, Container, Loader, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Progress } from '@mantine/core';
import { Fragment, useEffect, useState } from "react";
import dayjs from "dayjs";
import Countdown from "react-countdown";
import { getInitialNameLetters, getName } from "@/lib/util";
import { fetchMetadata, getUserPrivMetadata } from "@/lib/user";
import useFinalResults from "@/lib/hooks/useFinalResults";
import useFinishBallotMutation from "@/lib/hooks/useFinishBallotMutation";
import { getAuth } from "@clerk/nextjs/server";
import { GetServerSideProps } from "next";
import Badge from "@/components/util/Badge";
import { useRouter } from "next/router";

export default function candidates() {
  const [Sections, setSections] = useState({ first: 0, second: 0 })
  const router = useRouter()

  const { data: candidates, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES_BY_VOTES],
    queryFn: () => getCandidatesByVotes(),
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

  const { data: metadata } = useQuery({
    queryKey: [QUERY_KEYS.METADATA],
    queryFn: () => fetchMetadata(),
  })

  useEffect(() => {
    if (isLoading || !candidates || candidates.length < 2) return

    const fVotes = candidates[0].data.votes
    const sVotes = candidates[1].data.votes
    if (fVotes === 0 && sVotes === 0) return

    const total = fVotes + sVotes
    const first = Math.round(fVotes / total * 100)
    const second = Math.round(sVotes / total * 100)
    setSections({ first, second })
  }, [candidates, isLoading])

  useEffect(() => {
    if (!ballot || !metadata || !candidates) return

    if (candidates.length < 2) {
      router.replace("/")
      return
    }
    ballot.clean && router.replace("/candidates")
    !metadata.metadata.vote?.status && router.replace("/vote")
  }, [ballot, metadata, candidates])

  return (
    <Container className="py-10 lg:py-20 mx-auto h-full text-center">
      {!isLoading &&
        <h2 className="text-2xl font-semibold md:text-3xl md:leading-tight pb-4">Resultados {ballot && ballot.inProgress ? "actuales" : "finales"}</h2>
      }
      {candidates && candidates.length < 2 ?
        <Loader className="mx-auto" /> :
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-between items-center pb-8">
            <SkeletonGroup h={150} length={3} show={isLoading} radius="sm" />
            {candidates && candidates.slice(0, 2).map((candidate, i) =>
              <Fragment key={candidate.id}>
                {i === 1 && ballot && <Timer {...ballot} />}
                <div className={`flex flex-col gap-4 items-center ${i === 1 ? "md:items-end" : "md:items-baseline"}`}>
                  <Avatar radius="50%" size={100} src={candidate.data.pictureUrl} className="uppercase" color="blue">
                    {getInitialNameLetters(candidate.data.fullname)}
                  </Avatar>
                  <div className={`text-center ${i === 1 ? "md:text-end" : "md:text-start"}`}>
                    <Title order={3} color={i === 1 ? "red" : "blue"} className="uppercase">
                      {candidate.data.fullname.split(" ")[0]}
                    </Title>
                    <span>
                      {candidate.data.group}
                    </span>
                  </div>
                </div>
              </Fragment>
            )}
          </div>
          <div className="mx-auto">
            <Progress
              size="xl"
              sections={[
                {
                  value: Sections.first,
                  label: `${Sections.first}%`,
                  color: 'blue',
                  tooltip: candidates && `${candidates[0].data.fullname} - Votos: ${candidates[0].data.votes}`
                },
                {
                  value: Sections.second,
                  label: `${Sections.second}%`,
                  color: 'red',
                  tooltip: candidates && `${candidates[1].data.fullname} - Votos: ${candidates[1].data.votes}`
                },
              ]}
            />
          </div>
          <h2 className="text-2xl font-semibold md:text-3xl md:leading-tight pb-4 pt-10">Candidatos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 mt-6">
            <SkeletonGroup show={isLoading} h={112} length={9} />
            {candidates && candidates.map(candidate =>
              <CandidateCardDetailed
                key={candidate.id}
                name={candidate.data.fullname}
                group={candidate.data.group}
                pic={candidate.data.pictureUrl}
                birth_day={candidate.data.birth_date.seconds * 1000}
                proposals={candidate.data.proposals}
                isSelected={metadata && metadata.metadata.vote?.candidate === candidate.id}
              />
            )}
          </div>
        </>
      }
    </Container>
  )
}

function Timer(ballot: BallotTypes) {
  const finishBallot = useFinishBallotMutation()
  const { results } = useFinalResults()

  return (
    <>
      {ballot &&
        <div className='text-center'>
          <Title order={5} className="uppercase pb-1">
            {ballot.inProgress && ballot.setTimer && "Tiempo restante"}
            {!ballot.inProgress && "Votaciones finalizadas"}
          </Title>
          {ballot.setTimer &&
            <Countdown
              date={Date.now() + dayjs(dayjs(ballot.date)).diff(new Date())}
              intervalDelay={1000}
              onComplete={() => finishBallot.mutate()}
              renderer={({ days, hours, minutes, seconds }) =>
                <>
                  {ballot.inProgress &&
                    <div>
                      {days !== 0 && <>{days} día{days !== 1 && "s"} </>}
                      {hours !== 0 && <>{hours} hora{hours !== 1 && "s"} </>}
                      {minutes !== 0 && <>{minutes} minuto{minutes !== 1 && "s"} </>}
                      {days === 0 && hours === 0 && <>{seconds} segundo{seconds !== 1 && "s"} </>}
                    </div>
                  }
                </>
              }
            />
          }
          {results && !ballot.inProgress &&
            <>
              {results.isDraw ?
                <div>
                  <span>Hubo <b>empate</b> entre: </span>
                  {getName(results.highestVotes.data.fullname)}
                  {results.sameVotes.map(cand => `, ${getName(cand.data.fullname)}`)}
                </div> :
                <div>
                  El ganador es: <Badge label={results.highestVotes.data.fullname} variant="success" />
                </div>
              }
            </>
          }
        </div>
      }
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { userId } = getAuth(ctx.req)

  const { vote } = await getUserPrivMetadata(userId || "")
  const ballot = await getBallotSettings()

  if (!vote?.status && ballot.inProgress) {
    return {
      redirect: {
        destination: "/vote",
        permanent: false
      }
    }
  }

  if (ballot.clean) {
    return {
      redirect: {
        destination: "/candidates",
        permanent: false
      }
    }
  }

  return { props: {} }
}