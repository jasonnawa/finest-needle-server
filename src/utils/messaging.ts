import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export class NotificationService {
  async sendPDFEmail(to: string, subject: string, message: string, pdfFilename: string) {
    const pdfPath = path.join(__dirname, "..", "assets", `${pdfFilename}.pdf`); // adjust path to your structure
    console.log('path', pdfPath)

    if (!fs.existsSync(pdfPath)) {
      throw new Error("PDF file not found: " + pdfPath);
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Finest Needle" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
      attachments: [
        {
          filename: pdfFilename,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    });
  }
}
