"use strict";
// server/services/emailService.js
const nodemailer = require('nodemailer');
// E-posta gönderici ayarları (Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Gmail kullanıyoruz, farklı bir sunucuysa host/port ayarları girilir
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
// Genel E-posta Gönderme Fonksiyonu
const sendEmail = async (options) => {
    const mailOptions = {
        from: `User Management App <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };
    await transporter.sendMail(mailOptions);
};
// E-posta Onay Maili Şablonu
const sendVerificationEmail = async (userEmail, verificationToken) => {
    // Kullanıcının tıklayacağı link (Frontend'e yönlendirir)
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `
    <h1>Hesabınızı Onaylayın</h1>
    <p>Sisteme kayıt olduğunuz için teşekkürler. Lütfen aşağıdaki linke tıklayarak e-posta adresinizi onaylayın:</p>
    <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#4F46E5; text-decoration:none; border-radius:5px;">Hesabımı Onayla</a>
    <p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
  `;
    await sendEmail({
        email: userEmail,
        subject: 'Hesap Onayı - User Management App',
        message: message,
    });
};
// Şifre Sıfırlama Maili Şablonu
const sendPasswordResetEmail = async (userEmail, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `
    <h1>Şifre Sıfırlama İsteği</h1>
    <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki linke tıklayın:</p>
    <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; color:white; background-color:#E53E3E; text-decoration:none; border-radius:5px;">Şifremi Sıfırla</a>
    <p>Bu istek 1 saat boyunca geçerlidir. Eğer bu isteği siz yapmadıysanız, hesabınız güvendedir ve hiçbir işlem yapmanıza gerek yoktur.</p>
  `;
    await sendEmail({
        email: userEmail,
        subject: 'Şifre Sıfırlama - User Management App',
        message: message,
    });
};
module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail
};
