"use client"

import { useUser } from '@/hooks/use-users'
import { usePathname, useRouter } from 'next/navigation'
import { PropsWithChildren, useEffect, useState } from 'react'

export const AuthMiddleware = ({ children }: PropsWithChildren) => {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const { setUser } = useUser()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    try {
      const currentUser = JSON.parse(localStorage.getItem("pocketbase_auth") || "null")
      console.log(currentUser)
      if (!currentUser) {
        if (!pathname.startsWith("/auth")) {
          router.push("/auth/login")
        }
      } else {
        setUser(currentUser)
        if (pathname.startsWith("/auth")) {
          router.push("/home")
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error)
      router.push("/auth/login")
    }
  }, [isClient, pathname, router, setUser])

  if (!isClient) return null

  return <>{children}</>
}
