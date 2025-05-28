'use client'

import React, { createContext, useContext, useState, useEffect } from "react"
import { client } from "@/db/instance"
import { getGeneralInfo } from "@/api/user/general/get-general-info"

type UserContextType = {
  user: any
  setUser: React.Dispatch<React.SetStateAction<any>>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userId = client.authStore.model?.id
    if (userId) {
      getGeneralInfo(userId).then((data) => {
        console.log(data)
        setUser(data)
      })
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
