import config from '../config/index.js';

// Brevo (Sendinblue) email service
export const sendVerificationEmail = async (email, name, token) => {
  if (!config.brevoApiKey) {
    console.log('⚠️ Brevo API key not configured. Skipping email.');
    console.log(`📧 Verification link: ${config.frontendUrl}/verify-email/${token}`);
    return;
  }

  try {
    const SibApiV3Sdk = (await import('sib-api-v3-sdk')).default;

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = config.brevoApiKey;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      subject: 'Xác thực email - QALY BAHA',
      htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">QALY BAHA</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2>Xin chào ${name}!</h2>
                        <p>Cảm ơn bạn đã đăng ký QALY BAHA. Vui lòng click vào nút bên dưới để xác thực email:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${config.frontendUrl}/verify-email/${token}" 
                               style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                Xác thực email
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            Link này sẽ hết hạn sau 24 giờ. Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.
                        </p>
                    </div>
                    <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        © 2024 QALY BAHA. All rights reserved.
                    </div>
                </div>
            `,
      sender: { name: 'QALY BAHA', email: config.brevoSenderEmail },
      to: [{ email: email, name: name }]
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Verification email sent to:', email, result);
  } catch (error) {
    console.error('❌ Error sending verification email:', error.message || error);
    if (error.response) {
      console.error('Brevo API Error:', error.response.body);
    }
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  if (!config.brevoApiKey) {
    console.log('⚠️ Brevo API key not configured. Skipping email.');
    console.log(`📧 Password reset link: ${config.frontendUrl}/reset-password/${token}`);
    return;
  }

  try {
    const SibApiV3Sdk = (await import('sib-api-v3-sdk')).default;

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = config.brevoApiKey;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      subject: 'Đặt lại mật khẩu - QALY BAHA',
      htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">QALY BAHA</h1>
                    </div>
                    <div style="padding: 30px; background: #f9fafb;">
                        <h2>Xin chào ${name}!</h2>
                        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Click vào nút bên dưới để đặt mật khẩu mới:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${config.frontendUrl}/reset-password/${token}" 
                               style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                Đặt lại mật khẩu
                            </a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">
                            Link này sẽ hết hạn sau 1 giờ.<br>
                            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                        </p>
                    </div>
                    <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
                        © 2024 QALY BAHA. All rights reserved.
                    </div>
                </div>
            `,
      sender: { name: 'QALY BAHA', email: config.brevoSenderEmail },
      to: [{ email: email, name: name }]
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Password reset email sent to:', email, result);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message || error);
    if (error.response) {
      console.error('Brevo API Error:', error.response.body);
    }
    throw error;
  }
};
