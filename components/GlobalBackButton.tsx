"use client"

import { useFilter } from "@/lib/network-filter-context"
import { useStatus } from "@/lib/status-context"
import { ServerStackIcon } from "@heroicons/react/20/solid"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function GlobalBackButton() {
  const router = useRouter()
  const { setStatus } = useStatus()
  const { setFilter } = useFilter()

  useEffect(() => {
    setStatus("all")
    setFilter(false)
    sessionStorage.removeItem("selectedTag")
    router.prefetch(`/`)
  }, [])

  return (
    <button
      onClick={() => {
        router.push(`/`)
      }}
      className="rounded-[50px] mt-[1px] w-fit text-white cursor-pointer [text-shadow:_0_1px_0_rgb(0_0_0_/_20%)] bg-green-600 hover:bg-green-500 p-[10px] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[inset_0_1px_0_rgba(0,0,0,0.2)] "
    >
      <ServerStackIcon className="size-[13px]" />
    </button>
  )
}
