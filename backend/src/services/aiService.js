function buildFallbackSummary(lead, activities, tasks) {
  const whoTheyAre = [
    `${lead.name}${lead.title ? " — " + lead.title : ""}`,
    lead.company ? `Company: ${lead.company}` : "",
    lead.industry ? `Industry: ${lead.industry}` : "",
    lead.companySize ? `Company size: ${lead.companySize}` : "",
    lead.email ? `Email: ${lead.email}` : "",
    lead.phone ? `Phone: ${lead.phone}` : "",
  ].filter(Boolean);

  const whatsImportant = [];
  if (lead.dealValue != null) {
    whatsImportant.push(`Deal value: $${lead.dealValue.toLocaleString()}`);
  }
  whatsImportant.push(`Current stage: ${lead.dealStage}`);

  const openTasks = tasks.filter((t) => !t.completed);
  if (openTasks.length > 0) {
    whatsImportant.push(`${openTasks.length} open follow-up task(s)`);
  }

  const whatHappened = activities.map(
    (a) =>
      `[${a.type}] ${a.content} (${new Date(a.createdAt).toLocaleDateString()})`
  );

  const whatsMissing = [];
  if (!lead.email) whatsMissing.push("Email address");
  if (!lead.phone) whatsMissing.push("Phone number");
  if (!lead.industry) whatsMissing.push("Industry");
  if (!lead.companySize) whatsMissing.push("Company size");
  if (lead.dealValue == null) whatsMissing.push("Deal value");
  if (activities.length === 0) whatsMissing.push("No activities recorded yet");
  if (openTasks.length === 0) whatsMissing.push("No open follow-up tasks");

  return {
    who_they_are: whoTheyAre.join("\n"),
    whats_important: whatsImportant,
    what_happened: whatHappened.length > 0 ? whatHappened : ["No activities recorded yet."],
    whats_missing: whatsMissing.length > 0 ? whatsMissing : ["No missing information identified."],
    fallback: true,
  };
}

function buildPrompt(lead, activities, tasks) {
  const leadInfo = {
    name: lead.name,
    title: lead.title,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    industry: lead.industry,
    companySize: lead.companySize,
    dealValue: lead.dealValue,
    dealStage: lead.dealStage,
  };

  const activityInfo = activities.map((a) => ({
    type: a.type,
    content: a.content,
    date: new Date(a.createdAt).toISOString().split("T")[0],
  }));

  const taskInfo = tasks.map((t) => ({
    title: t.title,
    dueDate: new Date(t.dueDate).toISOString().split("T")[0],
    completed: t.completed,
  }));

  return `You are a B2B sales assistant.

Analyze the following CRM data and provide a concise, useful sales summary.

Use ONLY the information provided below.
Do NOT invent, assume, or infer information that is not present.
If information is missing, mention it in "whats_missing".

CRM DATA:

${JSON.stringify(
  {
    lead: leadInfo,
    activities: activityInfo,
    tasks: taskInfo,
  },
  null,
  2
)}

Requirements:

- who_they_are: Briefly describe who the lead is using only available data.
- whats_important: List the most important facts about the lead, company, deal, stage, and follow-ups.
- what_happened: Summarize activities, with the most recent activity first.
- whats_missing: List important information that is missing or unknown.`;
}


async function generateSummary(lead, activities, tasks) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildFallbackSummary(lead, activities, tasks);
  }

  try {
    const prompt = buildPrompt(lead, activities, tasks);

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 60000);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          model: "gemini-3.6-flash",

          input: prompt,

          response_format: {
            type: "text",
            mime_type: "application/json",

            schema: {
              type: "object",

              properties: {
                who_they_are: {
                  type: "string",
                },

                whats_important: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },

                what_happened: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },

                whats_missing: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },

              required: [
                "who_they_are",
                "whats_important",
                "what_happened",
                "whats_missing",
              ],

              additionalProperties: false,
            },
          },
        }),

        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Gemini API returned ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    console.log("Gemini response received" );

    const modelOutput = data.steps?.find(
      (step) => step.type === "model_output"
    );

    const content = modelOutput?.content?.find(
      (item) => item.type === "text"
    )?.text;

    console.log("AI summary:", content);
    if (!content) {
      throw new Error("Empty Gemini response");
    }

    const parsed =
      typeof content === "string"
        ? JSON.parse(content)
        : content;

    if (
      typeof parsed.who_they_are !== "string" ||
      !Array.isArray(parsed.whats_important) ||
      !Array.isArray(parsed.what_happened) ||
      !Array.isArray(parsed.whats_missing)
    ) {
      throw new Error("Invalid summary structure from Gemini");
    }

    return {
      who_they_are: parsed.who_they_are,
      whats_important: parsed.whats_important,
      what_happened: parsed.what_happened,
      whats_missing: parsed.whats_missing,
      fallback: false,
    };

  } catch (err) {
    console.error(
      "AI summary error, using fallback:",
      err.message
    );

    return buildFallbackSummary(
      lead,
      activities,
      tasks
    );
  }
}


module.exports = { generateSummary };
