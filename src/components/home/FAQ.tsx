import { FAQs } from '@/config/projectData';
import { Container, Title, Accordion, createStyles, rem } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 2)`,
    paddingBottom: `calc(${theme.spacing.xl} * 2)`,
  },

  title: {
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
  },

  item: {
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
    border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
  },
}));

export default function FaqSimple() {
  const { classes } = useStyles();
  return (
    <Container size="sm" className={classes.wrapper}>
      <Title align="center" className={classes.title}>
        Preguntas frecuentes
      </Title>

      <Accordion variant="separated">
        {FAQs.map((faq, i) =>
          <Accordion.Item
            className={classes.item}
            value={i.toString()}
            key={i}
          >
            <Accordion.Control>{faq.question}</Accordion.Control>
            <Accordion.Panel>{faq.answer}</Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>
    </Container>
  );
}