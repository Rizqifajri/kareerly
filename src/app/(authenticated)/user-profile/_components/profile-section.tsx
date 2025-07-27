'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { client } from "@/db/instance"
import { useUser } from "@/providers/user-provider"


export const ProfileSection = () => {
  const { user } = useUser()

  const avatarUrl = user?.avatar
    ? `${client.baseUrl}/api/files/users/${user.id}/${user.avatar}`
    : null

    console.log(user)
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center justify-center">
        <Avatar className="w-56 h-56">
          <AvatarImage src={avatarUrl || ""} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <h1 className="font-semibold text-xl pb-3 border-b border-black">General Info</h1>
        <Label>Full Name</Label>
        <Input value={user?.name || ""} readOnly />
        <Label>Email</Label>
        <Input value={user?.email || ""} readOnly />
        <Label>Major</Label>
        <Input value={user?.major || ""} readOnly />
        <Label>City</Label>
        <Input value={user?.city || ""} readOnly />
        <Label>Country</Label>
        <Input value={user?.country || ""} readOnly />
      </div>
    </div>
  )
}
