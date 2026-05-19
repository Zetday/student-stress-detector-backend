import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import UserRepositories from '../users/repositories/user-repositories.js';
import PredictionRepositories from '../predictions/repositories/prediction-repositories.js';
import WeeklySummaryRepositories from '../weekly-summaries/repositories/weekly-summary-repositories.js';
import InsightRepositories from '../insights/repositories/insight-repositories.js';
import RecommendationRepositories from '../recommendations/repositories/recommendation-repositories.js';

class Consumer {
  constructor() {
    const user = process.env.RABBITMQ_USER || 'guest';
    const pass = process.env.RABBITMQ_PASSWORD || 'guest';
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || '5672';

    this.amqpUri = `amqp://${user}:${pass}@${host}:${port}`;

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.MAIL_PORT || '2525'),
      auth: {
        user: process.env.MAIL_USER || 'f56827880f355c',
        pass: process.env.MAIL_PASSWORD || 'f67f4833aa6429',
      },
    });
  }

  async start() {
    try {
      const connection = await amqp.connect(this.amqpUri);
      const channel = await connection.createChannel();

      await channel.assertQueue('export:stress-results', {
        durable: true,
      });

      console.log(
        '[Info] RabbitMQ consumer is active and listening on export:stress-results queue.',
      );

      channel.consume('export:stress-results', async (msg) => {
        if (msg !== null) {
          try {
            const payload = JSON.parse(msg.content.toString());
            await this.processExportTask(payload);
            channel.ack(msg);
          } catch (err) {
            console.error(
              '[Error] Failed to process export report task:',
              err.message,
            );
            channel.ack(msg); // acknowledge anyway to prevent infinite loop or re-queuing issues
          }
        }
      });
    } catch (error) {
      console.warn(
        '[Warning] RabbitMQ broker is offline or connection failed. Export consumer is inactive:',
        error.message,
      );
    }
  }

  async processExportTask({ userId, targetEmail, type }) {
    console.log(
      `[Info] Processing export task for User ID: ${userId}, Email: ${targetEmail}, Type: ${type}`,
    );

    const userResult = await UserRepositories.getUserById(userId);
    const user = userResult.data;
    if (!user) {
      console.error(`[Error] User ID ${userId} not found for export task.`);
      return;
    }

    const userName = user.name || 'Student';

    if (type === 'daily') {
      const prediction =
        await PredictionRepositories.getLatestPrediction(userId);
      let htmlContent;

      if (!prediction) {
        htmlContent = this.getEmptyDailyTemplate(userName);
      } else {
        htmlContent = this.getDailyTemplate(userName, prediction);
      }

      await this.transporter.sendMail({
        from: '"CekTenang Team" <no-reply@cektenang.id>',
        to: targetEmail,
        subject: `[CekTenang] Laporan Analisis Stres Harian Anda - ${new Date().toLocaleDateString('id-ID')}`,
        html: htmlContent,
      });
    } else if (type === 'weekly') {
      const summary = await WeeklySummaryRepositories.getLatestSummary(userId);
      const insight = await InsightRepositories.getLatestInsight(userId);
      const recommendation =
        await RecommendationRepositories.getLatestRecommendation(userId);

      let htmlContent;
      if (!summary) {
        htmlContent = this.getEmptyWeeklyTemplate(userName);
      } else {
        htmlContent = this.getWeeklyTemplate(
          userName,
          summary,
          insight,
          recommendation,
        );
      }

      await this.transporter.sendMail({
        from: '"CekTenang Team" <no-reply@cektenang.id>',
        to: targetEmail,
        subject: '[CekTenang] Ringkasan & Rekomendasi Kesehatan Mental Mingguan Anda',
        html: htmlContent,
      });
    }

    console.log(`[Info] Export email successfully sent to ${targetEmail}`);
  }

  getDailyTemplate(userName, prediction) {
    const stressScore = parseFloat(prediction.stress_score).toFixed(1);
    const stressLevel = prediction.stress_level;
    const dateStr = new Date(prediction.prediction_date).toLocaleDateString(
      'id-ID',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    // Stress color based on level
    let badgeColor = 'hsl(142, 70%, 45%)'; // low (green)
    let badgeText = 'Rendah';
    if (
      stressLevel.toLowerCase() === 'medium' ||
      stressLevel.toLowerCase() === 'sedang'
    ) {
      badgeColor = 'hsl(37, 90%, 50%)'; // medium (orange)
      badgeText = 'Sedang';
    } else if (
      stressLevel.toLowerCase() === 'high' ||
      stressLevel.toLowerCase() === 'tinggi'
    ) {
      badgeColor = 'hsl(350, 80%, 50%)'; // high (red)
      badgeText = 'Tinggi';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Stres Harian</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          <!-- Header with Gradient -->
          <div style="background: linear-gradient(135deg, hsl(174, 60%, 40%) 0%, hsl(174, 70%, 30%) 100%); padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CekTenang</h1>
            <p style="color: rgba(255, 255, 255, 0.85); margin: 8px 0 0 0; font-size: 14px;">Laporan Analisis Tingkat Stres Harian</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 40px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">Halo, <strong>${userName}</strong>!</p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Terima kasih telah mencatat aktivitas harian Anda hari ini. Berikut adalah hasil prediksi dan analisis kesehatan mental yang diproses oleh AI CekTenang untuk Anda:</p>
            
            <!-- Result Box -->
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
              <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; font-weight: bold;">Tingkat Stres</span>
              <div style="font-size: 48px; font-weight: 800; color: #111827; margin: 8px 0;">${stressScore} <span style="font-size: 20px; font-weight: 500; color: #6b7280;">/ 10</span></div>
              <div style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: ${badgeColor}; color: #ffffff; font-weight: bold; font-size: 14px; margin-bottom: 8px;">
                ${badgeText}
              </div>
              <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0 0;">Dianalisis pada ${dateStr}</p>
            </div>

            <!-- Stress Meter Visual representation -->
            <div style="margin-bottom: 32px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; margin-bottom: 6px; font-weight: 600;">
                <span>RENDAH</span>
                <span>SEDANG</span>
                <span>TINGGI</span>
              </div>
              <div style="height: 8px; border-radius: 4px; background-color: #e5e7eb; overflow: hidden; position: relative;">
                <div style="width: ${Math.min(stressScore * 10, 100)}%; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);"></div>
              </div>
            </div>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Ingatlah bahwa stres adalah respon tubuh yang wajar. Jaga kesehatan fisik Anda dengan tidur yang cukup, batasi waktu layar, dan jangan ragu untuk beristirahat saat merasa lelah.</p>
            
            <div style="margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
              <a href="https://cektenang.id/dashboard" style="display: inline-block; background-color: hsl(174, 60%, 40%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">Kembali ke Dashboard</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">Laporan ini dikirim secara otomatis oleh aplikasi CekTenang.</p>
            <p style="margin: 4px 0 0 0;">&copy; 2026 CekTenang. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWeeklyTemplate(userName, summary, insight, recommendation) {
    const avgStress = parseFloat(summary.average_stress_level).toFixed(1);
    const avgSleep = parseFloat(summary.average_sleep_hours).toFixed(1);
    const avgScreen = parseFloat(summary.average_screen_time_hours).toFixed(1);
    const trend = summary.stress_trend || 'stable';

    const startDateStr = new Date(summary.week_start).toLocaleDateString(
      'id-ID',
      { month: 'short', day: 'numeric' },
    );
    const endDateStr = new Date(summary.week_end).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    let trendIcon = '➡️';
    let trendText = 'Stabil';
    let trendColor = '#6b7280';
    if (trend === 'improving') {
      trendIcon = '📉';
      trendText = 'Membaik (Menurun)';
      trendColor = '#10b981';
    } else if (trend === 'worsening') {
      trendIcon = '📈';
      trendText = 'Memburuk (Meningkat)';
      trendColor = '#ef4444';
    }

    const insightHtml = insight ? `
      <div style="border-left: 4px solid hsl(174, 60%, 40%); background-color: #f0fdfa; padding: 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
        <h3 style="color: hsl(174, 70%, 30%); margin: 0 0 8px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Wawasan AI Anda</h3>
        <p style="color: #111827; font-size: 14.5px; line-height: 1.6; margin: 0;">"${insight.insight_text}"</p>
      </div>
    ` : '';

    const recommendationHtml = recommendation ? `
      <div style="background-color: #fcf8f2; border: 1px solid #f3e8d3; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
        <h3 style="color: #b45309; margin: 0 0 8px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">💡 Rekomendasi Terapi</h3>
        <span style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; margin-bottom: 12px;">Kategori: ${recommendation.category || 'Umum'}</span>
        <p style="color: #451a03; font-size: 14.5px; line-height: 1.6; margin: 0;">${recommendation.recommendation_text}</p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Ringkasan Mingguan Kesehatan Mental</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          <!-- Header with Gradient -->
          <div style="background: linear-gradient(135deg, hsl(174, 60%, 40%) 0%, hsl(174, 70%, 30%) 100%); padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CekTenang</h1>
            <p style="color: rgba(255, 255, 255, 0.85); margin: 8px 0 0 0; font-size: 14px;">Laporan & Analisis Mingguan Kesehatan Mental</p>
            <p style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); color: #ffffff; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin: 12px 0 0 0; font-weight: 600;">
              Periode: ${startDateStr} - ${endDateStr}
            </p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 40px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">Halo, <strong>${userName}</strong>!</p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Kerja bagus telah rutin memantau kondisi emosional Anda minggu ini! AI CekTenang telah mengompilasi seluruh data harian Anda untuk memberikan ringkasan holistik serta rekomendasi personal:</p>
            
            <!-- Summary Dashboard Stats (Grid equivalent) -->
            <div style="margin: 32px 0; border-collapse: collapse; width: 100%;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; padding: 8px; box-sizing: border-box;">
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; display: block; margin-bottom: 4px;">Rerata Stres</span>
                      <strong style="font-size: 24px; color: #111827;">${avgStress}</strong> <span style="font-size: 12px; color: #6b7280;">/ 10</span>
                    </div>
                  </td>
                  <td style="width: 50%; padding: 8px; box-sizing: border-box;">
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; display: block; margin-bottom: 4px;">Tren Stres</span>
                      <strong style="font-size: 15px; color: ${trendColor};">${trendIcon} ${trendText}</strong>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; padding: 8px; box-sizing: border-box;">
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; display: block; margin-bottom: 4px;">Tidur Harian</span>
                      <strong style="font-size: 20px; color: #111827;">${avgSleep}</strong> <span style="font-size: 12px; color: #6b7280;">Jam</span>
                    </div>
                  </td>
                  <td style="width: 50%; padding: 8px; box-sizing: border-box;">
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; text-align: center;">
                      <span style="font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: bold; display: block; margin-bottom: 4px;">Waktu Layar</span>
                      <strong style="font-size: 20px; color: #111827;">${avgScreen}</strong> <span style="font-size: 12px; color: #6b7280;">Jam</span>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Insight Box -->
            ${insightHtml}

            <!-- Recommendation Box -->
            ${recommendationHtml}

            <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
              <a href="https://cektenang.id/dashboard" style="display: inline-block; background-color: hsl(174, 60%, 40%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">Buka Riwayat Lengkap</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">Laporan ini dikirim secara otomatis oleh aplikasi CekTenang.</p>
            <p style="margin: 4px 0 0 0;">&copy; 2026 CekTenang. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmptyDailyTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Belum Ada Prediksi</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, hsl(174, 60%, 40%) 0%, hsl(174, 70%, 30%) 100%); padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CekTenang</h1>
          </div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📝</div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">Halo, <strong>${userName}</strong>!</p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Kami belum menemukan catatan aktivitas harian Anda hari ini. Silakan catat aktivitas harian Anda sekarang untuk mendeteksi tingkat stres dan mendapatkan rekomendasi!</p>
            <div style="margin-top: 32px;">
              <a href="https://cektenang.id/dashboard" style="display: inline-block; background-color: hsl(174, 60%, 40%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Catat Aktivitas Sekarang</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmptyWeeklyTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Belum Ada Ringkasan Mingguan</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, hsl(174, 60%, 40%) 0%, hsl(174, 70%, 30%) 100%); padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">CekTenang</h1>
          </div>
          <div style="padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 0;">Halo, <strong>${userName}</strong>!</p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">Kami belum menemukan data ringkasan mingguan Anda. Silakan catat aktivitas harian Anda secara rutin setiap hari untuk menghasilkan ringkasan otomatis mingguan serta terapi personal!</p>
            <div style="margin-top: 32px;">
              <a href="https://cektenang.id/dashboard" style="display: inline-block; background-color: hsl(174, 60%, 40%); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Buka Dashboard CekTenang</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new Consumer();
