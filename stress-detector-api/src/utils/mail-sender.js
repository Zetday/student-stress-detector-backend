import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport(
  process.env.MOCK_MAIL?.trim() === 'true'
    ? { jsonTransport: true }
    : {
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.MAIL_PORT || '2525'),
      auth: {
        user: process.env.MAIL_USER || 'f56827880f355c',
        pass: process.env.MAIL_PASSWORD || 'f67f4833aa6429',
      },
    }
);

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reset Kata Sandi Anda - CekTenang</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
        <!-- Header with Gradient -->
        <div style="background: linear-gradient(135deg, hsl(174, 60%, 40%) 0%, hsl(174, 70%, 30%) 100%); padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CekTenang</h1>
          <p style="color: rgba(255, 255, 255, 0.85); margin: 8px 0 0 0; font-size: 14px;">Permintaan Pemulihan Kata Sandi</p>
        </div>
        
        <!-- Content Body -->
        <div style="padding: 40px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">Halo,</p>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Kami menerima permintaan untuk mereset kata sandi akun CekTenang Anda. Silakan klik tombol di bawah ini untuk mengatur kata sandi baru Anda:</p>
          
          <div style="margin: 32px 0; text-align: center;">
            <a href="${resetUrl}" style="display: inline-block; background-color: hsl(174, 60%, 40%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">Atur Ulang Kata Sandi</a>
          </div>

          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Atau, Anda dapat menyalin dan menempelkan tautan berikut ke browser Anda:</p>
          <p style="color: hsl(174, 60%, 40%); font-size: 13px; word-break: break-all; background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <a href="${resetUrl}" style="color: hsl(174, 60%, 40%); text-decoration: none;">${resetUrl}</a>
          </p>
          
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 24px;">Tautan ini hanya berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset kata sandi, Anda dapat mengabaikan email ini dengan aman.</p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">Email ini dikirim secara otomatis oleh aplikasi CekTenang.</p>
          <p style="margin: 4px 0 0 0;">&copy; 2026 CekTenang. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: '"CekTenang Team" <no-reply@cektenang.id>',
    to: email,
    subject: '[CekTenang] Instruksi Atur Ulang Kata Sandi',
    html: htmlContent,
  });
};
