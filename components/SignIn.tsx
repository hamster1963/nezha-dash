"use client"

import { useRouter } from "next/navigation"
import { getCsrfToken, signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { Loader } from "./loading/Loader"

export function SignIn() {
  const t = useTranslations("SignIn")

  const [csrfToken, setCsrfToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorState, setErrorState] = useState(false)
  const [successState, setSuccessState] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function loadProviders() {
      const csrf = await getCsrfToken()
      setCsrfToken(csrf)
    }
    loadProviders()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const res = await signIn("credentials", {
      password: password,
      redirect: false,
    })
    if (res?.error) {
      console.log("login error")
      setErrorState(true)
      setSuccessState(false)
    } else {
      console.log("login success")
      setErrorState(false)
      setSuccessState(true)
      router.push("/")
      router.refresh()
    }
    setLoading(false)
  }
  return (
    <form
      className="flex flex-1 flex-col items-center justify-center gap-4 p-4"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <section className="flex flex-col items-start gap-2">
        <label className="flex flex-col items-start gap-1">
          {errorState && <p className="font-semibold text-red-500 text-sm">{t("ErrorMessage")}</p>}
          {successState && (
            <p className="font-semibold text-green-500 text-sm">{t("SuccessMessage")}</p>
          )}
          <p className="font-semibold text-base">{t("SignInMessage")}</p>
          <input
            className="rounded-[5px] border-[1px] border-stone-300 px-1 dark:border-stone-800"
            name="password"
            type="password"
          />
        </label>
        <button
          type="submit"
          className="flex w-fit items-center gap-1 rounded-[8px] border border-stone-300 bg-card px-1.5 py-0.5 font-semibold text-card-foreground text-sm shadow-lg shadow-neutral-200/40 transition-all hover:brightness-95 dark:border-stone-800 dark:shadow-none"
          disabled={loading}
        >
          {t("Submit")}
          {loading && <Loader visible={true} />}
        </button>
      </section>
    </form>
  )
}
