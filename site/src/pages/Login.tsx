import { Chrome } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import PageSeo from "../components/seo/PageSeo";
import { getSiteUrl, supabase } from "../lib/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate("/dashboard");
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setIsGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getSiteUrl()}/dashboard`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <PageShell
      className="bg-[#0B0F17]"
      backgroundLayers={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_24%),radial-gradient(circle_at_62%_28%,rgba(80,200,140,0.08),transparent_24%),linear-gradient(to_bottom,#0B0F17_0%,#07090d_52%,#050607_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.03]" />
        </>
      }
    >
      <PageSeo
        title="Sign In to VidCluster"
        description="Sign in to your VidCluster account."
        url="/login"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-[560px] flex-col justify-center px-6 py-12 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/68">
            VidCluster
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
            Sign in
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/54">
            Continue into your topic intelligence workspace.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleEmailLogin}>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">
                Email address
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-[1rem] border border-white/10 bg-black/22 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/22 focus:bg-black/28"
              />
            </label>

            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-white/38">
                Password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="mt-2 h-12 w-full rounded-[1rem] border border-white/10 bg-black/22 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/22 focus:bg-black/28"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black shadow-[0_14px_34px_rgba(255,255,255,0.10)] transition hover:bg-white/90"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-white/82 transition hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
            >
              <Chrome className="h-4 w-4" />
              {isGoogleLoading ? "Redirecting..." : "Continue with Google"}
            </button>
          </form>

          {errorMessage ? (
            <div className="mt-5 rounded-[1rem] border border-red-300/20 bg-red-300/[0.07] px-4 py-3 text-sm leading-6 text-red-100/82">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-6 border-t border-white/8 pt-5 text-center text-sm text-white/48">
            New to VidCluster?{" "}
            <Link to="/signup" className="text-white/86 transition hover:text-white">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
