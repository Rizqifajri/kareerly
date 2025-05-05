'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { client } from "@/db/instance"
import { useUser } from "@/hooks/use-users"
import { ThemeToggle } from "./theme-toggle"
import { LogOut, PanelRight, Settings } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useAuth } from "../(public)/auth/_hooks/use-auth"
import { useRouter } from "next/navigation"

export const Headers = () => {
  const { user } = useUser()
  const { logOut } = useAuth()
  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const isLoggedIn = !!user?.record

  const avatarUrl = user?.record?.avatar
    ? `${client.baseUrl}/api/files/users/${user.record.id}/${user.record.avatar}`
    : null

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="cursor-pointer ml-3 h-7 w-7 p-1"
          aria-label="Toggle Sidebar"
        >
          <PanelRight className="hover:scale-110 transition-all h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold ml-3">Kareerly</h1>
      </div>
      <div className="flex justify-between items-center gap-3 mr-3">
        {isLoggedIn ? (
          <Popover>
            <PopoverTrigger className="cursor-pointer" asChild>
              <Avatar className="w-10 h-10">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback>{user?.record?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-col justify-center">
                <div className="flex flex-col items-center">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback>{user?.record?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-sm mb-3 text-center font-normal border-b pb-3 w-full">
                    {user?.record?.name}
                  </h1>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full border bg-transparent hover:bg-sidebar-accent text-black dark:text-white"
                  >
                    <Settings className="mr-2 h-4 w-4" /> Setting
                  </Button>
                  <Button
                    onClick={logOut}
                    className="w-full border bg-transparent hover:bg-sidebar-accent text-black dark:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : ( 
          <Button
            variant="outline"
            onClick={() => router.push("/auth/login")}
            className="text-black dark:text-white border"
          >
            Login
          </Button>
        )}
        <ThemeToggle />
      </div>

    </div>
  )
}

