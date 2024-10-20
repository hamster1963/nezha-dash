import { signIn } from "@/auth"

export function SignIn() {
    return (
        <form
            action={async (formData) => {
                "use server"
                await signIn("credentials", formData)
            }}
        >
            <label>
                Password
                <input name="password" type="password" />
            </label>
            <button>Sign In</button>
        </form>
    )
}