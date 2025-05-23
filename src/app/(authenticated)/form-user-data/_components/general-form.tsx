import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { GeneralFormValues } from "../_types/general-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export const GeneralForm = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<GeneralFormValues>();

  const preferredWorkSetting = watch("preferred_work_setting") || "";
  const preferredWorkSettingId = register("preferred_work_setting").name;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-2">
        <label
          htmlFor={register("firstname").name}
          className="block text-sm font-medium text-primary"
        >
          First name
        </label>
        <Input
          autoComplete="given-name"
          id={register("firstname").name}
          {...register("firstname")}
          className="block w-full rounded-md border p-2"
        />
        {errors.firstname && (
          <span className="text-sm text-destructive">
            {errors.firstname.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={register("lastname").name}
          className="block text-sm font-medium text-primary"
        >
          Last name
        </label>
        <Input
          id={register("lastname").name}
          {...register("lastname")}
          className="block w-full rounded-md border p-2"
        />
        {errors.lastname && (
          <span className="text-sm text-destructive">
            {errors.lastname.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={register("email").name}
          className="block text-sm font-medium text-primary"
        >
          Email Address
        </label>
        <Input
          autoComplete="email"
          id={register("email").name}
          {...register("email")}
          className="block w-full rounded-md border p-2"
        />
        {errors.email && (
          <span className="text-sm text-destructive">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={register("major").name}
          className="block text-sm font-medium text-primary"
        >
          Major
        </label>
        <Input
          id={register("major").name}
          {...register("major")}
          className="block w-full rounded-md border p-2"
        />
        {errors.major && (
          <span className="text-sm text-destructive">
            {errors.major.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={register("country").name}
          className="block text-sm font-medium text-primary"
        >
          Country
        </label>
        <Input
          id={register("country").name}
          {...register("country")}
          className="block w-full rounded-md border p-2"
        />
        {errors.country && (
          <span className="text-sm text-destructive">
            {errors.country.message}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("address").name}
          className="block text-sm font-medium text-primary"
        >
          Address
        </label>
        <Input
          id={register("address").name}
          {...register("address")}
          className="block w-full rounded-md border p-2"
        />
        {errors.address && (
          <span className="text-sm text-destructive">
            {errors.address.message}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("city").name}
          className="block text-sm font-medium text-primary"
        >
          City
        </label>
        <Input
          id={register("city").name}
          {...register("city")}
          className="block w-full rounded-md border p-2"
        />
        {errors.city && (
          <span className="text-sm text-destructive">
            {errors.city.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={register("work_preference").name}
          className="block text-sm font-medium text-primary"
        >
          Work Preference
        </label>
        <Input
          id={register("work_preference").name}
          {...register("work_preference")}
          className="block w-full rounded-md border p-2"
        />
        {errors.work_preference && (
          <span className="text-sm text-destructive">
            {errors.work_preference.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={register("location").name}
          className="block text-sm font-medium text-primary"
        >
          Location
        </label>
        <Input
          id={register("location").name}
          {...register("location")}
          className="block w-full rounded-md border p-2"
        />
        {errors.location && (
          <span className="text-sm text-destructive">
            {errors.location.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={preferredWorkSettingId}
          className="block text-sm font-medium text-primary"
        >
          Preferred Work Setting
        </label>
        <Select
          //@ts-ignore
          id={preferredWorkSettingId}
          value={preferredWorkSetting}
          //@ts-ignore
          onValueChange={(value) => setValue("preferred_work_setting", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select work setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="fulltime">Fulltime</SelectItem>
          </SelectContent>
        </Select>
        {errors.preferred_work_setting && (
          <span className="text-sm text-destructive">
            {errors.preferred_work_setting.message}
          </span>
        )}
      </div>
    </div>

  );
};