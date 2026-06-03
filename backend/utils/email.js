function normalizeEmail(email) {
  if (email == null || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function parseBoolean(value, fallback = false) {
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function getLoginUrl() {
  if (process.env.APP_LOGIN_URL) return process.env.APP_LOGIN_URL;
  const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendBaseUrl.replace(/\/$/, "")}/auth`;
}

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
  };
}

function assertSmtpConfigured() {
  const config = getSmtpConfig();
  const missing = ["host", "port", "user", "pass", "from"].filter(key => !config[key]);
  if (missing.length) {
    throw new Error(`SMTP is not configured. Missing: ${missing.join(", ")}`);
  }
  return config;
}

function getResetPasswordUrl(token) {
  const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendBaseUrl.replace(/\/$/, "")}/reset-password/${token}`;
}

function normalizeNamespaces(namespaces = [], legacyNamespace = "") {
  if (Array.isArray(namespaces) && namespaces.length) {
    return namespaces.filter(Boolean);
  }
  return legacyNamespace ? [legacyNamespace] : [];
}

function buildTeamAccess(teamName, namespaces = []) {
  if (!teamName && !namespaces.length) {
    return "You have not been assigned to a team yet.";
  }

  const teamLine = teamName ? `Team: ${teamName}` : "Team: Not assigned";
  const namespaceLine = namespaces.length
    ? `Namespaces: ${namespaces.join(", ")}`
    : "Namespaces: None assigned yet";

  return `${teamLine}\n${namespaceLine}`;
}

async function sendMail({ to, subject, text, html }) {
  const config = assertSmtpConfigured();
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });
}

async function sendDeveloperWelcomeEmail({
  to,
  name,
  password,
  teamName,
  namespaces = [],
  legacyNamespace = "",
}) {
  const resolvedNamespaces = normalizeNamespaces(namespaces, legacyNamespace);

  const loginUrl = getLoginUrl();
  const accessSummary = buildTeamAccess(teamName, resolvedNamespaces);
  const subject = "Your KubeAssist developer account is ready";
  const text = [
    `Hello ${name || "Developer"},`,
    "",
    "Your KubeAssist developer account has been created by an administrator.",
    "",
    "Initial login credentials:",
    `Email: ${to}`,
    `Password: ${password}`,
    `Login URL: ${loginUrl}`,
    "",
    accessSummary,
    "",
    "For security, change your password after your first login.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Your KubeAssist Account Is Ready</h2>
      <p>Hello ${name || "Developer"},</p>
      <p>Your KubeAssist developer account has been created by an administrator.</p>
      <p><strong>Initial login credentials</strong></p>
      <ul>
        <li><strong>Email:</strong> ${to}</li>
        <li><strong>Password:</strong> ${password}</li>
        <li><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></li>
      </ul>
      <p><strong>Access</strong><br />${accessSummary.replace(/\n/g, "<br />")}</p>
      <p>For security, change your password after your first login.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}

async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = getResetPasswordUrl(token);
  const subject = "Reset your KubeAssist password";
  const text = [
    `Hello ${name || "User"},`,
    "",
    "We received a request to reset your KubeAssist password.",
    "Use the link below to choose a new password:",
    resetUrl,
    "",
    "This link expires in 15 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Reset Your Password</h2>
      <p>Hello ${name || "User"},</p>
      <p>We received a request to reset your KubeAssist password.</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
      </p>
      <p>If the button does not work, open this link:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}

async function sendPasswordChangedEmail({ to, name }) {
  const loginUrl = getLoginUrl();
  const subject = "Your KubeAssist password was changed";
  const text = [
    `Hello ${name || "User"},`,
    "",
    "Your KubeAssist password has been changed successfully.",
    `Login URL: ${loginUrl}`,
    "",
    "If you did not make this change, contact your administrator immediately.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">Password Changed</h2>
      <p>Hello ${name || "User"},</p>
      <p>Your KubeAssist password has been changed successfully.</p>
      <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
      <p>If you did not make this change, contact your administrator immediately.</p>
    </div>
  `;

  await sendMail({ to, subject, text, html });
}

module.exports = {
  normalizeEmail,
  sendDeveloperWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
