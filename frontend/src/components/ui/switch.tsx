import * as React from "react"
import * as RadixSwitch from "@radix-ui/react-switch"

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root> {}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => {
    return (
      <RadixSwitch.Root
        ref={ref as any}
        className={
          "inline-flex h-6 w-11 items-center rounded-full bg-muted data-[state=checked]:bg-primary transition-colors " +
          (className ?? "")
        }
        {...props}
      >
        <RadixSwitch.Thumb
          className={
            "block h-5 w-5 translate-x-0.5 rounded-full bg-background transition-transform data-[state=checked]:translate-x-5"
          }
        />
      </RadixSwitch.Root>
    )
  }
)

Switch.displayName = "Switch"

export default Switch
