const generatePasswordResetEmail = (host, token) => {
    return {
        subject: 'Password Reset',
        message: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
};

const generateWelcomeEmail = (username) => {
    return {
        subject: 'Welcome to Ovidot! 🌸',
        message: `Hey ${username},\n\n
        You've just stepped into the future of menstrual health. 🌟 At Ovidot, we're here to make your cycle tracking smarter, easier, and more insightful than ever. 📈✨\n\n
        Track your cycle, predict ovulation, and manage your health—all with the security and simplicity you deserve. 🔒💡 Plus, we've got your back with mood tracking, pregnancy management, and emergency contact features. 💪👩‍⚕️\n\n
        Join us on this journey where your health meets innovation. 🚀\n\n
        Thank you for choosing Ovidot—let's take care of you. 💖\n\n
        Warm regards,\n
        The Ovidot Team`
    };
};

export { generatePasswordResetEmail, generateWelcomeEmail };
