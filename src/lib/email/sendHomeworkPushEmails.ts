type HomeworkEmailRecipient = {
  id: string;
  email: string;
};

type HomeworkEmailPayload = {
  recipients: HomeworkEmailRecipient[];
  homeworkTitle: string;
  dueAt: string | null;
  assignedBy?: string | null;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const formatDueDate = (dueAt: string | null) => {
  if (!dueAt) return "No deadline";
  const date = new Date(dueAt);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export async function sendHomeworkPushEmails({
  recipients,
  homeworkTitle,
  dueAt,
  assignedBy,
}: HomeworkEmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "StudyPilot <no-reply@studypilot.com>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://studypilot.com";

  if (!resendApiKey || recipients.length === 0) {
    return {
      sent: 0,
      skipped: recipients.length,
      errors: resendApiKey ? [] : ["RESEND_API_KEY_NOT_CONFIGURED"],
    };
  }

  const dueLabel = formatDueDate(dueAt);
  const homeworkLink = `${siteUrl}/profile/homework`;
  const subject = `New Homework Assigned: ${homeworkTitle}`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">You have a new homework assignment</h2>
      <p style="margin: 0 0 16px;">
        <strong>${homeworkTitle}</strong> has been assigned to you.
      </p>
      <p style="margin: 0 0 16px;">
        <strong>Due:</strong> ${dueLabel}
      </p>
      ${
        assignedBy
          ? `<p style="margin: 0 0 16px;">Assigned by: ${assignedBy}</p>`
          : ""
      }
      <a
        href="${homeworkLink}"
        style="display: inline-block; padding: 10px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600;"
      >
        View Homework
      </a>
      <p style="margin: 20px 0 0; font-size: 12px; color: #64748b;">
        Please log in and complete it as soon as possible.
      </p>
    </div>
  `;

  const text = `New homework assigned: ${homeworkTitle}\nDue: ${dueLabel}\nPlease log in to StudyPilot to complete it: ${homeworkLink}`;

  const recipientChunks = chunkArray(recipients, 50);
  const results = await Promise.all(
    recipientChunks.map(async (chunk) => {
      const to = chunk.map((recipient) => recipient.email);
      const response = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          sent: 0,
          skipped: chunk.length,
          errors: [errorText || response.statusText],
        };
      }

      return {
        sent: chunk.length,
        skipped: 0,
        errors: [],
      };
    })
  );

  return results.reduce(
    (acc, result) => ({
      sent: acc.sent + result.sent,
      skipped: acc.skipped + result.skipped,
      errors: [...acc.errors, ...result.errors],
    }),
    { sent: 0, skipped: 0, errors: [] as string[] }
  );
}
