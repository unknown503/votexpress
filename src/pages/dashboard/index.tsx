import Graphs from "@/components/dashboard/Graphs";
import HeaderTitle from "@/components/dashboard/HeaderTitle";
import Stats, { StatsGridProps } from "@/components/dashboard/Stats";
import Toast from "@/components/Toast";
import SkeletonGroup from "@/components/util/Skeleton";
import { DocumentI, QUERY_KEYS } from "@/config/types";
import { getBallotSettings, getCandidates } from "@/lib/db";
import { fetchUserList, getNumberOfVoters } from "@/lib/user";
import { Loader } from "@mantine/core";
import { useQueries } from "@tanstack/react-query";
import dayjs from "dayjs";

export default function Dashboard() {
  const results = useQueries({
    queries: [
      {
        queryKey: [QUERY_KEYS.CANDIDATES],
        queryFn: getCandidates,
        onError: (error: any) => Toast(error.message),
        select: (data: DocumentI[]) => data.filter(cand => cand.data.enabled === true)
      },
      {
        queryKey: [QUERY_KEYS.USERS],
        queryFn: fetchUserList,
        onError: (error: any) => Toast(error.message)
      },
      {
        queryKey: [QUERY_KEYS.VOTERS],
        queryFn: getNumberOfVoters,
        onError: (error: any) => Toast(error.message)
      },
      {
        queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
        queryFn: getBallotSettings,
        onError: (error: any) => Toast(error.message)
      },
    ],
  })

  const timestamp = dayjs(results[3].data?.timestamp?.seconds * 1000)

  const stats: StatsGridProps = {
    data: [
      { title: "Usuarios", value: results[1].data?.userCount, icon: "user", isLoading: results[1].isLoading },
      { title: "Votantes", value: results[2].data, icon: "voted", isLoading: results[2].isLoading },
      { title: "Candidatos", value: results[0].data?.length, icon: "candidate", isLoading: results[0].isLoading },
      {
        title: "Transcurrido",
        value: Math.abs(timestamp.diff(dayjs(), 'h')),
        min: Math.abs(timestamp.diff(dayjs(), 'm')),
        icon: "time",
        isLoading: results[3].isLoading
      },
    ]
  }

  const isAnythingLoading = results[0].isLoading || results[1].isLoading || results[2].isLoading || results[3].isLoading

  return (
    <div className="pb-6">
      <HeaderTitle title="Dashboard" />
      <Stats data={stats.data} />
      <HeaderTitle title="Estadísticas" className="pt-8" />
      {results[3].isLoading ? <Loader className="mx-auto" /> :
        <Graphs />
      }
    </div>
  )
}