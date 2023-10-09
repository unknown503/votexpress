import Toast from '@/components/Toast';
import { QUERY_KEYS } from '@/config/types';
import { getUserPrivMetadata, updateUserCC } from '@/lib/user';
import { useUser } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import {
  createStyles,
  Paper,
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Group,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(26),
    fontWeight: 900,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  controls: {
    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column-reverse',
    },
  },

  control: {
    [theme.fn.smallerThan('xs')]: {
      width: '100%',
      textAlign: 'center',
    },
  },
}));

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { userId } = getAuth(ctx.req)


  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false
      }
    }
  }

  const { cc } = await getUserPrivMetadata(userId)
  if (cc) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }
  }

  return { props: {} }
}

export default function UserCC() {
  const { classes } = useStyles();
  const { user } = useUser()
  const router = useRouter()
  const [SendingForm, setSendingForm] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const form = useForm({
    initialValues: {
      cc: '',
    },

    validate: {
      cc: (val) => (/^\d+$/.test(val) && val.length >= 10 ? null : 'Cédula inválida'),
    },
  });

  const mutation = useMutation({
    mutationFn: async (cc: string) => {
      if (!user?.id) return
      const res = await updateUserCC(user.id, cc)
      return res
    },
    onError: (error: any) => {
      Toast(error.message,)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.METADATA] })
      Toast(data.message, true)
      router.replace("/")
    },
  })

  const SubtmitForm = async () => {
    setSendingForm(true)
    form.clearErrors()
    const { cc } = form.values
    mutation.mutate(cc)
  }

  return (
    <main className="flex justify-center items-center h-[80vh] my-4">
      <Container size={460} my={30}>
        <form onSubmit={form.onSubmit(SubtmitForm)}>
          <Title className={classes.title} align="center">
            Solo un último paso
          </Title>
          <Text c="dimmed" fz="sm" ta="center">
            Ingresa el número de cédula que aparece en tu documento
          </Text>

          <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
            <TextInput label="Cédula de ciudadanía" placeholder="1234567890" type="number" withAsterisk {...form.getInputProps('cc')} />
            <Group mt="lg" className={classes.controls}>
              <Button type="submit" fullWidth className={classes.control} disabled={SendingForm}>
                {SendingForm && (
                  <div className="animate-spin mr-2 inline-block w-5 h-5 border-[3px] border-current border-t-transparent text-gray-400 rounded-full" role="status" aria-label="loading">
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
                {SendingForm ? "Guardando" : "Guardar"}
              </Button>
            </Group>
          </Paper>
        </form>
      </Container>
    </main>
  );
}