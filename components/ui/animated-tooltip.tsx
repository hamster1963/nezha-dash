import Image from "next/image"
import Link from "next/link"
import React from "react"

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number
    name: string
    designation: string
    image: string
  }[]
}) => {
  return (
    <>
      {items.map((item) => (
        <div className="group relative -mr-4" key={item.name}>
          <Link href="https://buycoffee.top" target="_blank">
            <Image
              width={40}
              height={40}
              unoptimized
              src={item.image}
              alt={item.name}
              className="relative m-0! h-6 w-6 rounded-full border-2 border-white object-cover object-top p-0! transition duration-500 group-hover:z-30 group-hover:scale-105"
            />
          </Link>
        </div>
      ))}
    </>
  )
}
