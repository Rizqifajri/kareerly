'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/providers/user-provider"

export const ExperienceSection = () => {
  const { user } = useUser()
  const experienceData = user?.expand?.experience || []

  return (
    <div>
      <h2 className="font-semibold text-xl pb-3 border-b border-black">Experience</h2>
      {experienceData.length > 0 ? (
        <div className="flex flex-col gap-4">
          {experienceData.map((exp: any) => (
            <div key={exp.id} className="border p-4 rounded-md shadow-sm">
              <Label>Job Title</Label>
              <Input value={exp.job_title || ""} readOnly />
              <Label>Company</Label>
              <Input value={exp.company_name || ""} readOnly />
              <Label>From</Label>
              <Input value={new Date(exp.from).toLocaleDateString()} readOnly />
              <Label>To</Label>
              <Input value={new Date(exp.to).toLocaleDateString()} readOnly />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No experience data</p>
      )}
    </div>
  )
}
