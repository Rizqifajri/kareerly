'use client'

import { useUser } from "@/providers/user-provider"
import { Badge } from "@/components/ui/badge"

export const SkillsSection = () => {
  const { user } = useUser()
  const skillsData = user?.expand?.skills

  const softSkills = skillsData?.soft_skill || []
  const hardSkills = skillsData?.hard_skill || []
  const languages = skillsData?.languages || []

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-xl pb-3 border-b border-black">Skills</h2>

      {/* Soft Skills */}
      <div>
        <h3 className="font-medium text-lg mb-2">Soft Skills</h3>
        {softSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill: string, index: number) => (
              <Badge key={index} >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No soft skills data</p>
        )}
      </div>

      {/* Hard Skills */}
      <div>
        <h3 className="font-medium text-lg mb-2">Hard Skills</h3>
        {hardSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hardSkills.map((skill: string, index: number) => (
              <Badge key={index}>
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No hard skills data</p>
        )}
      </div>

      {/* Languages */}
      <div>
        <h3 className="font-medium text-lg mb-2">Languages</h3>
        {languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {languages.map((lang: string, index: number) => (
              <Badge key={index} >
                {lang}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No languages data</p>
        )}
      </div>
    </div>
  )
}
