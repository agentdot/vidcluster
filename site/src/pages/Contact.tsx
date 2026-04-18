import { useForm, ValidationError } from "@formspree/react";
import SiteHeader from "../components/SiteHeader";

export default function Contact() {
  const [state, handleSubmit] = useForm("mvzdrpzz");

  return (
    <main className="min-h-screen bg-[#060708] text-white selection:bg-white/20 selection:text-white">
      <SiteHeader />

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_60%_18%,rgba(120,120,145,0.08),transparent_20%),linear-gradient(to_bottom,#0b0c0f_0%,#07080a_45%,#050607_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.025]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.35))]" />
      </div>

      <section className="mx-auto w-full max-w-[1304px] px-6 pb-16 pt-16 lg:pb-20 lg:pt-24">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
            Contact
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl sm:leading-[0.96]">
            Join early access.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            VidCluster is being developed carefully and released selectively. If the
            product fits how you think, register your interest below.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1304px] px-6 pb-16 lg:pb-20">
        <div className="max-w-[920px] rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          {state.succeeded && (
            <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              Request received. We’ll review it and get back to you.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="hidden"
              name="_subject"
              value="VidCluster Early Access Request"
            />
            <input
              type="hidden"
              name="_source"
              value="VidCluster Contact Page"
            />

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/20"
              />
              <ValidationError
                prefix="Name"
                field="name"
                errors={state.errors}
                className="mt-2 text-sm text-red-300"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/20"
              />
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
                className="mt-2 text-sm text-red-300"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-white/20"
              >
                <option value="" disabled className="bg-[#0b0c0f] text-white/40">
                  Select one
                </option>
                <option value="creator" className="bg-[#0b0c0f]">
                  Creator
                </option>
                <option value="strategist" className="bg-[#0b0c0f]">
                  Content strategist
                </option>
                <option value="agency" className="bg-[#0b0c0f]">
                  Agency
                </option>
                <option value="other" className="bg-[#0b0c0f]">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Why are you interested?
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                placeholder="Tell us a little about how you would use VidCluster."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-white/20"
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
                className="mt-2 text-sm text-red-300"
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-sm leading-6 text-white/45">
                This is an early-access request, not an instant signup. We will
                review interest carefully.
              </p>

              <button
                type="submit"
                disabled={state.submitting}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.submitting ? "Sending..." : "Request Access"}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 max-w-[920px] text-sm text-white/42">
          Prefer email? Contact:{" "}
          <a
            href="mailto:admin@vidcluster.com?subject=VidCluster Early Access"
            className="text-white/72 transition hover:text-white"
          >
            admin@vidcluster.com
          </a>
        </div>

        <div className="mt-4 max-w-[920px] text-sm text-white/42">
          We review every request manually. Expect a response within 24–48 hours.
        </div>
      </section>
    </main>
  );
}