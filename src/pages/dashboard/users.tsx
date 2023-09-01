import HeaderTitle from "@/components/dashboard/HeaderTitle";
import Toast from "@/components/Toast";
import Badge from "@/components/util/Badge";
import { QUERY_KEYS, ROLES } from "@/config/types";
import { deleteUser, fetchUserList, updateUserRole } from "@/lib/user";
import { Avatar, Loader, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface DeleteUserMutation {
  id: string
}

export default function users() {
  const queryClient = useQueryClient()
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: () => fetchUserList(),
    onError: (error: any) => {
      Toast(error.message)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async ({ id }: DeleteUserMutation) => {
      await deleteUser(id)
    },
    mutationKey: [QUERY_KEYS.DELETE_USER],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS]
      })
      await queryClient.refetchQueries({ type: 'active' })
      Toast("Usuario eliminado.", true)
    },
  })

  const userToAdminMutation = useMutation({
    mutationFn: async ({ id }: DeleteUserMutation) => {
      await updateUserRole(id, ROLES.ADMIN)
    },
    mutationKey: [QUERY_KEYS.USER_TO_ADMIN],
    onError: (error: any) => {
      Toast(error.message)
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.USERS,
          QUERY_KEYS.METADATA,
        ]
      })
      await queryClient.refetchQueries({ type: 'active' })
      Toast("Usuario cambiado a administrador.", true)
    },
  })

  const confirmationModal = (isDelete: boolean, id: string, name: string) => modals.openConfirmModal({
    title: 'Confirmación',
    children: (
      <Text size="sm" fz="md" mt={10}>
        Seguro que quieres {isDelete ? "eliminar permanentemente" : "hacer administrador"} al usuario <b>{name}</b>?
      </Text>
    ),
    labels: { confirm: isDelete ? 'Eliminar' : "Aceptar", cancel: 'Cancelar' },
    confirmProps: { color: isDelete ? "red" : "teal", variant: "light", size: "sm" },
    cancelProps: { color: "gray", variant: "light", size: "sm" },
    onConfirm: () => isDelete ? deleteUserMutation.mutate({ id }) : userToAdminMutation.mutate({ id }),
  });

  return (
    <>
      <HeaderTitle title="Usuarios" />
      <div className="flex flex-col">
        <div className="-m-1.5 overflow-x-auto">
          <div className="p-1.5 min-w-full inline-block align-middle">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left">
                      <div className="flex items-center justify-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Nombre
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-left">
                      <div className="flex items-center justify-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Documento
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-left">
                      <div className="flex items-center justify-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Estado
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-left">
                      <div className="flex items-center justify-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Rol
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-left">
                      <div className="flex items-center gap-x-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                          Creación
                        </span>
                      </div>
                    </th>

                    <th scope="col" className="px-6 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(isLoading || deleteUserMutation.isLoading || userToAdminMutation.isLoading) &&
                    <tr>
                      <td colSpan={100} className="py-6">
                        <Loader className="mx-auto" />
                      </td>
                    </tr>
                  }
                  {isSuccess && !deleteUserMutation.isLoading && !userToAdminMutation.isLoading && data.userList.map((user) =>
                    <tr key={user.id}>
                      <td className="h-px w-px whitespace-nowrap">
                        <div className="px-6 py-3">
                          <div className="flex items-center gap-x-3">
                            <Avatar src={user.profileImageUrl} size={30} color="blue" className="uppercase">
                              {user && user.firstName && user.lastName && user.firstName[0] + user.lastName[0]}
                            </Avatar>
                            <div className="grow">
                              <span className="block text-sm font-semibold text-gray-800">{user.firstName} {user.lastName}</span>
                              <span className="block text-sm text-gray-500">{user.emailAddresses[0].emailAddress}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="h-px w-px whitespace-nowrap">
                        <div className="px-6 py-3">
                          <span className="block text-sm font-semibold text-gray-800">{user.privateMetadata.cc || "No disponible"}</span>
                          <span className="block text-sm text-gray-500">C.C</span>
                        </div>
                      </td>
                      <td className="h-px w-px whitespace-nowrap">
                        <div className="px-6 py-3 text-center">
                          {user.privateMetadata.vote?.status
                            ? <Badge label="Ha votado" icon="check" variant="success" />
                            : <Badge label="Sin votar" icon="danger" variant="danger" />
                          }
                        </div>
                      </td>
                      <td className="h-px w-px whitespace-nowrap">
                        <div className="px-6 py-3 text-center">
                          <Badge
                            label={user.privateMetadata.role === ROLES.ADMIN ? "Admin" : "Usuario"}
                            variant={user.privateMetadata.role === ROLES.ADMIN ? "primary" : "default"}
                          />
                        </div>
                      </td>
                      <td className="h-px w-px whitespace-nowrap">
                        <div className="px-6 py-3">
                          <span className="text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString("en-US")}</span>
                        </div>
                      </td>
                      <td className="h-px w-px whitespace-nowrap">
                        {user.privateMetadata.role !== ROLES.ADMIN &&
                          <div className="px-6 py-1.5">
                            <div className="hs-dropdown relative inline-block [--placement:bottom-right]">
                              <button id="hs-table-dropdown-1" type="button" className="hs-dropdown-toggle py-1.5 px-2 inline-flex justify-center items-center gap-2 rounded-md text-gray-700 align-middle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm-gray-800">
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                </svg>
                              </button>
                              <div className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden divide-y divide-gray-200 min-w-[10rem] z-10 bg-white shadow-2xl rounded-lg p-2 mt-2" aria-labelledby="hs-table-dropdown-1">
                                <div className="py-2 first:pt-0 last:pb-0">
                                  <button
                                    className="flex items-center w-full gap-x-3 py-2 px-3 rounded-md text-sm hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
                                    onClick={() => confirmationModal(false, user.id, `${user.firstName} ${user.lastName}`)}
                                  >
                                    Hacer admin
                                  </button>
                                  <button
                                    className="flex items-center w-full gap-x-3 py-2 px-3 rounded-md text-sm text-red-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
                                    onClick={() => confirmationModal(true, user.id, `${user.firstName} ${user.lastName}`)}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{data ? data.userCount : 0}</span> usuarios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
