'use client'

import { Slot } from "@radix-ui/react-slot";
import * as Stepperize from "@stepperize/react";
import { type VariantProps, cva } from "class-variance-authority";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const StepperContext = React.createContext<Stepperize.ConfigProps | null>(null);

const useStepperProvider = (): Stepperize.ConfigProps => {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a StepperProvider.");
  }
  return context;
};

const defineStepper = <const Steps extends Stepperize.Step[]>(...steps: Steps): Stepperize.DefineProps<Steps> => {
  const { Scoped, useStepper, ...rest } = Stepperize.defineStepper(...steps);

  const StepperContainer = ({
    children,
    className,
    ...props
  }: Omit<React.ComponentProps<"div">, "children"> & {
    children:
      | React.ReactNode
      | ((props: { methods: Stepperize.Stepper<Steps> }) => React.ReactNode);
  }) => {
    const methods = useStepper();

    return (
      <div
        data-component="stepper"
        className={cn("w-full", className)}
        {...props}
      >
        {typeof children === "function" ? children({ methods }) : children}
      </div>
    );
  };

  return {
    ...rest,
    useStepper,
    Stepper: {
      Provider: ({
        variant = "horizontal",
        labelOrientation = "horizontal",
        tracking = false,
        children,
        className,
        ...props
      }) => (
        <StepperContext.Provider value={{ variant, labelOrientation, tracking }}>
          <Scoped initialStep={props.initialStep} initialMetadata={props.initialMetadata}>
            <StepperContainer className={className} {...props}>
              {children}
            </StepperContainer>
          </Scoped>
        </StepperContext.Provider>
      ),

      Navigation: ({ children, "aria-label": ariaLabel = "Stepper Navigation", ...props }) => {
        const { variant } = useStepperProvider();
        return (
          <nav
            data-component="stepper-navigation"
            aria-label={ariaLabel}
            role="tablist"
            {...props}
          >
            <ol className={classForNavigationList({ variant })}>
              {children}
            </ol>
          </nav>
        );
      },

      Step: ({ children, className, icon, ...props }) => {
        const { variant, labelOrientation } = useStepperProvider();
        const { current } = useStepper();
        const utils = rest.utils;
        const steps = rest.steps;

        const stepIndex = utils.getIndex(props.of);
        const step = steps[stepIndex];
        const currentIndex = utils.getIndex(current.id);

        const isLast = utils.getLast().id === props.of;
        const isActive = current.id === props.of;

        const dataState = getStepState(currentIndex, stepIndex);
        const childMap = useStepChildren(children);
        const title = childMap.get("title");
        const description = childMap.get("description");
        const panel = childMap.get("panel");

        if (variant === "circle") {
          return (
            <li
              className={cn("flex shrink-0 items-center gap-4 rounded-md transition-colors", className)}
            >
              <CircleStepIndicator currentStep={stepIndex + 1} totalSteps={steps.length} />
              <div className="flex flex-col items-start gap-1">
                {title}
                {description}
              </div>
            </li>
          );
        }

        return (
          <>
            <li
              className={cn(
                "group peer relative flex items-center gap-2",
                "data-[variant=vertical]:flex-row",
                "data-[label-orientation=vertical]:w-full flex-col justify-center"
              )}
              data-variant={variant}
              data-label-orientation={labelOrientation}
              data-state={dataState}
              data-disabled={props.disabled}
            >
              <Button
                id={`step-${step?.id}`}
                type="button"
                role="tab"
                tabIndex={dataState !== "inactive" ? 0 : -1}
                className="rounded-full"
                variant={dataState !== "inactive" ? "default" : "secondary"}
                size="icon"
                aria-controls={`step-panel-${props.of}`}
                aria-current={isActive ? "step" : undefined}
                aria-posinset={stepIndex + 1}
                aria-setsize={steps.length}
                aria-selected={isActive}
                onKeyDown={(e) => onStepKeyDown(
                  e,
                  utils.getNext(props.of),
                  utils.getPrev(props.of)
                )}
                {...props}
              >
                {icon ?? stepIndex + 1}
              </Button>

              {variant === "horizontal" && labelOrientation === "vertical" && (
                <StepperSeparator
                  orientation="horizontal"
                  labelOrientation={labelOrientation}
                  isLast={isLast}
                  state={dataState}
                  disabled={props.disabled}
                />
              )}

              <div className="flex flex-col items-start">
                {title}
                {description}
              </div>
            </li>

            {variant === "horizontal" && labelOrientation === "horizontal" && (
              <StepperSeparator
                orientation="horizontal"
                isLast={isLast}
                state={dataState}
                disabled={props.disabled}
              />
            )}

            {variant === "vertical" && (
              <div className="flex gap-4">
                {!isLast && (
                  <div className="flex justify-center ps-[calc(var(--spacing)_*_4.5_-_1px)]">
                    <StepperSeparator
                      orientation="vertical"
                      isLast={isLast}
                      state={dataState}
                      disabled={props.disabled}
                    />
                  </div>
                )}
                <div className="my-3 flex-1 ps-4">{panel}</div>
              </div>
            )}
          </>
        );
      },

      Title,
      Description,
      Panel: ({ children, asChild, ...props }) => {
        const Comp = asChild ? Slot : "div";
        const { tracking } = useStepperProvider();

        return (
          <Comp
            data-component="stepper-step-panel"
            ref={(node) => scrollIntoStepperPanel(node, tracking)}
            {...props}
          >
            {children}
          </Comp>
        );
      },

      Controls: ({ children, className, asChild, ...props }) => {
        const Comp = asChild ? Slot : "div";
        return (
          <Comp className={cn("flex justify-end gap-4", className)} {...props}>
            {children}
          </Comp>
        );
      },

      Stepper: undefined,
    }
  };
};

// Utility components

const Title = ({ children, className, asChild, ...props }: React.ComponentProps<"h4"> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "h4";
  return (
    <Comp className={cn("text-base font-medium", className)} {...props}>
      {children}
    </Comp>
  );
};

const Description = ({ children, className, asChild, ...props }: React.ComponentProps<"p"> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "p";
  return (
    <Comp className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </Comp>
  );
};

const StepperSeparator = ({
  orientation,
  isLast,
  labelOrientation,
  state,
  disabled,
}: {
  isLast: boolean;
  state: string;
  disabled?: boolean;
} & VariantProps<typeof classForSeparator>) => {
  if (isLast) return null;
  return (
    <div
      role="separator"
      tabIndex={-1}
      data-orientation={orientation}
      data-state={state}
      data-disabled={disabled}
      className={classForSeparator({ orientation, labelOrientation })}
    />
  );
};

const CircleStepIndicator = ({
  currentStep,
  totalSteps,
  size = 80,
  strokeWidth = 6,
}: Stepperize.CircleStepIndicatorProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillPercentage = (currentStep / totalSteps) * 100;
  const dashOffset = circumference - (circumference * fillPercentage) / 100;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted-foreground" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-300 ease-in-out"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium" aria-live="polite">{currentStep}</span>
      </div>
    </div>
  );
};

// Dummy helpers (replace with real ones)
const classForNavigationList = cva("flex gap-4", {
  variants: {
    variant: {
      horizontal: "flex-row",
      vertical: "flex-col",
      circle: "flex-row items-center",
    },
  },
});

const classForSeparator = cva("bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-8",
      vertical: "w-px h-8",
    },
    labelOrientation: {
      horizontal: "",
      vertical: "",
    },
  },
});

const getStepState = (currentIndex: number, stepIndex: number): "active" | "complete" | "inactive" => {
  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "inactive";
};

const useStepChildren = (children: React.ReactNode) => {
  const map = new Map<string, React.ReactNode>();
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = (child.type as any)?.displayName || (child.type as any)?.name;
    map.set(type?.toLowerCase() ?? "", child);
  });
  return map;
};

const scrollIntoStepperPanel = (node: HTMLElement | null, tracking?: boolean) => {
  if (node && tracking) {
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const onStepKeyDown = (e: React.KeyboardEvent, nextId: string, prevId: string) => {
  if (e.key === "ArrowRight") {
    document.getElementById(`step-${nextId}`)?.focus();
  } else if (e.key === "ArrowLeft") {
    document.getElementById(`step-${prevId}`)?.focus();
  }
};

export { defineStepper };
