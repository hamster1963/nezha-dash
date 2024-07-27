export default function Footer() {
    return (
        <footer className="mx-auto w-full max-w-5xl">
            <section className="flex flex-col">
                <p className="mt-3 flex gap-1 text-[13px] font-light tracking-tight text-neutral-600/50 dark:text-neutral-300/50">
                    Find the code on{' '}
                    <a
                        href="https://github.com/hamster1963/nezha-dash"
                        target="_blank"
                        className="cursor-pointer font-normal underline decoration-yellow-500 decoration-2 underline-offset-2 dark:decoration-yellow-500/50"
                    >
                        GitHub
                    </a>
                </p>
                <section className="mt-1 flex items-center gap-2 text-[13px] font-light tracking-tight text-neutral-600/50 dark:text-neutral-300/50">
                    © 2020-{new Date().getFullYear()}{' '}
                    <a href={'https://github.com/hamster1963'}>@Hamster1963</a>
                </section>
            </section>
        </footer>
    )
}
