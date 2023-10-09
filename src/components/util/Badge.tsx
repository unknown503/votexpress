import { cva, VariantProps } from "class-variance-authority"
import { Check, DangerX, Warning } from "../icons/Icons"

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        danger: "bg-red-100 text-red-800",
        warning: "bg-yellow-100 text-yellow-800",
        success: "bg-green-100 text-green-800",
        primary: "bg-blue-100 text-blue-800",
        purple: "bg-purple-100 text-purple-800",
        indigo: "bg-indigo-100 text-indigo-800",
      },
      size: {
        default: "py-1.5 px-3 text-xs",
        big: "py-2 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const icons = {
  check: Check(),
  warning: Warning(),
  danger: DangerX(),
}

interface BadgeI extends VariantProps<typeof badge> {
  icon?: keyof typeof icons,
  label: string
}

export default function Badge({ icon, label, variant, size, ...props }: BadgeI) {
  return (
    <span className={badge({ variant, size })}{...props}>
      <>
        {icon && icons[icon]}
      </>
      {label}
    </span>
  )
}