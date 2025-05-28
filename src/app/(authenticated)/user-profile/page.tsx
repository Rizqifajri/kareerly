'use client'
import { ExperienceSection } from "./_components/experience-section";
import { ProfileSection } from "./_components/profile-section";
import { SkillsSection } from "./_components/skills-section";

const UserProfile = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col w-full max-w-2xl px-4 gap-10">
        <ProfileSection  />
        <ExperienceSection />
        <SkillsSection />
      </div>
    </div>
  );
}

export default UserProfile