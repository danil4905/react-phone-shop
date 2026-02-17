import type { ButtonHTMLAttributes, ReactNode } from "react"
type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children?: ReactNode;
}
export default function Button({children, ...props}: TButtonProps) {
    return (
        <button {...props}>{children}</button>
    )
}