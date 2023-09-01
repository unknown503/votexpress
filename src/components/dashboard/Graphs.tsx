import { BarChart } from "../util/Charts/BarChart";
import { HBarChart } from "../util/Charts/HBarChart";
import { PieChart } from "../util/Charts/PieChart";
import Toast from '@/components/Toast';
import { QUERY_KEYS } from '@/config/types';
import { getVotesCollection } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { Loader } from "@mantine/core";

export default function Graphs() {
  const { data: votes, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VOTES_COLLECTION],
    queryFn: () => getVotesCollection(),
    onError: (error: any) => Toast(error.message),
  })

  return (
    <>
      {(!votes || isLoading) ?
        <Loader className="mx-auto" /> :
        <>
          {votes.length !== 0 ?
            <div className="grid grid-cols-12 gap-4">
              <PieChart className="col-span-12 xl:col-span-5 h-[430px] !flex items-center justify-center" />
              <BarChart className="col-span-12 xl:col-span-7 h-[400px] xl:h-[430px] !flex items-center justify-center" />
              <HBarChart
                className="col-span-12 min-h-[200px] !flex items-center justify-center"
                isLoading={isLoading}
                votes={votes}
              />
            </div> :
            <h2 className='text-lg font-semibold pb-3'>No hay suficientes datos que mostrar</h2>
          }
        </>
      }
    </>
  )
}
