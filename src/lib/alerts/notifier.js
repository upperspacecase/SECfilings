import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

/**
 * Send alert emails for matched filings.
 * @param {Array<{ rule: object, matchedFilings: object[], userEmail: string }>} matches
 */
export async function sendAlertEmails(matches) {
    if (!resend) {
        console.warn("⚠️  RESEND_API_KEY not set — skipping email send");
        return;
    }

    for (const { rule, matchedFilings, userEmail } of matches) {
        const filingRows = matchedFilings
            .map(
                (f) =>
                    `<tr>
            <td style="padding:8px;border-bottom:1px solid #2a2a3e">${f.entityName}</td>
            <td style="padding:8px;border-bottom:1px solid #2a2a3e">${f.sicCode || "—"}</td>
            <td style="padding:8px;border-bottom:1px solid #2a2a3e">${f.totalOfferingAmount
                        ? "$" + f.totalOfferingAmount.toLocaleString()
                        : "—"
                    }</td>
            <td style="padding:8px;border-bottom:1px solid #2a2a3e">${(f.statesOfSolicitation || []).join(", ") || "—"
                    }</td>
            <td style="padding:8px;border-bottom:1px solid #2a2a3e">
              <a href="${f.edgarUrl}" style="color:#818cf8">View →</a>
            </td>
          </tr>`
            )
            .join("");

        try {
            await resend.emails.send({
                from: "FilingPulse <alerts@filingpulse.com>",
                to: userEmail,
                subject: `🚨 ${matchedFilings.length} new Form D filing${matchedFilings.length > 1 ? "s" : ""
                    } matched "${rule.name}"`,
                html: `
          <div style="font-family:Inter,sans-serif;background:#0f0f1a;color:#e2e8f0;padding:32px;border-radius:12px">
            <h2 style="color:#818cf8;margin-top:0">FilingPulse Alert</h2>
            <p>Your rule <strong>"${rule.name}"</strong> matched ${matchedFilings.length} new filing${matchedFilings.length > 1 ? "s" : ""
                    }:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <thead>
                <tr style="color:#94a3b8;text-align:left">
                  <th style="padding:8px;border-bottom:2px solid #2a2a3e">Entity</th>
                  <th style="padding:8px;border-bottom:2px solid #2a2a3e">SIC</th>
                  <th style="padding:8px;border-bottom:2px solid #2a2a3e">Offering</th>
                  <th style="padding:8px;border-bottom:2px solid #2a2a3e">States</th>
                  <th style="padding:8px;border-bottom:2px solid #2a2a3e">EDGAR</th>
                </tr>
              </thead>
              <tbody>${filingRows}</tbody>
            </table>
            <p style="color:#64748b;font-size:12px;margin-top:24px">
              You're receiving this because of your alert rule "${rule.name}" on FilingPulse.
            </p>
          </div>
        `,
            });
        } catch (err) {
            console.error(`Failed to send alert email to ${userEmail}:`, err.message);
        }
    }
}
