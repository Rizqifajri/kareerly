import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ExperienceFormValues } from "../_types/experience-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ExperienceForm() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ExperienceFormValues>();

  const { watch } = useFormContext<ExperienceFormValues>();
  const hasExperience = watch("have_experience_before");

  console.log("Has experience:", hasExperience);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <div className="space-y-6 text-start">
      {/* Pertanyaan awal */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">
          Have you ever worked or interned before?
        </p>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              value="true"
              {...register("have_experience_before", {
                setValueAs: (v) => v === "true",
              })}
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              value="false"
              {...register("have_experience_before", {
                setValueAs: (v) => v === "true",
              })}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {hasExperience && (
        <>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-4 rounded-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary">
                    Job Title / Position
                  </label>
                  <Input
                    {...register(`experience.${index}.job_title`)}
                    className="w-full"
                  />
                  {errors.experience?.[index]?.job_title && (
                    <p className="text-sm text-destructive">
                      {errors.experience[index]?.job_title?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary">
                    Company Name
                  </label>
                  <Input
                    {...register(`experience.${index}.company_name`)}
                    className="w-full"
                  />
                  {errors.experience?.[index]?.company_name && (
                    <p className="text-sm text-destructive">
                      {errors.experience[index]?.company_name?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary">
                    From
                  </label>
                  <Input
                    type="date"
                    {...register(`experience.${index}.from`)}
                    className="w-full"
                  />
                  {errors.experience?.[index]?.from && (
                    <p className="text-sm text-destructive">
                      {errors.experience[index]?.from?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary">
                    To
                  </label>
                  <Input
                    type="date"
                    {...register(`experience.${index}.to`)}
                    className="w-full"
                  />
                  {errors.experience?.[index]?.to && (
                    <p className="text-sm text-destructive">
                      {errors.experience[index]?.to?.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary">
                  Responsibilities
                </label>
                <textarea
                  {...register(`experience.${index}.responsibilities`)}
                  rows={3}
                  className="w-full border p-2 rounded-md"
                />
                {errors.experience?.[index]?.responsibilities && (
                  <p className="text-sm text-destructive">
                    {errors.experience[index]?.responsibilities?.message}
                  </p>
                )}
              </div>

              {fields.length > 1 && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => remove(index)}
                >
                  Remove Experience
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                job_title: "",
                company_name: "",
                from: new Date(),
                to: new Date(),
                responsibilities: "",
              })
            }
          >
            + Add More Experience
          </Button>
        </>
      )}
    </div>
  );
}
