"use client"

import { PropsWithChildren, useEffect } from "react"
import { AuthMiddleware } from "../(public)/auth/middleware"
import { useSetAtom } from "jotai"
import { userAtom } from "@/atoms/users-atoms"


export const ClientWrapper = ({ children }: PropsWithChildren) => {
  const setUser = useSetAtom(userAtom)
  
  useEffect(() => {
    const stored = localStorage.getItem("pocketbase_auth")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
      } catch (err) {
        console.error("Failed to parse auth:", err)
      }
    }
  }, [])

  return <AuthMiddleware>{children}</AuthMiddleware>
}