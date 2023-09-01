import { DocumentI, QUERY_KEYS } from "@/config/types";
import { deleteCandidate, toggleEnabledCandidate } from "@/lib/db";
import { getInitialNameLetters } from "@/lib/util";
import { Avatar, Button, Group, Loader, Modal, Popover, Switch, Text, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Toast from "../Toast";

interface CandidatesTableProps {
  data?: DocumentI[],
  isLoading: boolean,
  isSuccess: boolean,
  showVotes: boolean | undefined,
  electionInProgress: boolean | undefined,
  limitData?: boolean
  isClean?: boolean
}

interface CandidateToDeleteI {
  id: string,
  fullname: string,
  pic: string
}

interface EnabledCandidate {
  id: string, current: boolean
}

export default function CandidatesTable({ data, isLoading, isSuccess, showVotes, electionInProgress, limitData = false, isClean }: CandidatesTableProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [DeletingCand, setDeletingCand] = useState<boolean>(false)
  const [CandidateToDelete, setCandidateToDelete] = useState<CandidateToDeleteI | null>(null)
  const queryClient = useQueryClient()
  const theme = useMantineTheme();

  const deleteMutation = useMutation({
    mutationFn: async ({ id, pic }: CandidateToDeleteI) => {
      if (!id || pic === null) return
      setDeletingCand(true)
      await deleteCandidate(id, pic)
    },
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      Toast("Candidato eliminado", true)
      close()
      setDeletingCand(false)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANDIDATES_BY_VOTES, QUERY_KEYS.CANDIDATES] })
      await queryClient.refetchQueries({ type: 'active' })
    },
  })

  const toggleEnabledMutation = useMutation({
    mutationFn: async ({ id, current }: EnabledCandidate) => {
      await toggleEnabledCandidate(id, current)
    },
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      Toast("Disponibilidad cambiada.", true)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CANDIDATES_BY_VOTES, QUERY_KEYS.CANDIDATES] })
      await queryClient.refetchQueries({ type: 'active' })
    },
  })

  const onDeleteCandidateHandler = (candidate: CandidateToDeleteI) => {
    if (!isClean) {
      Toast("No es posible eliminar candidatos sin haber reseteado las votaciones.")
      return
    }
    setCandidateToDelete(candidate)
    open()
  }

  const onEnabledToggleHandler = ({ id, current }: EnabledCandidate) => {
    if (!isClean) {
      Toast("No es posible cambiar la disponibilidad sin haber reseteado las votaciones.")
      return
    }
    toggleEnabledMutation.mutate({ id, current })
  }

  return (
    <>
      <Modal.Root opened={opened} onClose={close} size="md" centered>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Confirmación</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <Text fz="md" mt={10}>
              Seguro que quieres eliminar al candidato <b>{CandidateToDelete?.fullname}</b> ?
            </Text>
            <Group position="right" mt="lg">
              <Button variant="light" color="gray" size="sm" onClick={close}>
                Cancelar
              </Button>
              <Button color="red" variant="light" size="sm" onClick={() => CandidateToDelete && deleteMutation.mutate(CandidateToDelete)} loading={DeletingCand}>
                Eliminar candidato
              </Button>
            </Group>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      <table className="min-w-full divide-y table-fixed divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th scope="col" className="px-12 py-3 text-left">
              <div className="flex items-center justify-center gap-x-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                  Foto
                </span>
              </div>
            </th>

            <th scope="col" className="px-6 py-3">
              <div className="flex items-center justify-center gap-x-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                  Nombre
                </span>
              </div>
            </th>
            {!limitData &&
              <>
                <th scope="col" className="px-6 py-3 w-[20%]">
                  <div className="flex items-center justify-center gap-x-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                      Propuestas
                    </span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 w-[20%]">
                  <div className="flex items-center justify-center gap-x-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                      Disponibilidad
                    </span>
                  </div>
                </th>
              </>
            }
            {showVotes &&
              <th scope="col" className="px-6 py-3">
                <div className="flex items-center justify-center gap-x-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200">
                    Votos
                  </span>
                </div>
              </th>
            }
            {!limitData && <th scope="col" className="px-6 py-3 text-right"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading &&
            <tr>
              <td colSpan={100} className="py-6">
                <Loader className="mx-auto" />
              </td>
            </tr>
          }
          {isSuccess && data && data.length === 0 ?
            <tr>
              <td colSpan={100} className="py-6 text-center">
                No hay candidatos disponibles.
              </td>
            </tr> : null
          }
          {isSuccess && data && data.map((candidate) =>
            <tr key={candidate.id}>
              <td className="h-px w-px whitespace-nowrap">
                <div className="px-6 py-3 flex justify-center items-center">
                  <Avatar src={candidate.data.pictureUrl} size={96} radius="sm" color="dark" mx="auto" className='uppercase'>
                    {getInitialNameLetters(candidate.data.fullname)}
                  </Avatar>
                </div>
              </td>
              <td className="h-px w-px whitespace-nowrap">
                <div className="px-6 py-3">
                  <div className="flex items-center gap-x-3 text-center">
                    <div className="grow">
                      <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{candidate.data.fullname}</span>
                      <span className="block text-sm text-gray-500 capitalize">{candidate.data.group}</span>
                    </div>
                  </div>
                </div>
              </td>
              {!limitData &&
                <>
                  <td className="h-px w-px whitespace-nowrap">
                    <div className="px-6 py-3 text-center">
                      {candidate.data.proposals === "" ? <Button disabled >Sin propuestas</Button> :
                        <Group position="center">
                          <Popover width={320} position="bottom" withArrow shadow="md">
                            <Popover.Target>
                              <Button color="cyan">Ver propuestas</Button>
                            </Popover.Target>
                            <Popover.Dropdown>
                              <Text size="sm" className="whitespace-pre-line">
                                <ul className="list-disc ml-6 text-left">
                                  {candidate.data.proposals.split("\n").map((proposal: string, i: number) =>
                                    <li key={i} className="whitespace-pre-line break-words">{proposal}</li>
                                  )}
                                </ul>
                              </Text>
                            </Popover.Dropdown>
                          </Popover>
                        </Group>
                      }
                    </div>
                  </td>
                  <td className="h-px w-px whitespace-nowrap">
                    <div className="px-6 py-3 text-center">
                      <Switch
                        checked={candidate.data.enabled}
                        onClick={() => onEnabledToggleHandler({ id: candidate.id, current: candidate.data.enabled })}
                        labelPosition="left"
                        className="flex justify-center"
                        disabled={toggleEnabledMutation.isLoading}
                        size="md"
                        color="teal"
                        thumbIcon={
                          candidate.data.enabled ?
                            <IconCheck size="0.8rem" color={theme.colors.teal[theme.fn.primaryShade()]} stroke={3} /> :
                            <IconX size="0.8rem" color={theme.colors.red[theme.fn.primaryShade()]} stroke={3} />
                        }
                      />
                    </div>
                  </td>
                </>
              }
              {showVotes &&
                <td className="h-px w-px whitespace-nowrap">
                  <div className="px-6 py-3 text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{candidate.data.votes}</span>
                  </div>
                </td>
              }

              {!limitData &&
                <td className="h-px w-px whitespace-nowrap">
                  <div className="px-6 py-1.5">
                    <div className="hs-dropdown relative inline-block [--placement:bottom-right]">
                      <button id="hs-table-dropdown-1" type="button" className="hs-dropdown-toggle py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-md text-gray-700 align-middle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800">
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                        </svg>
                      </button>
                      <div className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden mt-2 divide-y divide-gray-200 min-w-[10rem] z-10 bg-white shadow-2xl rounded-lg p-2  dark:divide-gray-700 dark:bg-gray-800 dark:border dark:border-gray-700" aria-labelledby="hs-table-dropdown-1">
                        <div className="py-2 first:pt-0 last:pb-0">
                          <button onClick={() => onDeleteCandidateHandler({ id: candidate.id, fullname: candidate.data.fullname, pic: candidate.data.pictureName })} className="flex items-center gap-x-3 py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 dark:text-red-500 dark:hover:bg-gray-700">
                            Eliminar candidato
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              }
            </tr>
          )}
        </tbody>
      </table>
    </>
  )
}
