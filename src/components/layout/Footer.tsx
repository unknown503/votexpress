import { Links } from '@/config/links';
import { Project } from '@/config/projectData';
import { QUERY_KEYS } from '@/config/types';
import { getBallotSettings } from '@/lib/db';
import { useUser } from '@clerk/nextjs';
import { createStyles, Container, Group, Anchor, rem } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useMemo } from 'react';
import Toast from '../Toast';

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: rem(20),
    borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
      }`,
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column',
    },
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      marginTop: theme.spacing.md,
    },
  },
}));


export default function Footer() {
  const { classes } = useStyles();
  const { isSignedIn } = useUser()
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => Toast(error.message),
    refetchInterval: Project.refetchInterval
  })

  const filteredLinks: typeof Links = useMemo(() => {
    return Links.filter((link) => {
      const isElectionLink = link?.election === undefined ? true : link?.election === data?.inProgress
      const isNonUser = link?.nonUsers === !isSignedIn
      const isSignedInOrNonUserLink = link?.auth === isSignedIn || isNonUser
      const isNonClean = link?.nonClean !== data?.clean
      return isNonUser || isElectionLink && isSignedInOrNonUserLink && isNonClean && !link.component ? link : null
    })
  }, [isSignedIn, data])

  const items = filteredLinks.map((link) => (
    <Anchor<'a'>
      color="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event: any) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Link href="/" className="font-medium text-2xl">{Project.name}</Link>
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  );
}