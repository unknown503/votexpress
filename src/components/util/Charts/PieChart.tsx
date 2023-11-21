import Toast from '@/components/Toast';
import { Project } from '@/config/projectData';
import { QUERY_KEYS } from '@/config/types';
import { getCandidates } from '@/lib/db';
import { Loader, Paper } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FC, HTMLAttributes, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const options = {
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: true,
      text: 'Gráfico pie',
    },
  },
};

export const PieChart: FC<HTMLAttributes<HTMLDivElement>> = ({ ...props }) => {
  const { data: candidates, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES],
    queryFn: () => getCandidates(),
    onError: (error: any) => Toast(error.message),
    refetchInterval: Project.refetchInterval
  })

  const PieData = useMemo(() => {
    if (!candidates) return

    const data = {
      labels: candidates.map(cand => cand.data.fullname.split(" ")[0]),
      datasets: [
        {
          label: ' # de votos',
          data: candidates.map(cand => cand.data.votes),
          backgroundColor: candidates.map(cand => JSON.parse(cand.data.color).bg),
          borderColor: candidates.map(cand => JSON.parse(cand.data.color).border),
          borderWidth: 1,
        },
      ],
    }
    return data
  }, [candidates])

  return (
    <Paper withBorder p="lg" radius="md" {...props}>
      {(isLoading || !PieData) ?
        <Loader className="mx-auto" /> :
        <Pie data={PieData} options={options} className="!flex justify-center"/>
      }
    </Paper>
  )
}
