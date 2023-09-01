import CandidatesTable from '@/components/dashboard/CandidatesTable'
import HeaderTitle from '@/components/dashboard/HeaderTitle'
import Timer from '@/components/dashboard/Timer'
import { Question, Restart, RightArrow } from '@/components/icons/Icons'
import Toast from '@/components/Toast'
import Badge from '@/components/util/Badge'
import { BallotPageMinimums } from '@/config/projectData'
import { DocumentI, QUERY_KEYS } from '@/config/types'
import { finishBallot, getBallotSettings, getCandidatesByVotes, getVotesCount, resetBallot, startBallot } from '@/lib/db'
import { fetchUserList } from '@/lib/user'
import { ActionIcon, Button, Group, Loader, Modal, Paper, Skeleton, Text, Tooltip } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import Link from 'next/link'
import React, { useReducer } from 'react'
import 'dayjs/locale/es-mx'
import CurrentResults from '@/components/dashboard/CurrentResults'
import { modals } from '@mantine/modals'

const initialState: StateType = {
  timer: false,
  date: Date.now(),
  ballot: false,
}

export interface StateType {
  timer: boolean
  date: number
  ballot: boolean
}

type Types = "SET_TIMER" | "SET_DATE" | "SWITCH_BALLOT"
type TypeBoth = "SET_DATE_TIMER"

export type ActionType = | { type: Types, payload: boolean | number }
  | { type: TypeBoth, payload: Omit<StateType, "ballot"> }

export const toInvalidate = [
  QUERY_KEYS.BALLOT_SETTINGS,
  QUERY_KEYS.CANDIDATES,
  QUERY_KEYS.VOTES,
  QUERY_KEYS.CANDIDATES_BY_VOTES,
  QUERY_KEYS.METADATA,
]

export default function Ballot() {
  const [opened, { open, close }] = useDisclosure(false);
  const [state, dispatch] = useReducer(reducer, initialState)
  const queryClient = useQueryClient()

  const results = useQueries({
    queries: [
      {
        queryKey: [QUERY_KEYS.USERS],
        queryFn: fetchUserList,
        onError: (error: any) => Toast(error.message)
      },
      {
        queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
        queryFn: getBallotSettings,
        onError: (error: any) => Toast(error.message)
      },
      {
        queryKey: [QUERY_KEYS.CANDIDATES_BY_VOTES],
        queryFn: getCandidatesByVotes,
        onError: (error: any) => Toast(error.message),
        select: (data: DocumentI[]) => data.filter(cand => cand.data.enabled === true)
      },
      {
        queryKey: [QUERY_KEYS.VOTES],
        queryFn: getVotesCount,
        onError: (error: any) => Toast(error.message)
      },
    ],
  })

  const { data: usersData, isLoading: loadingUsers, isSuccess: succUsers } = results[0]
  const { data, isLoading, isSuccess } = results[1]
  const { data: candidates, isLoading: loadingCand, isSuccess: succCand } = results[2]

  const enoughCandidates = succCand && candidates.length >= BallotPageMinimums.candidates
  const enoughUsers = succUsers && usersData.userCount >= BallotPageMinimums.users

  const startBallotMutation = useMutation({
    mutationFn: async () => {
      dispatch({ type: "SWITCH_BALLOT", payload: true })
      await startBallot()
    },
    mutationKey: [QUERY_KEYS.START_BALLOT],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: toInvalidate
      })
      close()
      await queryClient.refetchQueries({ type: 'active' })
      Toast("Votación iniciada.", true)
      dispatch({ type: "SWITCH_BALLOT", payload: false })
    },
  })

  const finishBallotMutation = useMutation({
    mutationFn: async () => {
      dispatch({ type: "SWITCH_BALLOT", payload: true })
      await finishBallot()
    },
    mutationKey: [QUERY_KEYS.FINISH_BALLOT],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: toInvalidate
      })
      Toast("Votación finalizada.", true)
      close()
      dispatch({ type: "SWITCH_BALLOT", payload: false })
    },
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      dispatch({ type: "SWITCH_BALLOT", payload: true })
      await resetBallot()
    },
    mutationKey: [QUERY_KEYS.RESET_BALLOT],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: toInvalidate
      })
      await queryClient.refetchQueries({ type: 'active' })
      Toast("Votación reseteada.", true)
      dispatch({ type: "SWITCH_BALLOT", payload: false })
    },
  })

  const onSwitchBallotHandler = (start: boolean) => {
    if (!data) return
    if (state.date < Date.now() && start && state.timer) {
      close()
      Toast("No es posible inicir votaciones con el límite de tiempo actual.")
      return
    }
    if (start && !data.inProgress) startBallotMutation.mutate()
    if (!start && data.inProgress) finishBallotMutation.mutate()
  }

  const onStartVotingHandler = () => {
    if (enoughCandidates && enoughUsers) {
      open()
    } else {
      Toast("No hay suficientes candidatos o usuarios para iniciar votación.")
    }
  }

  const onResetHandler = () => {
    if (data?.inProgress) {
      Toast("Es necesario finalizar la votación actual primero.")
      return
    }
    resetModal()
  }

  const resetModal = () => modals.openConfirmModal({
    title: 'Confirmación',
    children: (
      <Text size="sm" fz="md" mt={10}>
        Seguro que quieres resetear las votaciones? Se eliminarán las estadísticas, votos y otros.
      </Text>
    ),
    labels: { confirm: 'Resetear', cancel: 'Cancelar' },
    confirmProps: { color: "red", variant: "light", size: "sm" },
    cancelProps: { color: "gray", variant: "light", size: "sm" },
    onConfirm: () => resetMutation.mutate(),
  });

  return (
    <>
      <Modal.Root opened={opened} onClose={close} size="md" centered>
        <Modal.Overlay />
        <Modal.Content >
          <Modal.Header>
            <Modal.Title>Confirmación</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <Text fz="md" mt={10}>
              {data && data.inProgress ?
                <>Estás seguro que quieres finalizar las votación? {data.setTimer && data.date > Date.now() && "El límite de tiempo no ha terminado todavía."}</> :
                <>Se iniciará votación con <Badge label={`${succCand && candidates.length} candidatos`} /> y se <b>eliminarán</b> los datos de anteriores votaciones.</>
              }
            </Text>
            <Group position="right" mt="lg">
              <Button variant="light" color="gray" size="sm" onClick={close}>
                Cancelar
              </Button>
              {data && data.inProgress ?
                <Button color="red" variant="light" size="sm" onClick={() => onSwitchBallotHandler(false)} loading={state.ballot}>
                  Finalizar
                </Button> :
                <Button variant="light" size="sm" onClick={() => onSwitchBallotHandler(true)} loading={state.ballot}>
                  Iniciar
                </Button>
              }
            </Group>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <HeaderTitle title='Votaciones' />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="w-full bg-white border shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7]">
          <div className="p-4 md:p-5 relative">
            <h3 className="text-lg text-center font-bold text-gray-800 dark:text-white pb-4">
              Acciones
            </h3>
            <div className="flex flex-col gap-4">
              <Button
                fullWidth
                size="md"
                loading={isLoading || startBallotMutation.isLoading}
                disabled={data && data.inProgress || finishBallotMutation.isLoading}
                onClick={onStartVotingHandler}
              >
                Iniciar votaciones
              </Button>
              <Button
                fullWidth
                size="md"
                color="red"
                loading={isLoading || finishBallotMutation.isLoading}
                disabled={data && !data.inProgress || startBallotMutation.isLoading}
                onClick={open}
              >
                Finalizar votaciones
              </Button>
            </div>
            <div className="absolute top-4 right-4">
              <Tooltip label="Resetear las votaciones">
                <Button variant="default" compact color="dark" onClick={onResetHandler} disabled={resetMutation.isLoading}>
                  <Restart />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
          <div className="flex flex-col h-full items-center justify-center px-10">
            <div className="p-4 md:p-5">
              <div className="flex items-center justify-center">
                <p className="text-sm font-semibold text-gray-500">
                  Usuarios
                </p>
                <Tooltip label="Número de usuarios registrados">
                  <ActionIcon size="lg" variant="transparent">
                    <Question />
                  </ActionIcon>
                </Tooltip>
              </div>

              <div className="flex justify-center items-center mt-2">
                {loadingUsers ? <Loader /> :
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                    <span className={`font-semibold ${enoughUsers ? "" : "text-red-500"}`}>{usersData ? usersData.userCount : "-"}</span> <span className="text-gray-500">/ {BallotPageMinimums.users}</span>
                  </h3>
                }
              </div>
            </div>
          </div>
          <a className="py-3 px-4 md:px-5 inline-flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 hover:bg-gray-50 rounded-b-xl dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-800" href="/dashboard/users">
            Ver más
            <RightArrow />
          </a>
        </div>

        <div className="flex flex-col justify-between bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
          <div className="flex flex-col h-full items-center justify-center px-10">
            <div className="p-4 md:p-5">
              <div className="flex items-center justify-center">
                <p className="text-sm font-semibold text-gray-500">
                  Candidatos
                </p>
                <Tooltip label="Número de candidatos disponibles">
                  <ActionIcon size="lg" variant="transparent">
                    <Question />
                  </ActionIcon>
                </Tooltip>
              </div>
              <div className="flex justify-center items-center mt-2">
                {loadingCand ? <Loader /> :
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl text-gray-800 dark:text-gray-200">
                    <span className={`font-semibold ${enoughCandidates ? "" : "text-red-500"}`}>{succCand && candidates.length}</span> <span className="text-gray-500">/ {BallotPageMinimums.candidates}</span>
                  </h3>
                }
              </div>
            </div>
          </div>
          <a className="py-3 px-4 md:px-5 inline-flex justify-between items-center text-sm text-gray-600 border-t border-gray-200 hover:bg-gray-50 rounded-b-xl dark:border-gray-700 dark:text-gray-400 dark:hover:bg-slate-800" href="/dashboard/candidates">
            Ver más
            <RightArrow />
          </a>
        </div>

        <div className="flex flex-col justify-between bg-white border shadow-sm rounded-xl dark:bg-slate-900 dark:border-gray-800">
          <div className="flex flex-col h-full items-center justify-center p-8 text-md lg:text-lg text-gray-800 font-medium ">
            <Skeleton visible={isLoading} className="flex flex-col items-center justify-center">
              <h3>Estado</h3>
              {(isLoading || !data) ?
                <Loader size="sm" /> :
                <>
                  <Link href="/dashboard/ballot">
                    {data.clean ?
                      <Badge label='Sin iniciar' variant="danger" /> :
                      <>
                        {data.inProgress ?
                          <Badge label='En progreso' variant="success" /> :
                          <Badge label='Finalizadas' variant="danger" />
                        }
                      </>
                    }
                  </Link>
                </>
              }
            </Skeleton>
            <Skeleton visible={isLoading} mt={10} className="flex flex-col items-center justify-center">
              <h3>Fecha de cambios</h3>
              {isSuccess && data && data.timestamp &&
                <Badge label={dayjs(new Date(!isNaN(data.timestamp.seconds) ? data.timestamp.seconds * 1000 : Date.now())).locale('es-mx').format('DD MMMM YYYY hh:mm A')} />
              }
            </Skeleton>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4 lg:mt-8">
        <div className="flex flex-col col-span-12 xl:col-span-8 order-last xl:order-none">
          <div className="overflow-x-auto">
            <div className="min-w-full inline-block align-middle">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
                <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700">

                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    Candidatos
                  </h2>
                </div>
                <CandidatesTable
                  limitData={true}
                  electionInProgress={data && data.inProgress || false}
                  isLoading={loadingCand}
                  isSuccess={succCand}
                  data={candidates?.slice(0, 5)}
                  showVotes={true}
                />

                <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{loadingCand || !succCand ? 0 : candidates.length}</span> candidatos en total
                    {!enoughCandidates && !loadingCand && <b className='pl-2'>(No hay suficientes candidatos)</b>}
                  </p>
                  <Link href="candidates" className="py-2 px-3 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800">
                    Ver todos
                    <RightArrow />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
            {data && !data.clean && results[3].data !== 0 &&
              <Paper withBorder p="lg" radius="md" >
                <CurrentResults />
              </Paper>
            }
            <Paper withBorder p="lg" radius="md" >
              <Timer state={state} dispatch={dispatch} ballotSettings={data} isLoading={isLoading} />
            </Paper>
          </div>
        </div>
      </div>
    </>
  )
}

const reducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "SET_TIMER":
      return {
        ...state,
        timer: action.payload as boolean
      }
    case 'SET_DATE':
      return {
        ...state,
        date: action.payload as number
      }
    case 'SET_DATE_TIMER':
      return {
        ...state,
        date: action.payload.date as number,
        timer: action.payload.timer as boolean
      }
    case 'SWITCH_BALLOT':
      return {
        ...state,
        ballot: action.payload as boolean
      }
    default:
      throw Error('Unknown action')
  }
}