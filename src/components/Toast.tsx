import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface OptionTypes {
  message: string,
  title: string,
  color: string,
  icon?: JSX.Element,
  autoClose: boolean
}

export default function Toast(message: string, success?: boolean): void {
  const options: OptionTypes = {
    message,
    title: success ? "Éxito" : "Error",
    color: success ? "green" : "red",
    icon: success ? <IconCheck /> : <IconX />,
    autoClose: true,
  }
  notifications.show(options)
}
