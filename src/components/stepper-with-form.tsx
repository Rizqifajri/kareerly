// app/(authenticated)/form-user-data/stepper-with-form.tsx
"use client";

import React, { useEffect, useState } from "react";
import CompleteForm, { type Reco } from "@/app/(authenticated)/form-user-data/_components/complete-form";
import { ExperienceForm } from "@/app/(authenticated)/form-user-data/_components/experience-form";
import { GeneralForm } from "@/app/(authenticated)/form-user-data/_components/general-form";
import { SkillsForm } from "@/app/(authenticated)/form-user-data/_components/skills-form";
import { experienceSchema } from "@/app/(authenticated)/form-user-data/_schema/experience-schema";
import { generalInfoSchema } from "@/app/(authenticated)/form-user-data/_schema/general-schema";
import { fullSkillSchema } from "@/app/(authenticated)/form-user-data/_schema/skills-schema";
import { ExperienceFormValues } from "@/app/(authenticated)/form-user-data/_types/experience-types";
import { GeneralFormValues } from "@/app/(authenticated)/form-user-data/_types/general-types";
import { SkillsFormValues } from "@/app/(authenticated)/form-user-data/_types/skills-types";
import { defineStepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { client } from "@/db/instance";
import { useUser } from "@/hooks/use-users";
import { useCreateExperienceQuery } from "@/hooks/user/experience/use-create-experience-query";
import { useUpdateGeneralQuery } from "@/hooks/user/general/use-update-general-query";
import { useCreateSkillsQuery } from "@/hooks/user/skills/use-create-skills-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { SparkleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const { Stepper, useStepper } = defineStepper(
  {
    id: "general",
    title: "General Info",
    schema: generalInfoSchema,
    Component: GeneralForm,
  },
  {
    id: "experience",
    title: "Experience",
    schema: experienceSchema,
    Component: ExperienceForm,
  },
  {
    id: "skills",
    title: "Skills",
    schema: fullSkillSchema,
    Component: SkillsForm,
  },
  {
    id: "final",
    title: "Final",
    schema: z.object({}),
    Component: CompleteForm, // kita override di switch agar bisa pass props
  }
);

export function StepperWithForm() {
  return (
    <Stepper.Provider>
      <FormStepperComponent />
    </Stepper.Provider>
  );
}

const FormStepperComponent = () => {
  const methods = useStepper();
  const { user } = useUser();
  const { mutate: updateGeneral } = useUpdateGeneralQuery();
  const { mutate: createExperience } = useCreateExperienceQuery();
  const { mutate: createSkills } = useCreateSkillsQuery();

  // State rekomendasi AI
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Reco[]>([]);

  // (opsional) restore hasil rekomendasi yang tersimpan
  useEffect(() => {
    const cached = localStorage.getItem("pb_reco");
    if (cached) {
      try {
        setRecommendations(JSON.parse(cached));
      } catch {}
    }
  }, []);

  type StepFormValues = GeneralFormValues | ExperienceFormValues | SkillsFormValues;

  const handleNext: (data: StepFormValues) => Promise<void> = async (data) => {
    const prevData = localStorage.getItem("pb_user") || "{}";
    const parsed = JSON.parse(prevData);
    const newData = { ...parsed, [methods.current.id]: data };
    localStorage.setItem("pb_user", JSON.stringify(newData));
    methods.next();
  };

  const handleSubmitAll = async () => {
    const stored = localStorage.getItem("pb_user");
    if (!stored) return;

    const newData = JSON.parse(stored);
    const userId = client.authStore.model?.id;
    if (!userId) return;

    try {
      setRecoError(null);
      setRecoLoading(true);

      // 1) Save Experience
      const experiences = newData.experience?.experience || [];
      for (const exp of experiences) {
        await new Promise((resolve, reject) => {
          createExperience(
            { userId, data: exp },
            {
              onSuccess: () => resolve(null),
              onError: reject,
            }
          );
        });
      }

      // 2) Save General
      await new Promise((resolve, reject) => {
        updateGeneral(
          { userId, data: newData.general },
          { onSuccess: () => resolve(null), onError: reject }
        );
      });

      // 3) Save Skills
      await new Promise((resolve, reject) => {
        createSkills(
          { userId, data: newData.skills },
          { onSuccess: () => resolve(null), onError: reject }
        );
      });

      // 4) Panggil AI (tanpa pindah step)
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          general: newData.general,
          experience: newData.experience,
          skills: newData.skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate recommendations");

      setRecommendations(data.jobs ?? []);
      localStorage.setItem("pb_reco", JSON.stringify(data.jobs ?? [])); // cache hasil
    } catch (err: any) {
      console.error("❌ Failed to save/generate:", err);
      setRecoError(err?.message || "Failed to save/generate");
    } finally {
      setRecoLoading(false);
    }
  };

  const defaultValuesMap = {
    general: {
      firstname: user?.record?.name?.split(" ")[0] ?? "",
      lastname: user?.record?.name?.split(" ")[1] ?? "",
      email: user?.record?.email ?? "",
      work_preference: "",
      preferred_work_setting: "",
      job_title: "",
    },
    experience: {
      have_experience_before: true,
      experience: [
        {
          job_title: "",
          company_name: "",
          from: new Date(),
          to: new Date(),
          responsibilities: "",
        },
      ],
    },
    skills: {
      skills: [],
    },
    final: {},
  } as const;

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(methods.current.schema),
    defaultValues: defaultValuesMap[methods.current.id as keyof typeof defaultValuesMap],
  });

  return (
    <Form {...form} key={methods.current.id}>
      <form onSubmit={form.handleSubmit(handleNext as any)} className="space-y-4">
        <Stepper.Navigation>
          {methods?.all?.map((step) => (
            <Stepper.Step
              key={step.id}
              of={step.id}
              // Biar step clickable: validasi current form dulu baru pindah
              type={step.id === methods.current.id ? "submit" : "button"}
              onClick={async () => {
                // validasi step aktif sebelum pindah
                const valid = await form.trigger();
                if (!valid) return;
                methods.goTo(step.id);
              }}
            >
              <Stepper.Title>{step.title}</Stepper.Title>
            </Stepper.Step>
          ))}
        </Stepper.Navigation>

        {methods.switch({
          general: ({ Component }) => <Component />,
          experience: ({ Component }) => <Component />,
          skills: ({ Component }) => <Component />,
          // ⬇️ override: kirim props langsung ke CompleteForm
          final: () => (
            <CompleteForm
              recommendations={recommendations}
              loading={recoLoading}
              error={recoError}
            />
          ),
        })}

        <Stepper.Controls className="mb-5">
          {!methods.isFirst && (
            <Button className="cursor-pointer" variant="secondary" type="button" onClick={() => methods.prev()}>
              Previous
            </Button>
          )}
          {methods.isLast ? (
            <Button
              className="cursor-pointer"
              type="button"
              onClick={handleSubmitAll}
              disabled={recoLoading}
            >
              {recoLoading ? "Generating…" : (
                <>
                  Generate <SparkleIcon className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button className="cursor-pointer" type="submit">
              Next
            </Button>
          )}
        </Stepper.Controls>
      </form>
    </Form>
  );
};
