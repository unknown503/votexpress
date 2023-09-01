import { Skeleton } from '@mantine/core'
import React from 'react'

interface SkeletonProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  show: boolean,
  h: number,
  length: number,
  radius?: string,
}

export default function SkeletonGroup({ show, h, length, radius = "md" }: SkeletonProps) {
  return (
    <>
      {show && new Array(length).fill(1).map((_, i) => <Skeleton key={i} className="w-full" h={h} radius={radius} />)}
    </>
  )
}
