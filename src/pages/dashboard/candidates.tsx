import HeaderTitle from "@/components/dashboard/HeaderTitle";
import { Add } from "@/components/icons/Icons";
import Toast from "@/components/Toast";
import { addCandidate, deleteAllCandidates, getBallotSettings, getCandidatesByVotes, uploadCandidatePicture } from "@/lib/db";
import { Button, Container, createStyles, Group, Modal, rem, SimpleGrid, Stack, Switch, Text, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DateInput } from '@mantine/dates';
import { Dropzone, FileWithPath, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconX, IconDownload, IconTrash } from '@tabler/icons-react';
import { useRef, useState } from "react";
import { addCandidateI, QUERY_KEYS } from "@/config/types";
import { useForm } from "@mantine/form";
import { useId } from '@mantine/hooks';
import CandidatesTable from "@/components/dashboard/CandidatesTable";
import { modals } from '@mantine/modals'

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    marginBottom: rem(30),
    marginTop: rem(10),
  },

  dropzone: {
    borderWidth: rem(1),
    paddingBottom: rem(50),
  },

  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
  },

  control: {
    position: 'absolute',
    width: rem(250),
    left: `calc(50% - ${rem(125)})`,
    bottom: rem(-20),
  },
}));

type OmitFullname = Omit<addCandidateI, "fullname" | "pictureUrl" | "pictureName" | "enabled">

interface CandidatesFormI extends OmitFullname {
  firstname: string,
  lastname: string,
}

export default function candidates() {
  const uuid = useId();
  const [PicFile, setPicFile] = useState<File | null>(null)
  const [SendForm, setSendForm] = useState<boolean>(false)
  const [EnableCand, setEnableCand] = useState<boolean>(true)
  const openRef = useRef<() => void>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const queryClient = useQueryClient()

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [QUERY_KEYS.CANDIDATES_BY_VOTES],
    queryFn: () => getCandidatesByVotes(),
    onError: (error: any) => Toast(error.message),
  })

  const { data: ballot } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => Toast(error.message)
  })

  const form = useForm<CandidatesFormI>({
    initialValues: {
      firstname: '',
      lastname: '',
      group: '',
      proposals: '',
      birth_date: undefined,
    },

    validate: {
      firstname: (value) => (value.length < 5 ? 'Nombre muy corto' : null),
      lastname: (value) => (value.length < 2 ? 'Apellido muy corto' : null),
      group: (value) => (value.length < 5 ? 'Partido muy corto' : null),
    },
  });

  const newCandidateMutation = useMutation({
    mutationFn: async () => {
      let picUrl = ""
      let name = ""

      if (PicFile) {
        const { fullName, url } = await uploadCandidatePicture(PicFile, uuid.split("-")[1])
        picUrl = url
        name = fullName
      }

      const { firstname, lastname, group, proposals, birth_date } = form.values
      const candidate: addCandidateI = {
        fullname: firstname + " " + lastname,
        pictureUrl: picUrl,
        pictureName: name,
        group,
        proposals,
        birth_date,
        enabled: EnableCand
      }
      const res = await addCandidate(candidate)
      return res
    },
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.CANDIDATES,
          QUERY_KEYS.CANDIDATES_BY_VOTES,
        ]
      })
      await queryClient.refetchQueries({ type: 'active' })
      Toast("Candidato creado", true)
      form.reset()
      setSendForm(false)
      close()
    },
  })

  const removeAllCandidatesMutation = useMutation({
    mutationFn: async () => {
      await deleteAllCandidates()
    },
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.CANDIDATES,
          QUERY_KEYS.CANDIDATES_BY_VOTES,
        ]
      })
      await queryClient.refetchQueries({ type: 'active' })
      Toast("Candidatos eliminados", true)
    },
  })

  const SubtmitForm = async () => {
    setSendForm(true)
    form.clearErrors()
    newCandidateMutation.mutate()
  }
  const NewCandidateHandler = () => {
    if (ballot && !ballot.clean) {
      Toast("No se pueden crear nuevos candidatos sin haber reseteado las votaciones.")
      return
    }
    open()
  }

  const removeCandidatesModal = () => modals.openConfirmModal({
    title: 'Confirmación',
    children: (
      <Text size="sm" fz="md" mt={10}>
        Seguro que quieres eliminar a todos los candidatos?
      </Text>
    ),
    labels: { confirm: 'Eliminarlos todos', cancel: 'Cancelar' },
    confirmProps: { color: "red", variant: "light", size: "sm" },
    cancelProps: { color: "gray", variant: "light", size: "sm" },
    onConfirm: () => removeAllCandidatesMutation.mutate(),
  });

  const RemoveAllCandidatesHandler = () => {
    if (ballot && !ballot.clean) {
      Toast("No es posible eliminar candidatos sin haber reseteado las votaciones.")
      return
    }
    if (data && data.length === 0 || isLoading) return
    removeCandidatesModal()
  }

  return (
    <>
      <Modal.Root opened={opened} onClose={close} centered size="lg">
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Crear candidato</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <Container>
              <form onSubmit={form.onSubmit(SubtmitForm)} >
                <div className="flex flex-col gap-2">
                  <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                    <TextInput
                      label="Nombre"
                      placeholder="Nombre"
                      required
                      data-autofocus
                      {...form.getInputProps('firstname')}
                    />
                    <TextInput
                      label="Apellido"
                      placeholder="Apellido"
                      required
                      {...form.getInputProps('lastname')}
                    />
                  </SimpleGrid>
                  <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
                    <TextInput
                      label="Partido/Grupo"
                      placeholder="Demócrata"
                      required
                      {...form.getInputProps('group')}
                    />

                    <div>
                      <Switch.Group
                        label="Habilitar para votación"
                      >
                      </Switch.Group>
                      <Switch
                        checked={EnableCand}
                        onClick={() => setEnableCand(v => !v)}
                        label={EnableCand ? "Disponible" : "No disponible"}
                        className="pt-2"
                      />
                    </div>
                  </SimpleGrid>
                  <DateInput
                    dateParser={(input) => {
                      if (input === 'WW2') {
                        return new Date(1939, 8, 1);
                      }
                      return new Date(input);
                    }}
                    allowDeselect={true}
                    valueFormat="DD/MM/YYYY"
                    label="Fecha de nacimiento"
                    placeholder="Fecha de nacimiento"
                    required
                    {...form.getInputProps('birth_date')}
                  />
                  <Textarea
                    label="Propuestas"
                    placeholder="Una por cada línea"
                    autosize
                    minRows={2}
                    maxRows={14}
                    {...form.getInputProps('proposals')}
                  />
                  <div className={classes.wrapper}>
                    <Dropzone
                      openRef={openRef}
                      onDrop={(files: FileWithPath[]) => {
                        setPicFile(files[0])
                      }}
                      className={classes.dropzone}
                      radius="md"
                      accept={[MIME_TYPES.jpeg, MIME_TYPES.png]}
                      maxSize={30 * 1024 ** 2}
                      maxFiles={1}
                      multiple={false}
                      name="picture"
                    >
                      <div style={{ pointerEvents: 'none' }}>
                        <Group position="center">
                          <Dropzone.Accept>
                            <IconDownload
                              size={rem(50)}
                              color={theme.colors[theme.primaryColor][6]}
                              stroke={1.5}
                            />
                          </Dropzone.Accept>
                          <Dropzone.Reject>
                            <IconX size={rem(50)} color={theme.colors.red[6]} stroke={1.5} />
                          </Dropzone.Reject>
                          <Dropzone.Idle>
                            <IconCloudUpload
                              size={rem(50)}
                              color={theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black}
                              stroke={1.5}
                            />
                          </Dropzone.Idle>
                        </Group>

                        <Text ta="center" fw={700} fz="lg" mt="xl">
                          <Dropzone.Accept>Arrastra la imagen aquí</Dropzone.Accept>
                          <Dropzone.Reject>Solo imagen de &#60; 30mb</Dropzone.Reject>
                          <Dropzone.Idle>Subir {!PicFile ? "imagen" : PicFile.name}</Dropzone.Idle>
                        </Text>
                        <Text ta="center" fz="sm" mt="xs" c="dimmed">
                          Arrastra una imagen con formato <i>.jpg</i> o <i>.png</i> que pese menos de 30mb.
                        </Text>
                      </div>
                    </Dropzone>

                    <Button className={classes.control} size="md" radius="xl" onClick={() => openRef.current?.()}>
                      Seleccionar imagen
                    </Button>
                  </div>
                </div>
                <Stack align="center">
                  <Button type="submit" className="text-right" mt="xl" loading={SendForm}>
                    Guardar candidato
                  </Button>
                </Stack>
              </form>
            </Container>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <HeaderTitle title="Candidatos" />
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden dark:bg-slate-900 dark:border-gray-700">
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200 dark:border-gray-700">
                <div className="inline-flex">
                  <Button leftIcon={<Add />} onClick={NewCandidateHandler} >
                    Añadir candidato nuevo
                  </Button>
                </div>
                <div className="inline-flex">
                  <Button
                    leftIcon={<IconTrash size={20} />}
                    onClick={RemoveAllCandidatesHandler}
                    color="red"
                    disabled={removeAllCandidatesMutation.isLoading || data && data.length === 0 || isLoading}
                  >
                    Eliminar todos los candidatos
                  </Button>
                </div>
              </div>
              <CandidatesTable
                electionInProgress={ballot && ballot.inProgress}
                showVotes={ballot && ballot.inProgress}
                data={data}
                isLoading={isLoading}
                isSuccess={isSuccess}
                isClean={ballot?.clean}
              />
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{isLoading ? 0 : data?.length}</span> candidatos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
