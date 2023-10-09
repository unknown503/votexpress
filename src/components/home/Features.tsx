import { FeaturedCards } from '@/config/projectData';
import {
  createStyles,
  Badge,
  Group,
  Title,
  Text,
  Card,
  SimpleGrid,
  Container,
  rem,
} from '@mantine/core';


const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 900,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(24),
    },
  },

  description: {
    maxWidth: 600,
    margin: 'auto',

    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },

  card: {
    border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
  },

  cardTitle: {
    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },
}));

export default function FeaturesCards() {
  const { classes, theme } = useStyles();
  const features = FeaturedCards.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <feature.icon size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">
      <Group position="center">
        <Badge variant="filled" size="lg">
          Votaciones sencillas
        </Badge>
      </Group>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Fácilidad, desde cualquier lugar y dispositivo
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Con solo unos pocos clics, podrás elegir a tus representantes y emitir tu voto de manera ágil y eficiente.
        Di adiós a las largas filas y las complicaciones, y disfruta de un sistema electoral eficaz que se adapta a tu ritmo de vida.
      </Text>

      <SimpleGrid cols={3} spacing="xl" mt={50} breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
        {features}
      </SimpleGrid>
    </Container>
  );
}