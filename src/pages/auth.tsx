import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  Container,
} from '@mantine/core';
import GoogleButton from '@/components/social/GoogleButton';
import { signIn } from 'next-auth/react';

export default function AuthenticationForm(props: PaperProps) {
  const [type, toggle] = useToggle(['login', 'register']);
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: false,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  const SubtmitForm = () => {
    form.clearErrors()
  }

  return (
    <Container h="80vh" className='flex justify-center items-center'>
      <Paper radius="md" p="xl" withBorder {...props} w="500px">
        <Text size="lg" weight={500} align="center">
          {
            type === "login" ? "Iniciar sesión" : "Registrarse"
          }
        </Text>

        <Group grow mb="md" mt="md">
          <GoogleButton radius="xl">Google</GoogleButton>
        </Group>

        <Divider label="O" labelPosition="center" my="lg" />

        <form onSubmit={form.onSubmit(SubtmitForm)}>
          <Stack>
            {type === 'register' && (
              <TextInput
                label="Name"
                placeholder="Your name"
                value={form.values.name}
                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                radius="md"
              />
            )}

            <TextInput
              required
              label="Email"
              placeholder="hello@mantine.dev"
              value="auth@gmail.com"
              // value={form.values.email}
              onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
              error={form.errors.email && 'Invalid email'}
              radius="md"
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
              error={form.errors.password && 'Password should include at least 6 characters'}
              radius="md"
            />

            {type === 'register' && (
              <Checkbox
                label="I accept terms and conditions"
                checked={form.values.terms}
                onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
              />
            )}

            <Button type="submit" radius="xl" className='w-full'
              onClick={() => signIn()}
            >
              {upperFirst(type)}
            </Button>
            <Anchor
              component="button"
              type="button"
              color="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === 'register'
                ? 'Ya tienes cuenta? Inicia sesión'
                : "No tienes cuenta? Regístrate"}
            </Anchor>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}