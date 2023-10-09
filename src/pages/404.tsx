import { createStyles, Container, Title, Text, Button, Group, rem, Image, Center, Anchor } from '@mantine/core';
import NotFound from '/public/404.svg';

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(20),
    paddingBottom: rem(20),
  },

  inner: {
    position: 'relative',
  },

  image: {
    ...theme.fn.cover(),
    opacity: 0.1,
  },

  content: {
    paddingTop: rem(220),
    position: 'relative',
    zIndex: 1,

    [theme.fn.smallerThan('sm')]: {
      paddingTop: rem(120),
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(32),
    },
  },

  description: {
    maxWidth: rem(540),
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },
}));

export default function NothingFoundBackground() {
  const { classes } = useStyles();

  return (
    <Center h={'90vh'} mx="auto">
      <Container className={classes.root} >
        <div className={classes.inner}>
          <Image src={NotFound.src} className={classes.image} />
          <div className={classes.content}>
            <Title className={classes.title}>Nada por aquí</Title>
            <Text color="dimmed" size="lg" align="center" className={classes.description}>
              La página que estás intentando abrir no existe. Puede que hayas escrito incorrectamente la dirección.
              Si crees que esto es un error, ponte en contacto con el soporte técnico.
            </Text>
            <Group position="center">
              <Button size="md">
                <a href="/">Página de inicio</a>
              </Button>
            </Group>
          </div>
        </div>
      </Container>
    </Center>
  );
}