const nodemailer = require('nodemailer');
const { env } = require('../config/env');
const { OTP_EXPIRY_MINUTES, EVENT } = require('../config/constants');

const BRAND_NAME = 'MatruCare AI';
// Sender name is always the brand, never a personal name.
const FROM = `"${BRAND_NAME}" <${env.emailUser}>`;

// Gmail SMTP authenticated with an App Password (never the account password)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: env.emailUser, pass: env.emailPass },
});

/** Escape user-provided text before placing it in HTML (prevents HTML injection in emails). */
const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Shared branded wrapper. Inline styles + tables for broad email-client support. */
const layout = (title, bodyHtml) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f5fa;font-family:Arial,Helvetica,sans-serif;color:#0b1b3a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5fa;padding:32px 12px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3e8f2;">
  <tr><td style="background:#0b1b3a;padding:24px 32px;">
    <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.2px;">${BRAND_NAME}</span>
  </td></tr>
  <tr><td style="padding:32px;">
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0b1b3a;">${esc(title)}</h1>
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:20px 32px;background:#f7f9fc;border-top:1px solid #e3e8f2;font-size:12px;color:#5b6784;">
    This message was sent by ${BRAND_NAME}. Questions? Write to ${esc(env.emailUser)}.
  </td></tr>
</table></td></tr></table></body></html>`;

const sendOtpEmail = async ({ to, fullName, otp }) => {
  const html = layout('Verify your email', `
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">Hi ${esc(fullName)}, use this code to verify your ${BRAND_NAME} account.</p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;background:#eef2ff;color:#2f5bea;font-size:34px;font-weight:700;letter-spacing:10px;padding:16px 24px;border-radius:12px;">${esc(otp)}</span>
    </div>
    <p style="font-size:14px;line-height:1.6;margin:0 0 8px;">This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong> and can be used only once.</p>
    <p style="font-size:13px;line-height:1.6;margin:0;color:#5b6784;">If you didn't create an account, you can ignore this email.</p>`);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verify Your MatruCare AI Account',
    text: `Your ${BRAND_NAME} verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html,
  });
};

const sendRegistrationConfirmationEmail = async ({ to, registration }) => {
  const row = (label, value) => `<tr>
    <td style="padding:8px 0;font-size:13px;color:#5b6784;width:40%;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:14px;font-weight:600;vertical-align:top;">${esc(value)}</td></tr>`;

  const members = registration.teamMembers.length
    ? registration.teamMembers.map((m, i) => `<li style="margin:0 0 6px;">${esc(m.name)} &lt;${esc(m.email)}&gt;</li>`).join('')
    : '';
  const teamBlock = members
    ? `<p style="font-size:13px;color:#5b6784;margin:20px 0 8px;">Team members</p><ul style="margin:0;padding-left:18px;font-size:14px;">${members}</ul>`
    : '<p style="font-size:14px;margin:20px 0 0;">You are participating solo.</p>';

  const html = layout('You are registered', `
    <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">Hi ${esc(registration.fullName)}, your registration for <strong>${esc(EVENT.name)}</strong> is confirmed.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e8f2;border-bottom:1px solid #e3e8f2;">
      ${row('Event', EVENT.name)}${row('Dates', EVENT.dates)}${row('Format', EVENT.mode)}
      ${row('Project name', registration.projectName)}${row('Domain', registration.domain)}
      ${row('Team size', registration.teamSize)}
    </table>
    ${teamBlock}
    <p style="font-size:14px;line-height:1.6;margin:24px 0 0;">Keep your PPT and prototype links accessible to anyone with the link. We will email you about the next round.</p>`);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Hackathon Registration Successful',
    text: `Hi ${registration.fullName}, your registration for ${EVENT.name} is confirmed. Project: ${registration.projectName}. Domain: ${registration.domain}. Team size: ${registration.teamSize}.`,
    html,
  });
};

/** Forwards a contact-form message to the company inbox; Reply goes straight to the sender. */
const sendContactEmail = async ({ name, email, message }) => {
  const html = layout('New contact message', `
    <p style="font-size:14px;margin:0 0 6px;"><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
    <p style="font-size:14px;line-height:1.6;white-space:pre-wrap;margin:16px 0 0;">${esc(message)}</p>`);

  await transporter.sendMail({
    from: FROM,
    to: env.emailUser,
    replyTo: `"${name.replace(/["\r\n]/g, '')}" <${email}>`,
    subject: `Contact form: ${name}`.replace(/[\r\n]/g, ' '),
    text: `From: ${name} <${email}>\n\n${message}`,
    html,
  });
};

const verifyEmailTransport = () => transporter.verify();

module.exports = { sendOtpEmail, sendRegistrationConfirmationEmail, sendContactEmail, verifyEmailTransport };
