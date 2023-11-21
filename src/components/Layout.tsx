import { FC, ReactNode, useEffect } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import Footer from './layout/Footer';
import Header from './layout/Header';
import AdminSidebarAndHeader from './layout/AdminSidebarAndHeader';
import { ModalsProvider } from '@mantine/modals';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/types';
import { getBallotSettings, getCandidates, resetBallot } from '@/lib/db';
import Toast from './Toast';
import useFinishBallotMutation from '@/lib/hooks/useFinishBallotMutation';
import CustomHead from './layout/CustomHead';
import { useUser } from '@clerk/nextjs';
import { Loader } from '@mantine/core';
import { toInvalidate } from '@/pages/dashboard/ballot';
import { Project } from '@/config/projectData';

interface IWrapperProps {
  children: ReactNode;
}

export const Layout: FC<IWrapperProps> = ({ children }) => {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const isAdminDashboard = router.asPath.split("/")[1].replace("#", "") === "dashboard"
  const finishBallot = useFinishBallotMutation()
  const temporalTitle = router.asPath.split("/").slice(-1)[0].replace(/\?.*/, "")
  const queryClient = useQueryClient()

  const { data: ballot } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => {
      Toast(error.message)
    },
    refetchInterval: Project.refetchInterval
  })

  const { data: candidates } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES],
    queryFn: () => getCandidates(),
    onError: (error: any) => Toast(error.message),
    refetchInterval: Project.refetchInterval
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      await resetBallot()
    },
    mutationKey: [QUERY_KEYS.RESET_BALLOT],
    onError: (error: any) => Toast(error.message),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: toInvalidate
      })
      await queryClient.refetchQueries({ type: 'active' })
    },
  })

  useEffect(() => {
    if (ballot && ballot.inProgress && ballot.setTimer && ballot.date <= Date.now()) {
      finishBallot.mutate()
    }
  }, [ballot])

  useEffect(() => {
    if (!ballot?.clean && candidates && candidates.length < 2) {
      resetMutation.mutate()
    }
  }, [ballot, candidates])

  return (
    <>
      <Head>
        <meta name="description" content={Project.name}/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/favicon.png" type="image/x-icon" />
      </Head>
      <CustomHead title={temporalTitle} />

      <ModalsProvider modalProps={{ centered: true, lockScroll: true }}>
        {isAdminDashboard ?
          !isSignedIn ?
            <div className="h-screen flex items-center">
              <Loader className="mx-auto" />
            </div> :
            <AdminSidebarAndHeader>
              {children}
            </AdminSidebarAndHeader>
          :
          <>
            <Header />
            <main className="min-h-[80vh] xl:min-h-[82vh]">
              {children}
            </main>
            <Footer/>
          </>
        }
      </ModalsProvider>
    </>
  )
}
