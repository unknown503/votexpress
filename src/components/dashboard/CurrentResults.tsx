import { Project } from "@/config/projectData"
import { QUERY_KEYS } from "@/config/types"
import { getBallotSettings } from "@/lib/db"
import useFinalResults from "@/lib/hooks/useFinalResults"
import { getName } from "@/lib/util"
import { Loader } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import Toast from "../Toast"
import Badge from "../util/Badge"

export default function CurrentResults() {
  const { results } = useFinalResults()

  const { data: ballot, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => {
      Toast(error.message)
    },
    refetchInterval: Project.refetchInterval
  })

  return (
    <div className='flex flex-col gap-5 justify-center items-center min-h-[200px]'>
      {(isLoading || !ballot || !results) ? <Loader className="mx-auto" /> :
        <>
          <h2 className='text-lg font-bold'>Resultados {ballot.inProgress ? "actuales" : "finales"}</h2>
          <div className="text-center">
            {ballot.inProgress ?
              <>
                <Badge
                  label={`Posible ${results?.isDraw ? "empate" : "ganador"}`}
                  variant={results?.isDraw ? "warning" : "primary"}
                />
                <div className="pt-1">
                  {results.isDraw ?
                    <div>
                      Entre: {getName(results.highestVotes.data.fullname)}
                      {results.sameVotes.map(cand => `, ${getName(cand.data.fullname)}`)}
                    </div> :
                    <div>
                      {results.highestVotes.data.fullname}
                    </div>
                  }
                </div>
              </> :
              <>
                <Badge
                  label={results?.isDraw ? "Hubo empate" : "Hay ganador"}
                  variant={results?.isDraw ? "warning" : "success"}
                />
                <div className="pt-1">
                  {results.isDraw ?
                    <div>
                      Entre: {getName(results.highestVotes.data.fullname)}
                      {results.sameVotes.map(cand => `, ${getName(cand.data.fullname)}`)}
                    </div> :
                    <div>
                      {results.highestVotes.data.fullname}
                    </div>
                  }
                </div>
              </>
            }
          </div>
        </>
      }
    </div>
  )
}
