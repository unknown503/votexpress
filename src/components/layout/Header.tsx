import { NavLinks } from '@/config/links';
import {
  createStyles,
  Header,
  Group,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  rem,
  Container
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';
import { Project } from '@/config/projectData';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/config/types';
import { getBallotSettings } from '@/lib/db';
import Toast from '../Toast';

const useStyles = createStyles((theme) => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    paddingBlock: `${rem(8)}`,
    borderRadius: theme.radius.sm,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: rem(42),
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1]
    }),
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    }),

    '&:active': theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}));

export default function MainHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const { classes, theme } = useStyles();

  return (
    <Box>
      <Header height={60} >
        <Container sx={{ height: '100%' }}>
          <Group position="apart" sx={{ height: '100%' }}>
            <Link href="/" className="font-medium text-2xl">{Project.name}</Link>
            <Group sx={{ height: '100%' }} spacing="sm" className={classes.hiddenMobile}>
              <NavLinksComponent />
            </Group>
            <Burger opened={drawerOpened} onClick={toggleDrawer} className={classes.hiddenDesktop} />
          </Group>
        </Container>
      </Header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title={Project.name}
        className={classes.hiddenDesktop}
        zIndex={1000000}
      >
        <ScrollArea mx="-md">
          <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
          <NavLinksComponent closeDrawer={closeDrawer}/>
          <Divider my="sm" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
        </ScrollArea>
      </Drawer>
    </Box>
  );
}

interface NavLinksProps {
  closeDrawer?: () => void
}

function NavLinksComponent({ closeDrawer }: NavLinksProps) {
  const { isSignedIn } = useUser()
  const { classes } = useStyles();
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => Toast(error.message),
  })

  const filteredLinks = useMemo(() => {
    return NavLinks.filter((link) => {
      const isElectionLink = link?.election === undefined ? true : link?.election === data?.inProgress
      const isNonUser = link?.nonUsers === !isSignedIn
      const isSignedInOrNonUserLink = link?.auth === isSignedIn || isNonUser
      const isNonClean = link?.nonClean !== data?.clean
      return isNonUser || isElectionLink && isSignedInOrNonUserLink && isNonClean ? link : null
    })
  }, [isSignedIn, data])

  return <>
    {filteredLinks.map((link) => link?.component ?
      <link.component key={link.label} closeDrawer={closeDrawer} /> :
      <Link href={link.link} className={classes.link} key={link.label} onClick={closeDrawer}>
        {link.label}
      </Link>
    )}
  </>
}