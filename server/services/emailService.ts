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
    <h1>Hesabınızı Onaylayın</h1>
    <p>Sisteme kayıt olduğunuz için teşekkürler. Lütfen aşağıdaki linke tıklayarak e-posta adresinizi onaylayın:</p>
    <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#4F46E5; text-decoration:none; border-radius:5px;">Hesabımı Onayla</a>
    <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
  `;
    await sendEmail({ email: userEmail, subject: 'Hesap Onayı - User Management App', message });
};

export const sendPasswordResetEmail = async (userEmail: string, resetToken: string): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
    <h1>Åifre Sıfırlama İsteği</h1>
    <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki linke tıklayın:</p>
    <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#E53E3E; text-decoration:none; border-radius:5px;">Åifremi Sıfırla</a>
    <p>Bu istek 1 saat boyunca geçerlidir. Eğer bu isteği siz yapmadıysanız, hesabınız güvendedir ve hiçbir işlem yapmanıza gerek yoktur.</p>
  `;
    await sendEmail({ email: userEmail, subject: 'Åifre Sıfırlama - User Management App', message });
};

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
