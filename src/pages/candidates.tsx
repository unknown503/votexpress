import Toast from "@/components/Toast";
import { CandidateCardDetailed } from "@/components/util/CandidateCardDetailed";
import SkeletonGroup from "@/components/util/Skeleton";
import { Project } from "@/config/projectData";
import { DocumentI, QUERY_KEYS } from "@/config/types";
import { getBallotSettings, getCandidates } from "@/lib/db";
import { useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { Container } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function candidates() {
  const router = useRouter()
  const { isSignedIn } = useUser()

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
    refetchInterval: Project.refetchInterval
  })

  useEffect(() => {
    if (!ballot) return
    ballot.inProgress && isSignedIn && router.replace("/vote")
  }, [ballot, isSignedIn])

  return (
    <Container className="py-10 lg:py-20 mx-auto h-full text-center">
      <div className="mb-10 lg:mb-14">
        <h2 className="text-2xl font-semibold md:text-3xl md:leading-tight">Candidatos disponibles</h2>
        {!isLoading &&
          <>
            {isSignedIn && ballot ?
              <>
                {ballot.clean &&
                  <span className="block text-base text-gray-500 mt-2">
                    Pronto comienzan las votaciones!
                  </span>
                }
              </> :
              <Link href="/sign-in" className="hover:underline">Todo listo para votar?</Link>
            }
          </>
        }
      </div>
      {data && !isLoading && data.length === 0 ?
        <h2 className="text-lg">No hay candidatos de momento...</h2> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 mt-6">
          <SkeletonGroup show={isLoading} h={112} length={9} />
          {isSuccess && data.map(candidate =>
            <CandidateCardDetailed
              key={candidate.id}
              name={candidate.data.fullname}
              group={candidate.data.group}
              pic={candidate.data.pictureUrl}
              birth_day={candidate.data.birth_date.seconds * 1000}
              proposals={candidate.data.proposals}
              isSelected={false}
            />
          )}
        </div>
      }
    </Container >
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { userId } = getAuth(ctx.req)
  const ballot = await getBallotSettings()

  if (userId && ballot?.inProgress) {
    return {
      redirect: {
        destination: "/vote",
        permanent: true
      }
    }
  }

  return {
    props: {}
  }
}