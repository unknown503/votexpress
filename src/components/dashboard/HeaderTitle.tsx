import React, { HTMLAttributes } from 'react'

interface HeaderTitleI extends HTMLAttributes<HTMLDivElement> {
    title: string
}

export default function HeaderTitle({ title, ...props }: HeaderTitleI) {
    return (
        <div {...props}>
            <h2 className="text-4xl mb-8">{title}</h2>
        </div>
    )
}
