import { SidebarDashboardLinks } from '@/config/links';
import { Project, Titles } from '@/config/projectData';
import { QUERY_KEYS, SidebarLinkI } from '@/config/types';
import { ActionIcon, Loader } from '@mantine/core';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react'
import Badge from '../util/Badge';
import UserMenu from './UserMenu';
import Toast from '../Toast';
import { useQuery } from '@tanstack/react-query';
import { getBallotSettings } from '@/lib/db';
import { IconCheck, IconX } from '@tabler/icons-react';
import { RightArrow } from '../icons/Icons';
import useIsMobile from '@/lib/hooks/useIsMobile';

interface Props {
  children: ReactNode;
}

interface Breadcrumb {
  label: string
  href: string
}

export default function AdminSidebarAndHeader({ children }: Props) {
  const router = useRouter()
  const [Breadcrumb, setBreadcrumb] = useState<Breadcrumb[]>([])
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.BALLOT_SETTINGS],
    queryFn: () => getBallotSettings(),
    onError: (error: any) => {
      Toast(error.message)
    },
    refetchInterval: Project.refetchInterval
  })

  useEffect(() => {
    const sections = router.asPath.split("/")
    sections.shift()

    let breadcrumb: Breadcrumb[] = []
    sections.map((section, i) => {

      const existingKey = Object.keys(Titles).includes(`dash-${section}`)
      const temporalSection = Titles[(existingKey ? `dash-${section}` : section) as keyof typeof Titles]

      const href = '/' + sections.slice(0, i + 1).join('/');
      const label = temporalSection ? temporalSection : section.charAt(0).toUpperCase() + section.slice(1)
      breadcrumb.push({ label, href })
    })
    setBreadcrumb(breadcrumb)
  }, [router])


  return (
    <>
      <header className="sticky top-0 inset-x-0 flex flex-wrap sm:justify-start sm:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 sm:py-3 lg:pl-64">
        <nav className="flex basis-full items-center w-full mx-auto px-4 sm:px-6 md:px-8" aria-label="Global">
          <div className="mr-5 lg:mr-0 lg:hidden">
            <Link className="flex-none text-xl font-semibold" href="/" aria-label="Brand">{Project.name}</Link>
          </div>

          <div className="w-full flex items-center ml-auto justify-between gap-2 sm:gap-x-3 sm:order-3">
            <div className="hidden lg:inline-flex text-xl gap-2 items-center">
              <h5>Votaciones: </h5>
              {(isLoading || !data) ?
                <Loader size="sm" /> :
                <>
                  <Link href="/dashboard/ballot">
                    {data.clean ?
                      <Badge label='Sin iniciar' variant="danger" /> :
                      <>
                        {data.inProgress ?
                          <Badge label='En progreso' variant="success" /> :
                          <Badge label='Finalizadas' variant="danger" />
                        }
                      </>
                    }
                  </Link>
                </>
              }
            </div>
            <div className="block lg:hidden">
              <Link href="/dashboard/ballot">
                {!isLoading ?
                  <ActionIcon color={data && data.inProgress ? "green" : "red"} size="lg" radius="md" variant="light">
                    {
                      data && data.inProgress ?
                        <IconCheck size={26} color="green" />
                        :
                        <IconX size={26} color="red" />
                    }
                  </ActionIcon>
                  : <Loader size="sm" />
                }
              </Link>
            </div>
            <UserMenu responsive={false} />
          </div>
        </nav>
      </header>

      <div className="sticky top-0 inset-x-0 z-20 bg-white border-y px-4 sm:px-6 md:px-8 lg:hidden">
        <div className="flex items-center py-4">
          <button type="button" className="text-gray-500 hover:text-gray-600" data-hs-overlay="#application-sidebar" aria-controls="application-sidebar" aria-label="Toggle navigation">
            <span className="sr-only">Toggle Navigation</span>
            <svg className="w-5 h-5" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
            </svg>
          </button>

          <ol className="ml-3 flex items-center gap-1 whitespace-nowrap min-w-0" aria-label="Breadcrumb">
            <li className="flex items-center gap-1 text-sm text-gray-800">
              <a href="/">Inicio</a>
              <RightArrow classProps='flex-shrink-0 overflow-visible' />
            </li>
            {Breadcrumb.map((item, i) =>
              <li
                className={`flex items-center gap-1 text-sm ${Breadcrumb.length - 1 === i ? "font-semibold" : ""} text-gray-800 truncate`}
                aria-current="page"
                key={i}
              >
                <a href={item.href}>{item.label}</a>
                {Breadcrumb.length - 1 !== i && <RightArrow classProps='flex-shrink-0 overflow-visible' />}
              </li>
            )}
          </ol>
        </div>
      </div>

      <div id="application-sidebar" className="hs-overlay hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform hidden fixed top-0 left-0 bottom-0 z-[60] w-64 bg-white border-r border-gray-200 pt-7 pb-10 overflow-y-auto scrollbar-y lg:block lg:translate-x-0 lg:right-auto lg:bottom-0">
        <div className="px-6">
          <Link className="flex-none text-xl font-semibold" href="/" aria-label="Brand">{Project.name}</Link>
        </div>

        <nav className="hs-accordion-group p-6 w-full flex flex-col flex-wrap" data-hs-accordion-always-open>
          <ul className="space-y-1.5">
            {SidebarDashboardLinks.map(link => <SidebarLink key={link.label} {...link} />)}
          </ul>
        </nav>
      </div>

      <div className="h-[82.5vh] md:h-[82.5vh] lg:h-[88.5vh] mt-8 px-4 sm:px-6 md:px-16 lg:pl-80">
        <div className="pb-8">
          {children}
        </div>
      </div>
    </>
  )
}

function SidebarLink({ icon, label, href, subitems }: SidebarLinkI) {
  const isMobile = useIsMobile()
  const areThereSubitems = subitems && subitems?.length > 0
  const router = useRouter()
  const pathname = router.asPath
  const liProps = areThereSubitems ? { className: "hs-accordion", id: `${label}-accordion` } : null

  const subRoute = href?.split("/")[2]
  const activeLink = subRoute ? pathname.split("/dashboard")[1].includes(subRoute) : pathname === "/dashboard" ? true : false
  const props = isMobile ? {
    "data-hs-overlay": "#application-sidebar",
    "aria-controls": "application-sidebar"
  } : {}

  return (
    <li {...liProps}>
      <Link
        href={areThereSubitems ? "" : href ? href : ""}
        className={`${areThereSubitems ? "hs-accordion-toggle" : ""} ${activeLink ? "bg-gray-100" : ""} 
        flex items-center gap-x-3.5 py-2 px-2.5 hs-accordion-active:text-blue-600 hs-accordion-active:hover:bg-transparent text-sm text-slate-700 rounded-md hover:bg-gray-100-900-300:text-white`}
        {...props}
      >
        {icon}{label}
        {areThereSubitems &&
          <>
            <svg className="hs-accordion-active:block ml-auto hidden w-3 h-3 text-gray-600 group-hover:text-gray-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 11L8.16086 5.31305C8.35239 5.13625 8.64761 5.13625 8.83914 5.31305L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
            </svg>

            <svg className="hs-accordion-active:hidden ml-auto block w-3 h-3 text-gray-600 group-hover:text-gray-500" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
          </>
        }
      </Link>
      {areThereSubitems &&
        <div id={`${label}-accordion-child`} className="hs-accordion-content w-full overflow-hidden transition-[height] duration-300 hidden">
          <ul className="pt-2 pl-2">
            {subitems.map((item, i) =>
              <li key={i}>
                <Link href={item.href ? item.href : "#"} className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-md hover:bg-gray-100-300">
                  {item.label}
                </Link>
              </li>
            )}
          </ul>
        </div>
      }
    </li>
  )
}
