import sendMail from "./_sendMail.js";

export default async function (job, done) {
    try {
        const emailData = job.data;
        await sendMail({
            email: emailData.to,
            subject: emailData.subject,
            message: emailData.text,
        });
        done();
        return { success: true };
    } catch (error) {
        done(error);
        throw new Error(error.message);
    }
}
