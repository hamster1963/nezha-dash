"use client";

import { getCsrfToken } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SignIn() {
  const t = useTranslations("SignIn");

  const [csrfToken, setCsrfToken] = useState("");
  const [errorState, setErrorState] = useState(false);

  const search = useSearchParams();
  const error = search.get("error");

  useEffect(() => {
    if (error) {
      setErrorState(true);
    }
  }, [error]);

  useEffect(() => {
    async function loadProviders() {
      const csrf = await getCsrfToken();
      setCsrfToken(csrf);
    }
    loadProviders();
  }, []);

  return (
    <form
      className="flex flex-col items-center justify-start gap-4 p-4 "
      method="post"
      action="/api/auth/callback/credentials"
    >
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <section className="flex flex-col items-start gap-2">
        <label className="flex flex-col items-start gap-1 ">
          {errorState && (
            <p className="text-red-500 text-sm font-semibold">
              {t("ErrorMessage")}
            </p>
          )}
          <p className="text-base font-semibold">{t("SignInMessage")}</p>
          <input
            className="px-1 border-[1px] rounded-[5px]"
            name="password"
            type="password"
          />
        </label>
        <button className=" px-1.5 py-0.5 w-fit text-sm font-semibold rounded-[8px] border bg-card hover:brightness-95 transition-all text-card-foreground shadow-lg shadow-neutral-200/40 dark:shadow-none">
          {t("Submit")}
        </button>
      </section>
    </form>
  );
}
