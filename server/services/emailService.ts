import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (options: { email: string; subject: string; message: string; }): Promise<void> => {
    const mailOptions = {
        from: `User Management App <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };
    await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (userEmail: string, verificationToken: string): Promise<void> => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `
    <h1>HesabÄ±nÄ±zÄ± OnaylayÄ±n</h1>
    <p>Sisteme kayÄ±t olduÄŸunuz iÃ§in teÅŸekkÃ¼rler. LÃ¼tfen aÅŸaÄŸÄ±daki linke tÄ±klayarak e-posta adresinizi onaylayÄ±n:</p>
    <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#4F46E5; text-decoration:none; border-radius:5px;">HesabÄ±mÄ± Onayla</a>
    <p>EÄŸer bu hesabÄ± siz oluÅŸturmadÄ±ysanÄ±z, bu e-postayÄ± gÃ¶rmezden gelebilirsiniz.</p>
  `;
    await sendEmail({ email: userEmail, subject: 'Hesap OnayÄ± - User Management App', message });
};

export const sendPasswordResetEmail = async (userEmail: string, resetToken: string): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
    <h1>Åifre SÄ±fÄ±rlama Ä°steÄŸi</h1>
    <p>HesabÄ±nÄ±z iÃ§in ÅŸifre sÄ±fÄ±rlama talebinde bulundunuz. Yeni ÅŸifrenizi belirlemek iÃ§in aÅŸaÄŸÄ±daki linke tÄ±klayÄ±n:</p>
    <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#E53E3E; text-decoration:none; border-radius:5px;">Åifremi SÄ±fÄ±rla</a>
    <p>Bu istek 1 saat boyunca geÃ§erlidir. EÄŸer bu isteÄŸi siz yapmadÄ±ysanÄ±z, hesabÄ±nÄ±z gÃ¼vendedir ve hiÃ§bir iÅŸlem yapmanÄ±za gerek yoktur.</p>
  `;
    await sendEmail({ email: userEmail, subject: 'Åifre SÄ±fÄ±rlama - User Management App', message });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
