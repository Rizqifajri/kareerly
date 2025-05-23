import { StepperWithForm } from "@/components/stepper-with-form";
import { useUser } from "@/hooks/use-users";

export default async function Page() {

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <StepperWithForm />
      </div>
    </div>
  );
}