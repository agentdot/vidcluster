import { Check, Chrome } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import PageShell from "../components/layout/PageShell";
import PageSeo from "../components/seo/PageSeo";
import { getSiteUrl, supabase } from "../lib/supabaseClient";

const trustBullets = [
  "Identify high-growth topics early",
  "Backed by real performance data",
  "Know what to create and when",
];

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const selectedPlan = useMemo(() => {
    const plan = searchParams.get("plan")?.toLowerCase();

    if (plan === "pro") return "Pro";
    if (plan === "advanced") return "Advanced";
    if (plan === "explorer") return "Explorer";

    return null;
  }, [searchParams]);

  const handleEmailSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/dashboard`,
      },
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard");
      return;
    }

    setSuccessMessage("Check your email to confirm your account.");
  };

  const handleGoogleSignup = async () => {
    setErrorMessage("");
    setSuccessMessage("");
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.07),transparent_26%),radial-gradient(circle_at_76%_34%,rgba(80,200,140,0.10),transparent_24%),linear-gradient(to_bottom,#0B0F17_0%,#07090d_52%,#050607_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.03]" />
        </>
      }
    >
      <PageSeo
        title="Create Your VidCluster Account - Early Access"
        description="Sign up for VidCluster early access and start exploring YouTube topic signals before they become saturated."
        url="/signup"
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-[1200px] gap-10 px-6 py-12 lg:grid-cols-[1fr_0.88fr] lg:items-center lg:px-8 lg:py-16">
        <section className="flex flex-col justify-center">
          <Link to="/" className="mb-12 flex w-fit items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="h-3.5 w-3.5 rounded-full bg-white/90" />
            </div>
            <div>
              <div className="text-sm font-medium tracking-[0.28em] text-white/72">
                VIDCLUSTER
              </div>
              <div className="text-xs text-white/42">Topic Intelligence System</div>
            </div>
          </Link>

          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-6xl lg:text-[4.35rem]">
              Find YouTube topics before they become saturated
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Built on real experiments. Evaluated over time.
            </p>

            <div className="mt-9 grid gap-3">
              {trustBullets.map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-center gap-3 rounded-[1.15rem] border border-white/8 bg-white/[0.025] px-4 py-3 text-sm text-white/70"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-300/22 bg-emerald-300/[0.08] text-emerald-200">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-0 rounded-[2.1rem] bg-emerald-300/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.34)] sm:p-8">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />

            <div className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/68">
              Early Access
            </div>
            {selectedPlan ? (
              <div className="mt-4 inline-flex rounded-full border border-emerald-300/18 bg-emerald-300/[0.07] px-3 py-1 text-xs font-medium text-emerald-100/82">
                Starting with {selectedPlan}
              </div>
            ) : null}
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
              Create your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/54">
              Start exploring early topic signals in under a minute.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleEmailSignup}
            >
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="mt-2 h-12 w-full rounded-[1rem] border border-white/10 bg-black/22 px-4 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/22 focus:bg-black/28"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black shadow-[0_14px_34px_rgba(255,255,255,0.10)] transition hover:bg-white/90"
              >
                {isLoading ? "Creating account..." : "Access early topic signals"}
              </button>

              <p className="text-center text-sm leading-6 text-white/48">
                No credit card required. Start before topics become saturated.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignup}
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

            {successMessage ? (
              <div className="mt-5 rounded-[1rem] border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-3 text-sm leading-6 text-emerald-100/82">
                {successMessage}
              </div>
            ) : null}

            <p className="mt-5 text-center text-sm text-white/42">
              No spam. Cancel anytime.
            </p>

            <div className="mt-6 border-t border-white/8 pt-5 text-center text-sm text-white/48">
              Already have an account?{" "}
              <Link to="/login" className="text-white/86 transition hover:text-white">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
