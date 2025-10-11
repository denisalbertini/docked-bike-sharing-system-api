import nodemailer from 'nodemailer';
import Result from '../../model/shared/result.js';
import { INTERNAL_SERVER_ERROR } from '../../model/shared/enum/error-types.js';

export default class EmailService {
  async #createTransporter() {
    const testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  async sendAccountConfirmation(bikerId, bikerEmail, token) {
    try {
      const transporter = await this.#createTransporter();

      const confirmationUrl = `http://localhost:3000/api/biker/${bikerId}/email-confirmation?token=${token}`;

      const mailOptions = {
        from: '"Bike Sharing System" <noreply@bssapp.com>',
        to: bikerEmail,
        subject: 'Confirm Your Biker Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Bike Sharing System! 🚴‍♂️</h2>
            <p>Please confirm your email address to activate your account.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${confirmationUrl}" 
              style="background-color: #ff4d4d; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;
                      margin: 16px 0;">
              Confirm Email Address
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${confirmationUrl}</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
        `,
        text: `Welcome to Bike Sharing System! Please confirm your email by visiting: ${confirmationUrl}`,
      };

      const info = await transporter.sendMail(mailOptions);

      return Result.success(info);
    } catch (error) {
      return Result.failure(INTERNAL_SERVER_ERROR, error.message);
    }
  }

  async sendRentalConfirmation(bikerEmail, rentalInfo, isReturn = false) {
    try {
      const transporter = await createTransporter();

      const mailOptions = {
        from: '"Bike Sharing System" <noreply@bssapp.com>',
        to: bikerEmail,
        subject: isReturn
          ? 'Your Renturn Confirmation'
          : 'Your Rental Confirmation',
        html: this.#generateRentalConfirmationTemplate(rentalInfo),
        text: this.#generatePlainTextRentalConfirmation(rentalInfo),
      };

      const info = await transporter.sendMail(mailOptions);

      return Result.success(info);
    } catch (error) {
      return Result.failure(INTERNAL_SERVER_ERROR, error.message);
    }
  }

  #generateRentalConfirmationTemplate(rentalInfo, isReturn) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #333; text-align: center; margin-bottom: 30px;">🚴‍♂️ ${
        isReturn ? 'Return' : 'Rental'
      } Confirmed!</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="color: #28a745; margin-top: 0;">${
          isReturn ? 'Return' : 'Rental'
        } Details</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px;">Station:</td>
            <td style="padding: 8px 0;">${rentalInfo.station}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Time:</td>
            <td style="padding: 8px 0;">${rentalInfo.time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Charge Amount:</td>
            <td style="padding: 8px 0; color: #dc3545; font-size: 1.1em;">
              $${rentalInfo.chargeAmount.toFixed(2)}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
  }

  #generatePlainTextRentalConfirmation(rentalInfo, isReturn) {
    return `
    ${isReturn ? 'Return' : 'Rental'} Confirmation

    Your ${isReturn ? 'Return' : 'Rental'} has been successfully processed!

    ${isReturn ? 'Return' : 'Rental'} Details:
    ---------------
    Station: ${rentalInfo.station}
    Time: ${rentalInfo.time}
    Charge Amount: $${rentalInfo.chargeAmount.toFixed(2)}
    `;
  }
}
