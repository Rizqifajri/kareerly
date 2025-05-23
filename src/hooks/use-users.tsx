import { userAtom } from "@/atoms/users-atoms"
import { useAtom } from "jotai"

export const useUser = () => {
  const [user, setUser] = useAtom(userAtom)
  return { user, setUser }
}