import {
  Menu, Group, Text, Avatar, useMantineTheme, UnstyledButton, rem, createStyles, Stack, Container, Divider
} from '@mantine/core';
import { VariantProps, cva } from "class-variance-authority"
import {
  IconLogout,
  IconSettings,
  IconChevronRight,
  IconChevronDown,
  IconUserPlus
} from '@tabler/icons-react';
import { useState } from 'react';
import { useClerk } from "@clerk/clerk-react";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { fetchMetadata } from '@/lib/user';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, ROLES } from '@/config/types';
import { getInitialNameLetters } from '@/lib/util';

const useStyles = createStyles((theme) => ({
  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    borderBottom: `${rem(1)} solid ${theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[2]
      }`,
    marginBottom: rem(120),
  },
  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },
  },
  userActive: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },
}));

export default function UserMenu({ responsive = true, closeDrawer }: { responsive?: boolean, closeDrawer?: () => void }) {
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const theme = useMantineTheme();
  const { classes, cx } = useStyles();
  const { signOut } = useClerk();
  const { user } = useUser()
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.METADATA],
    queryFn: () => fetchMetadata(),
  })

  return (
    <Group position="center">
      <div className={responsive ? "hidden sm:block" : ""}>
        <Menu
          withArrow
          width={300}
          position="bottom"
          transitionProps={{ transition: 'pop' }}
          withinPortal
          onClose={() => setUserMenuOpened(false)}
          onOpen={() => setUserMenuOpened(true)}
        >
          <Menu.Target>
            <UnstyledButton
              className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
            >
              <Group spacing={7}>
                <Avatar src={user?.profileImageUrl} alt={user?.fullName || ""} size={30} color="blue" className="uppercase">
                  {getInitialNameLetters(user?.fullName)}
                </Avatar>
                <Text weight={500} size="sm" sx={{ lineHeight: 1, color: theme.colorScheme }} mr={3}>
                  {user?.fullName}
                </Text>
                <IconChevronDown size={rem(12)} stroke={1.5} />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item rightSection={<IconChevronRight size="0.9rem" stroke={1.5} />}>
              <Group>
                <Avatar size={40} color="blue" src={user?.profileImageUrl} className="uppercase">
                  {getInitialNameLetters(user?.fullName)}
                </Avatar>
                <div>
                  <Text weight={500}>
                    {user?.fullName?.toString()}
                  </Text>
                  <Text size="xs" color="dimmed">
                    {data && data.metadata.cc}
                  </Text>
                </div>
              </Group>
            </Menu.Item>
            <Menu.Label>Configuración</Menu.Label>
            {data && data.metadata.role === ROLES.ADMIN &&
              <Menu.Item component="a" href="/dashboard" icon={<IconUserPlus size="0.9rem" stroke={1.5} />}>
                Administrador
              </Menu.Item>
            }
            <Menu.Item component="a" href="/profile" icon={<IconSettings size="0.9rem" stroke={1.5} />}>
              Perfil
            </Menu.Item>
            <Menu.Item color="red" onClick={() => signOut()} icon={<IconLogout size="0.9rem" stroke={1.5} />}>
              Cerrar sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
      {responsive &&
        <div className="block w-full sm:hidden">
          <Container>
            <Stack spacing={'sm'}>
              <Divider my="md" color={theme.colorScheme === 'dark' ? 'dark.5' : 'gray.1'} />
              <UnstyledButton>
                <Group>
                  <Avatar size={40} color="blue" src={user?.profileImageUrl}>
                    {getInitialNameLetters(user?.fullName)}
                  </Avatar>
                  <div>
                    <Text>
                      {user?.fullName?.toString()}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {user?.primaryEmailAddress?.toString()}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
              <StyledButton href="/profile" label="Perfil" onClick={closeDrawer} />
              {data && data.metadata.role === ROLES.ADMIN &&
                <StyledButton href="/dashboard" label="Administrador" onClick={closeDrawer} />
              }
              <StyledButton
                variant="warning"
                label="Cerrar sesión"
                onClick={() => {
                  signOut()
                  closeDrawer && closeDrawer()
                }}
              />
            </Stack>
          </Container>
        </div>
      }
    </Group >
  );
}

const buttonVariants = cva(
  "font-semibold transition focus:translate-y-[0.07rem] text-sm rounded-[0.25rem] h-10 py-1 flex justify-center items-center",
  {
    variants: {
      variant: {
        warning: "bg-red-600 text-white hover:bg-red-700",
        default: "bg-blue-650 text-white hover:bg-blue-750"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  label: string,
  className?: string,
  href?: string,
  onClick?: () => void
}

const StyledButton = ({ className, variant, label, href, onClick, ...props }: ButtonProps) => {

  return <>
    {href ?
      <Link
        className={buttonVariants({ variant, className })}
        href={href}
        onClick={onClick}
        {...props}
      >
        {label}
      </Link> :
      <button
        className={buttonVariants({ variant, className })}
        onClick={onClick}
        {...props}
      >
        {label}
      </button>
    }
  </>
}