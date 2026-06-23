import { apiClient } from '../api';

export interface ISmtpConfig {
  host: string;
  port: number;
  username: string;
  hasPassword?: boolean;
  password?: string;
  senderEmail?: string;
}

export interface ISendMailInput {
  from?: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text: string;
}

export const mailApi = {
  getConfig: async (): Promise<ISmtpConfig> => {
    const res = await apiClient.get<ISmtpConfig>('/mail/config');
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to load SMTP configuration');
    }
    return res.data;
  },

  saveConfig: async (config: ISmtpConfig): Promise<ISmtpConfig> => {
    const res = await apiClient.post<ISmtpConfig>('/mail/config', config);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to save SMTP configuration');
    }
    return res.data;
  },

  testConnection: async (config: ISmtpConfig): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/mail/test-connection', config);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to test SMTP connection');
    }
    return res.data;
  },

  sendMail: async (input: ISendMailInput): Promise<{ message: string; messageId: string }> => {
    const res = await apiClient.post<{ message: string; messageId: string }>('/mail/send', input);
    if (res.error) {
      throw new Error(res.error);
    }
    if (!res.data) {
      throw new Error('Failed to send email');
    }
    return res.data;
  },
};
export default mailApi;
