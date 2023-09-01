import Head from "next/head";
import { Project, Titles } from '@/config/projectData';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface CustomHead {
  title: string
}

export default function CustomHead({ title }: CustomHead) {
  const [HeadTitle, setHeadTitle] = useState("Cargando...")
  const router = useRouter()

  useEffect(() => {
    const isDashboard = router.asPath.includes("/dashboard")
    const dashboardTitle = isDashboard ? `dash-${title}` : title
    const existingKey = Object.keys(Titles).includes(dashboardTitle)
    const newTitle = Titles[(existingKey ? dashboardTitle : title) as keyof typeof Titles]

    if (newTitle) {
      setHeadTitle(newTitle)
    } else {
      const isCatchRoute = title === "[[...index]]" ? "Cargando..." : title.charAt(0).toUpperCase() + title.slice(1)
      setHeadTitle(title !== "" ? isCatchRoute : "Inicio")
    }
  }, [title])

  return (
    <Head>
      <title>{`${HeadTitle} | ${Project.name}`}</title>
    </Head>
  )
}
