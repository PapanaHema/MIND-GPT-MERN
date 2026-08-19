import { useState } from "react";
import { assets } from "../../assets/assets";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./auth.css";

const REMEMBERED_EMAIL_KEY = "mindgpt_remembered_email";
const SAVED_ACCOUNTS_KEY = "mindgpt_saved_accounts";

const readSavedAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
};

const Auth = () => {
  const { login, signup, forgotPassword, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState("login");
  const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  const [savedAccounts, setSavedAccounts] = useState(readSavedAccounts);
  const [form, setForm] = useState({ name: "", email: rememberedEmail, password: "", code: "" });
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const saveAccount = (user) => {
    const nextAccounts = [
      { id: user.id, name: user.name, email: user.email },
      ...savedAccounts.filter((account) => account.email !== user.email),
    ].slice(0, 5);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    setSavedAccounts(nextAccounts);
  };
  const selectAccount = (account) => {
    setForm((current) => ({ ...current, email: account.email, password: "" }));
    setRememberMe(true);
    setError("");
    setMessage(`Continue as ${account.name}`);
  };
  const removeAccount = (event, email) => {
    event.stopPropagation();
    const nextAccounts = savedAccounts.filter((account) => account.email !== email);
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    setSavedAccounts(nextAccounts);
    if (form.email === email) {
      setForm((current) => ({ ...current, email: "", password: "" }));
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  };
  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "login") {
        const data = await login(normalizedEmail, form.password);
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
          saveAccount(data.user);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      }
      if (mode === "signup") {
        const data = await signup(form.name.trim(), normalizedEmail, form.password);
        localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
        saveAccount(data.user);
      }
      if (mode === "forgot") {
        const data = await forgotPassword(normalizedEmail);
        setMessage(data.resetCode ? `${data.message} Reset code: ${data.resetCode}` : data.message);
        setMode("reset");
      }
      if (mode === "reset") {
        const data = await resetPassword(normalizedEmail, form.code, form.password);
        setMessage(data.message);
        setMode("login");
        setForm((current) => ({ ...current, password: "", code: "" }));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    login: ["Welcome back", "Log in to continue your conversations."],
    signup: ["Create your account", "Start exploring with your own MindGPT workspace."],
    forgot: ["Forgot password?", "Enter your email and we’ll create a reset code."],
    reset: ["Reset password", "Enter the code and choose a new password."],
  };

  return (
    <main className="auth-page">
      <button className="auth-theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
        <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
        {theme === "dark" ? "Light" : "Dark"}
      </button>
      <section className="auth-visual">
        <div className="auth-brand"><img src={assets.gemini_icon} alt="" /><span>MindGPT</span></div>
        <div>
          <p className="auth-kicker">Your AI, your space</p>
          <h1>Ideas move faster when everything is in one place.</h1>
          <p className="auth-description">Ask questions, explore possibilities, and keep your access protected.</p>
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <img className="auth-logo" src={assets.gemini_icon} alt="MindGPT" />
          <h2>{titles[mode][0]}</h2>
          <p className="auth-subtitle">{titles[mode][1]}</p>
          {message && <div className="auth-message">{message}</div>}
          {error && <div className="auth-error">{error}</div>}

          {mode === "login" && savedAccounts.length > 0 && (
            <div className="saved-accounts">
              <p>Saved accounts</p>
              <div className="saved-account-list">
                {savedAccounts.map((account) => (
                  <button className="saved-account" type="button" key={account.email} onClick={() => selectAccount(account)}>
                    <span className="saved-account-avatar">{account.name.charAt(0).toUpperCase()}</span>
                    <span className="saved-account-details">
                      <strong>{account.name}</strong>
                      <small>{account.email}</small>
                    </span>
                    <span className="saved-account-remove" role="button" tabIndex="0" aria-label={`Remove ${account.email}`} onClick={(event) => removeAccount(event, account.email)}>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "signup" && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" minLength="2" maxLength="100" autoComplete="name" required /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" maxLength="254" autoComplete="email" inputMode="email" required /></label>
          {mode === "reset" && <label>Reset code<input name="code" inputMode="numeric" value={form.code} onChange={update} placeholder="6-digit code" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" required /></label>}
          {(mode === "login" || mode === "signup" || mode === "reset") && (
            <label>{mode === "reset" ? "New password" : "Password"}<input name="password" type="password" value={form.password} onChange={update} placeholder="8–128 characters" minLength="8" maxLength="128" autoComplete={mode === "signup" || mode === "reset" ? "new-password" : "current-password"} required /></label>
          )}
          {mode === "login" && (
            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember my email</span>
              </label>
              <button className="auth-link" type="button" onClick={() => switchMode("forgot")}>Forgot password?</button>
            </div>
          )}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset code" : "Reset password"}
          </button>
          <div className="auth-switch">
            {mode === "login"
              ? <>New here? <button type="button" onClick={() => switchMode("signup")}>Create an account</button></>
              : <>Remembered your password? <button type="button" onClick={() => switchMode("login")}>Back to login</button></>}
          </div>
        </form>
      </section>
    </main>
  );
};

export default Auth;
