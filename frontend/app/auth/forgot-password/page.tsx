import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-sky-100 bg-white p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Account support
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-elite-navy sm:text-4xl">Forgot your password?</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Self-service password reset is not available in this build yet. If you cannot sign in, contact support from the email address tied to your account and we will help you regain access.
        </p>
        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <p>Email: support@3relite.com</p>
          <p>Include your account email and a short description of the sign-in problem.</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="mailto:support@3relite.com?subject=Password%20reset%20help"
            className="inline-flex items-center justify-center rounded-xl bg-elite-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Email support
          </a>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}