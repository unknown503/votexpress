import Toast from '@/components/Toast';
import { Project } from '@/config/projectData';
import { QUERY_KEYS } from '@/config/types';
import { getCandidates } from '@/lib/db';
import { Loader, Paper } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { FC, HTMLAttributes, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Gráfico de barras',
    },
  },
};

export const BarChart: FC<HTMLAttributes<HTMLDivElement>> = ({ ...props }) => {
  const { data: candidates, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES],
    queryFn: () => getCandidates(),
    onError: (error: any) => Toast(error.message),
    refetchInterval: Project.refetchInterval
  })

  const BarData = useMemo(() => {
    if (!candidates) return

    const data = {
      labels: candidates.map(cand => cand.data.fullname.split(" ")[0]),
      datasets: [
        {
          label: ' # de votos',
          data: candidates.map(cand => cand.data.votes),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderWidth: 1,
        },
      ],
    }
    return data
  }, [candidates])

  return (
      <Paper withBorder p="lg" radius="md" {...props}>
        {(isLoading || !BarData) ?
          <Loader className="mx-auto" /> :
          <Bar options={options} data={BarData} />
        }
      </Paper>
  )
}
