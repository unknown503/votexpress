import { VotesCol } from '@/config/types';
import { Loader, Paper } from '@mantine/core';
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, Title, PointElement, LineElement, Filler } from 'chart.js';
import { FC, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
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
      text: `Votos del mes de ${new Date().toLocaleString('es', { month: 'long' })}`,
    },
  },
};

interface GroupedData {
  [key: string]: VotesCol[]
}

interface HBarChart extends HTMLAttributes<HTMLDivElement> {
  votes: VotesCol[]
  isLoading: boolean
}

export const HBarChart: FC<HBarChart> = ({ votes, isLoading, ...props }) => {
  const [DataByDay, setDataByDay] = useState<GroupedData | null>(null)

  useEffect(() => {
    if (!votes || isLoading) return
    let groupedByMonth: GroupedData = {}
    votes.map(vote => {
      const timestamp = vote.timestamp
      const date = new Date(timestamp).toLocaleDateString('en-US', { year: '2-digit', month: 'numeric' })
      if (!groupedByMonth[date]) groupedByMonth = {
        ...groupedByMonth,
        [date]: []
      }
      groupedByMonth[date].push(vote);
    })

    let groupedByDay: GroupedData = {}
    const keys = Object.keys(groupedByMonth)
    keys.map(key => {
      if (String(new Date().getMonth() + 1) === key.split("/")[0]) {
        groupedByMonth[key].map(vote => {
          const day = new Date(vote.timestamp).toLocaleDateString('en-US', { day: 'numeric' })

          if (!groupedByDay[day]) groupedByDay = {
            ...groupedByDay,
            [day]: []
          }
          groupedByDay[day].push(vote);
        })
      }
    })
    setDataByDay(groupedByDay)
  }, [votes])

  const data = useMemo(() => {
    if (!votes || !DataByDay) return

    const now = new Date();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const daysArray = new Array(totalDays).fill(0, 0, totalDays).map((_, n) => n + 1)
    const valueByDay = new Array(totalDays).fill(0, 0, totalDays).map((_, n) => {
      const array = DataByDay[n + 1]
      if (!array) return 0
      return array.length
    })

    const data = {
      labels: daysArray,
      datasets: [
        {
          label: 'Votos por día',
          data: valueByDay,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          fill: true,
        },
      ],
    }
    return data
  }, [votes, DataByDay])

  return (
    <Paper withBorder p="lg" radius="md" {...props}>
      {(isLoading || !data) ?
        <Loader className="mx-auto" /> :
        <Line options={options} data={data} />
      }
    </Paper>
  )
}
