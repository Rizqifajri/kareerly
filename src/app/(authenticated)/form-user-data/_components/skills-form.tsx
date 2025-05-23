import React from "react";
import { useFormContext } from "react-hook-form";
import { MultiSelect } from "@/app/_components/multi-select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { useGetSoftSkill } from "@/hooks/user/skills/use-get-softskill-query";
import { useGetHardSkill } from "@/hooks/user/skills/use-get-hardskill-query";
import { SkillsFormValues } from "../_types/skills-types";
import { RecordModel } from "pocketbase";
import { useGetLanguageQuery } from "@/hooks/user/skills/use-get-language-query";

export const SkillsForm = () => {
  const { control } = useFormContext<SkillsFormValues>();
  const { data: softData, isLoading: loadingSoft, isError: errorSoft } = useGetSoftSkill();
  const { data: hardData, isLoading: loadingHard, isError: errorHard } = useGetHardSkill();
  const { data: languageData } = useGetLanguageQuery();

 const mapOptions = (data?: RecordModel[]) =>
  data
    ?.flatMap((item) => {
      const names = Array.isArray(item?.name) ? item?.name : [item?.name];
      return names?.map((name: string) => ({
        value: name,
        label: name,
      }));
    })
    .filter((v, i, self) => i === self.findIndex((t) => t.value === v.value));



  const softSkillOptions = mapOptions(softData);
  const hardSkillOptions = mapOptions(hardData);
  const languageOptions = mapOptions(languageData);

  if (loadingSoft || loadingHard) return <p>Loading skill options...</p>;
  if (errorSoft || errorHard) return <p>Failed to load skill options</p>;

  return (
    <div className="space-y-6">
      {/* Soft Skill */}
      <FormField
        control={control}
        name="soft_skill"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Soft Skills</FormLabel>
            <FormControl>
              <MultiSelect
                options={softSkillOptions || []}
                onValueChange={field.onChange}
                value={field.value || []}
                placeholder="Pilih soft skills"
                variant="inverted"
                animation={2}
                maxCount={10}
              />
            </FormControl>
            <FormDescription>Pilih soft skills yang kamu miliki.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hard Skill */}
      <FormField
        control={control}
        name="hard_skill"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hard Skills</FormLabel>
            <FormControl>
              <MultiSelect
                options={hardSkillOptions || []}
                onValueChange={field.onChange}
                value={field.value || []}
                placeholder="Pilih hard skills"
                variant="inverted"
                animation={2}
                maxCount={10}
              />
            </FormControl>
            <FormDescription>Pilih hard skills yang kamu miliki.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="languages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Language</FormLabel>
            <FormControl>
              <MultiSelect
                options={languageOptions || []}
                onValueChange={field.onChange}
                value={field.value || []}
                placeholder="Pilih language"
                variant="inverted"
                animation={2}
                maxCount={10}
              />
            </FormControl>
            <FormDescription>Pilih hard skills yang kamu miliki.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
