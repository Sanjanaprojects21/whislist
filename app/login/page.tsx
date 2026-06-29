import { Heart, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="authShell">
      <section className="authPanel" aria-labelledby="login-title">
        <a className="brand authBrand" href="/">
          <span className="brandMark">
            <Heart size={18} fill="currentColor" />
          </span>
          <span>Wishlist</span>
        </a>

        <div className="authHeader">
          <p className="eyebrow">Welcome back</p>
          <h1 id="login-title">Sign in</h1>
          <p>Use your email and password to open your wishlist.</p>
        </div>

        <form className="authForm">
          <label htmlFor="email">Email address</label>
          <div className="inputWrap">
            <Mail size={18} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <label htmlFor="password">Password</label>
          <div className="inputWrap">
            <Lock size={18} />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="formRow">
            <label className="checkLabel">
              <input type="checkbox" name="remember" />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button className="primaryButton authSubmit" type="submit">
            <Lock size={18} />
            Login
          </button>
        </form>

        <p className="authFooter">
          New here? <a href="#">Create account</a>
        </p>
      </section>
    </main>
  );
}
