"use client";

import CompleteForm from "@/app/(authenticated)/form-user-data/_components/complete-form";
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
    Component: CompleteForm,
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

  type StepFormValues = GeneralFormValues | ExperienceFormValues | SkillsFormValues;

  const handleNext: (data: StepFormValues) => Promise<void> = async (data: StepFormValues) => {
    console.log("➡ handleNext called", data);
    const prevData = localStorage.getItem("pb_user") || "{}";
    const parsed = JSON.parse(prevData);
    const newData = { ...parsed, [methods.current.id]: data };
    localStorage.setItem("pb_user", JSON.stringify(newData));

    // Pindah ke step selanjutnya
    methods.next();
  };

  const handleSubmitAll = async () => {
    const stored = localStorage.getItem("pb_user");
    if (!stored) return;

    const newData = JSON.parse(stored);
    const userId = client.authStore.model?.id;
    if (!userId) return;

    try {
      // Save Experience
      const experiences = newData.experience?.experience || [];
      const createdExperienceIds: string[] = [];

      for (const exp of experiences) {
        await new Promise((resolve, reject) => {
          createExperience(
            { userId, data: exp },
            {
              onSuccess: (res) => {
                createdExperienceIds.push(res.id);
                resolve(null);
              },
              onError: reject,
            }
          );
        });
      }

      // Save General Info
      await new Promise((resolve, reject) => {
        updateGeneral(
          {
            userId,
            data: newData.general,
          },
          { onSuccess: () => resolve(null), onError: reject }
        );
      });

      // Save Skills
      await new Promise((resolve, reject) => {
        createSkills(
          {
            userId,
            data: newData.skills,
          },
          { onSuccess: () => resolve(null), onError: reject }
        );
      });

      console.log("✅ All data saved successfully!");
      localStorage.removeItem("pb_user");
      methods.reset(); 

    } catch (err) {
      console.error("❌ Failed to save data:", err);
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
  };



  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(methods.current.schema),
    defaultValues: defaultValuesMap[methods.current.id],
  });

  return (
    <Form {...form} key={methods.current.id}>
      <form
        onSubmit={form.handleSubmit(handleNext as any)}
        className="space-y-4"
      >
        <Stepper.Navigation>
          {methods?.all?.map((step) => (
            <Stepper.Step
              key={step.id}
              of={step.id}
              type={step.id === methods.current.id ? "submit" : "button"}
              onClick={async () => {
                if (step.id !== methods.current.id) return;
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
          final: ({ Component }) => <Component />,
        })}

        <Stepper.Controls className="mb-5">
          {!methods.isFirst && (
            <Button
              className="cursor-pointer"
              variant="secondary"
              type="button"
              onClick={() => methods.prev()}
            >
              Previous
            </Button>
          )}
          {methods.isLast ? (
            <Button className="cursor-pointer" type="button" onClick={handleSubmitAll}>
              Generate <SparkleIcon />
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
