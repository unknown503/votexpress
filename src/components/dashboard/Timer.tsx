import { Button, Loader, Switch, Text, useMantineTheme } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { modals } from "@mantine/modals"
import { DatesProvider, DateTimePicker, DateValue } from '@mantine/dates'
import Toast from '../Toast'
import dayjs from 'dayjs'
import Countdown from 'react-countdown';
import { Dispatch, useEffect } from 'react'
import { ActionType, StateType } from '@/pages/dashboard/ballot'
import { DocumentData } from 'firebase/firestore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changeTimerSettings } from '@/lib/db'
import { BallotTypes, QUERY_KEYS } from '@/config/types'
import 'dayjs/locale/es-mx'
import useFinishBallotMutation from '@/lib/hooks/useFinishBallotMutation'

const convertDate = (d: any) => parseInt((new Date(d).getTime() / 1000).toFixed(0))

interface Props {
  state: StateType,
  dispatch: Dispatch<ActionType>
  ballotSettings?: BallotTypes
  isLoading: boolean
}

export default function Timer({ state, dispatch, ballotSettings, isLoading }: Props) {
  const theme = useMantineTheme()
  const queryClient = useQueryClient()
  const finishBallot = useFinishBallotMutation()

  const timerMutation = useMutation({
    mutationFn: async () => {
      await changeTimerSettings(state.timer, state.date)
    },
    mutationKey: [QUERY_KEYS.BALLOT_SETTINGS],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BALLOT_SETTINGS] })
      Toast("Límite cambiado exitosamente.", true)
    },
  })

  useEffect(() => {
    if (!ballotSettings) return
    dispatch({
      type: 'SET_DATE_TIMER',
      payload: {
        date: ballotSettings.date,
        timer: ballotSettings.setTimer || false
      }
    })
  }, [ballotSettings])

  const openSwitchModal = () => {
    if (state.date === ballotSettings?.date && state.timer === ballotSettings?.setTimer) return
    
    if (convertDate(state.date) < convertDate(Date.now()) && state.timer) {
      Toast("No es posible iniciar el límite con esta fecha")
      return
    }
    if (ballotSettings && ballotSettings.inProgress) {
      Toast("No es posible cambiar el límite de tiempo en una votación en progreso.")
      return
    }

    modals.openConfirmModal({
      title: 'Confirmación',
      children: (
        <Text size="sm" fz="md" mt={10}>
          Seguro que quieres <b>{!state.timer ? "desactivar" : "activar"}</b> el límite de tiempo{state.timer && <> hasta <b>{dayjs(state.date).format("DD/MM/YYYY hh:mm A")}</b></>}?
        </Text>
      ),
      labels: { confirm: !state.timer ? "Desactivar" : "Activar", cancel: 'Cancelar' },
      confirmProps: { color: !state.timer ? "red" : "teal", variant: "light", size: "sm" },
      cancelProps: { color: "gray", variant: "light", size: "sm" },
      onConfirm: () => timerMutation.mutate()
    })
  }

  const onDateChange = (date: DateValue) => {
    if (!date) return

    if (ballotSettings && ballotSettings.inProgress) {
      Toast("No es posible cambiar el límite de tiempo en una votación en progreso.")
      return
    }

    if (convertDate(date) > convertDate(Date.now())) {
      const newDate = new Date(date).getTime()
      dispatch({ type: 'SET_DATE', payload: newDate })
    } else {
      Toast("No es posible elegir esta fecha")
    }
  }

  const onToggleTimer = (checked: boolean) => {
    if (convertDate(state.date) > convertDate(Date.now())) {
      dispatch({ type: 'SET_TIMER', payload: checked })
    } else {
      Toast("No es posible cambiar el límite de tiempo con esta fecha.")
    }
  }

  return (
    <div className='flex flex-col gap-5 justify-center items-center min-h-[200px]'>
      {(isLoading || !ballotSettings) ? <Loader className="mx-auto" /> :
        <>
          <h2 className='text-lg font-bold'>Límite de tiempo</h2>
          <Switch
            checked={state.timer}
            onChange={(e) => onToggleTimer(e.currentTarget.checked)}
            color="teal"
            size="md"
            label={`Limite ${state.timer ? "activado" : "desactivado"}`}
            disabled={timerMutation.isLoading}
            thumbIcon={
              state.timer ?
                <IconCheck size="0.8rem" color={theme.colors.teal[theme.fn.primaryShade()]} stroke={3} /> :
                <IconX size="0.8rem" color={theme.colors.red[theme.fn.primaryShade()]} stroke={3} />
            }
          />
          <div className='w-full'>
            <DatesProvider settings={{ locale: 'es-mx' }}>
              <DateTimePicker
                valueFormat="DD MMM YYYY hh:mm A"
                label="Selecciona fecha y hora"
                defaultValue={new Date()}
                maw={400}
                mx="auto"
                value={new Date(state.date)}
                onChange={onDateChange}
                dropdownType="modal"
                disabled={timerMutation.isLoading}
              />
            </DatesProvider>
          </div>
          <Button
            variant="default"
            fullWidth
            onClick={openSwitchModal}
            loading={timerMutation.isLoading}
            className="max-w-[25rem]"
          >
            Guardar cambios
          </Button>
          {state.timer &&
            <div>
              <h2 className='text-lg font-bold text-center pb-3'>Tiempo restante</h2>
              <Countdown
                date={Date.now() + dayjs(dayjs(state.date)).diff(new Date())}
                intervalDelay={0}
                precision={3}
                onComplete={() => finishBallot.mutate()}
                renderer={({ days, completed, hours, minutes, seconds }) =>
                  <div className='text-center'>
                    {completed ? "Tiempo límite terminado" :
                      <>
                        {days !== 0 && <>{days} día{days !== 1 && "s"} </>}
                        {hours !== 0 && <>{hours} hora{hours !== 1 && "s"} </>}
                        {minutes !== 0 && <>{minutes} minuto{minutes !== 1 && "s"} </>}
                        {days === 0 && hours === 0 && <>{seconds} segundo{seconds !== 1 && "s"} </>}
                      </>
                    }
                  </div>
                }
              />
            </div>
          }
        </>
      }
    </div>
  )
}