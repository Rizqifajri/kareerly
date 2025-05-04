'use client'

import { ThemeToggle } from "@/app/_components/theme-toggle"
import { useUser } from "@/hooks/use-users"

const HomePage = () => {
  const { user } = useUser()
  console.log(user?.record?.name)
  return (
    <>
      <h1>Hello, {user?.record?.name ?? "Guest"}</h1>
      <ThemeToggle />
    </>
  )
}

export default HomePage
