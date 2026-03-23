import type { SurveyStep } from "./types";
import {
  getSession,
  upsertSession,
  deleteSession,
  createReport,
} from "./session";
import { sendText, sendButtons, sendList } from "./whapi";

export const QUESTIONS: SurveyStep[] = [
  // SECTION A: BASIC INFORMATION
  {
    key: "age",
    prompt:
      "*Section A: Basic Information*\n\nQuestion 1 of 16:\nHow old are you?",
    type: "text",
  },
  {
    key: "gender",
    prompt: "Question 2 of 16:\nWhat is your gender?",
    type: "choice",
    choices: ["Male", "Female"],
    ui: "buttons",
  },
  {
    key: "community",
    prompt: "Question 3 of 16:\nWhat is your community or area?",
    type: "text",
  },
  {
    key: "occupation",
    prompt:
      "Question 4 of 16:\nWhat is your occupation? (Student, worker, business, unemployed, etc.)",
    type: "text",
  },

  // SECTION B: COMMUNITY CHALLENGES
  {
    key: "biggest_problems",
    prompt:
      "*Section B: Community Challenges*\n\nQuestion 5 of 16:\nWhat are the biggest problems in your community right now?\n\nType the numbers separated by commas (e.g. *1,3,5*)\n\n1. Unemployment\n2. Poverty\n3. Poor education\n4. Poor healthcare\n5. Mental health challenges\n6. Gender-based violence\n7. Drug or substance abuse\n8. Insecurity\n9. Water or sanitation problems\n10. Other",
    type: "multi_choice",
    choices: [
      "Unemployment",
      "Poverty",
      "Poor education",
      "Poor healthcare",
      "Mental health challenges",
      "Gender-based violence",
      "Drug or substance abuse",
      "Insecurity",
      "Water or sanitation problems",
      "Other",
    ],
  },
  {
    key: "most_personal_problem",
    prompt:
      "Question 6 of 16:\nWhich of these problems affects you the most personally?",
    type: "text",
  },

  // SECTION C: CURRENT SOLUTIONS & GAPS
  {
    key: "current_solutions",
    prompt:
      "*Section C: Current Solutions*\n\nQuestion 7 of 16:\nHow do people currently try to solve this problem?",
    type: "choice",
    choices: ["NGOs", "Government help", "Family support", "Self-effort", "None"],
    ui: "list",
    listButton: "View Options",
  },
  {
    key: "whats_missing",
    prompt:
      "Question 8 of 16:\nWhat is missing in the current solutions?",
    type: "text",
  },

  // SECTION D: COMMUNITY NEEDS & DEMAND
  {
    key: "support_needed",
    prompt:
      "*Section D: Community Needs*\n\nQuestion 9 of 16:\nWhat type of support would make your life easier?\n\nType the numbers separated by commas (e.g. *1,4,6*)\n\n1. Skills training\n2. Job opportunities\n3. Education support\n4. Mental health support\n5. Youth programs\n6. Women and girls support\n7. Business or financial support\n8. Health services\n9. Information or awareness programs\n10. Other",
    type: "multi_choice",
    choices: [
      "Skills training",
      "Job opportunities",
      "Education support",
      "Mental health support",
      "Youth programs",
      "Women and girls support",
      "Business or financial support",
      "Health services",
      "Information or awareness programs",
      "Other",
    ],
  },
  {
    key: "who_needs_most",
    prompt:
      "Question 10 of 16:\nWho do you think needs this support the most?",
    type: "choice",
    choices: ["Youth", "Women", "Men", "Children", "Everyone"],
    ui: "list",
    listButton: "View Options",
  },

  // SECTION E: PRIORITY & VALUE
  {
    key: "priority_problem",
    prompt:
      "*Section E: Priority*\n\nQuestion 11 of 16:\nIf only one problem could be solved first, which one should it be?",
    type: "text",
  },
  {
    key: "why_urgent",
    prompt:
      "Question 12 of 16:\nWhy is this problem urgent for your community?",
    type: "text",
  },

  // SECTION F: ACCESS & ENGAGEMENT
  {
    key: "preferred_channel",
    prompt:
      "*Section F: Access*\n\nQuestion 13 of 16:\nHow would you prefer to receive help or information?\n\nType the numbers separated by commas (e.g. *1,3*)\n\n1. Community meetings\n2. Phone / WhatsApp\n3. Social media\n4. Radio\n5. In-person support centers\n6. Other",
    type: "multi_choice",
    choices: [
      "Community meetings",
      "Phone / WhatsApp",
      "Social media",
      "Radio",
      "In-person support centers",
      "Other",
    ],
  },
  {
    key: "barriers",
    prompt:
      "Question 14 of 16:\nWhat would stop people from using a new program or service?\n(e.g. cost, trust, distance, time, fear, lack of information)",
    type: "text",
  },

  // SECTION G: FINAL COMMENTS
  {
    key: "final_comments",
    prompt:
      "*Section G: Final Comments*\n\nQuestion 15 of 16:\nIs there anything else you want to share about your community?",
    type: "text",
  },

  // LOCATION (last step)
  {
    key: "location",
    prompt:
      "Question 16 of 16:\nLast step! Please share your location.\n(Tap the + button > Location > Send Your Current Location)",
    type: "location",
  },
];

/** Send a question with the appropriate UI (buttons, list, or plain text) */
async function sendQuestion(chatId: string, question: SurveyStep) {
  const { prompt, ui, choices, listButton } = question;

  if (ui === "buttons" && choices && choices.length <= 3) {
    await sendButtons(
      chatId,
      prompt,
      choices.map((c, i) => ({ id: `btn_${i}`, title: c }))
    );
  } else if (ui === "list" && choices) {
    await sendList(
      chatId,
      prompt,
      listButton || "Select",
      choices.map((c, i) => ({ id: `list_${i}`, title: c }))
    );
  } else {
    await sendText(chatId, prompt);
  }
}

function parseChoiceInput(
  input: string,
  choices: string[]
): string | null {
  const directMatch = choices.find(
    (c) => c.toLowerCase() === input.toLowerCase()
  );
  if (directMatch) return directMatch;

  const num = parseInt(input.trim(), 10);
  if (num >= 1 && num <= choices.length) {
    return choices[num - 1];
  }
  return null;
}

/** Parse multi-choice input. Returns { selected, hasOther } */
function parseMultiChoiceInput(
  input: string,
  choices: string[]
): { selected: string[]; hasOther: boolean } | null {
  const directMatch = choices.find(
    (c) => c.toLowerCase() === input.toLowerCase()
  );
  if (directMatch) {
    return {
      selected: [directMatch],
      hasOther: directMatch === "Other",
    };
  }

  const parts = input.split(/[,\s]+/).filter(Boolean);
  const selected: string[] = [];
  let hasOther = false;

  for (const part of parts) {
    const num = parseInt(part.trim(), 10);
    if (num >= 1 && num <= choices.length) {
      const choice = choices[num - 1];
      selected.push(choice);
      if (choice === "Other") hasOther = true;
    }
  }

  return selected.length > 0 ? { selected, hasOther } : null;
}

function buildSummary(answers: Record<string, string>): string {
  const lines: string[] = ["*Your Report Summary:*\n"];
  const labels: Record<string, string> = {
    age: "Age",
    gender: "Gender",
    community: "Community",
    occupation: "Occupation",
    biggest_problems: "Biggest Problems",
    most_personal_problem: "Most Personal Problem",
    current_solutions: "Current Solutions",
    whats_missing: "What's Missing",
    support_needed: "Support Needed",
    who_needs_most: "Who Needs Most",
    priority_problem: "Priority Problem",
    why_urgent: "Why Urgent",
    preferred_channel: "Preferred Channel",
    barriers: "Barriers",
    final_comments: "Final Comments",
    location: "Location",
  };

  QUESTIONS.forEach((q, i) => {
    const label = labels[q.key] || q.key;
    const answer = answers[q.key] || "(not answered)";
    lines.push(`${i + 1}. ${label}: ${answer}`);
  });

  return lines.join("\n");
}

async function sendSummaryWithButtons(
  chatId: string,
  answers: Record<string, string>
) {
  const summary = buildSummary(answers);
  const footer =
    '\nTap *Done* to submit or *Edit* to change an answer.\nTo edit, reply with *"Edit [number]"* (e.g. "Edit 3")';

  await sendButtons(chatId, summary + footer, [
    { id: "btn_done", title: "Done" },
    { id: "btn_edit", title: "Edit" },
  ]);
}

export async function handleMessage(
  chatId: string,
  phone: string,
  text: string,
  location: { latitude: number; longitude: number } | null,
  voiceUrl: string | null
): Promise<void> {
  const lowerText = text.toLowerCase().trim();

  // Check for start/restart
  if (lowerText === "hi" || lowerText === "hello" || lowerText === "start") {
    await upsertSession(phone, 0, {});
    await sendText(
      chatId,
      "Welcome to the Community Survey! You'll answer 16 short questions.\n\nLet's begin:"
    );
    await sendQuestion(chatId, QUESTIONS[0]);
    return;
  }

  // Load session
  const session = await getSession(phone);
  if (!session) {
    await sendText(
      chatId,
      'Welcome! Send *"Hi"* or *"Start"* to begin the community survey.'
    );
    return;
  }

  const answers = session.answers;
  const step = session.current_step;

  // Handle "Other" follow-up: user is providing their custom "Other" text
  if (answers._awaiting_other) {
    const key = answers._awaiting_other;
    delete answers._awaiting_other;

    // Append the custom text to the existing answer
    const existing = answers[key] || "";
    const otherText = text.trim();
    if (otherText) {
      // Replace "Other" with the actual text
      answers[key] = existing.replace(/Other$/, "").replace(/,\s*$/, "");
      answers[key] = answers[key]
        ? `${answers[key]}, ${otherText}`
        : otherText;
    }

    await upsertSession(phone, step, answers);

    // Continue to next question
    if (step >= QUESTIONS.length) {
      await sendSummaryWithButtons(chatId, answers);
    } else {
      await sendQuestion(chatId, QUESTIONS[step]);
    }
    return;
  }

  // Handle "Done" (text or button tap)
  if (
    (lowerText === "done" || lowerText === "✅ done") &&
    step >= QUESTIONS.length
  ) {
    const lat = answers.location_lat
      ? parseFloat(answers.location_lat)
      : null;
    const lng = answers.location_lng
      ? parseFloat(answers.location_lng)
      : null;

    const voiceUrls = answers._voice_urls
      ? JSON.parse(answers._voice_urls)
      : [];

    const cleanAnswers = { ...answers };
    delete cleanAnswers.location_lat;
    delete cleanAnswers.location_lng;
    delete cleanAnswers._voice_urls;
    delete cleanAnswers._editing;
    delete cleanAnswers._awaiting_other;

    await createReport(phone, cleanAnswers, lat, lng, voiceUrls);
    await deleteSession(phone);
    await sendText(
      chatId,
      'Your report has been submitted successfully! Thank you for participating.\n\nSend *"Hi"* to start a new survey.'
    );
    return;
  }

  // Handle "Edit" button tap
  if (lowerText === "edit" && step >= QUESTIONS.length) {
    await sendText(
      chatId,
      'Which question do you want to edit? Reply with the number (1-16).\nE.g. *"Edit 3"* to change your community.'
    );
    return;
  }

  // Handle "Edit N"
  const editMatch = text.match(/^edit\s*(\d+)$/i);
  if (editMatch && step >= QUESTIONS.length) {
    const editNum = parseInt(editMatch[1], 10);
    if (editNum >= 1 && editNum <= QUESTIONS.length) {
      const targetStep = editNum - 1;
      answers._editing = "true";
      await upsertSession(phone, targetStep, answers);
      await sendQuestion(chatId, QUESTIONS[targetStep]);
      return;
    } else {
      await sendText(
        chatId,
        `Please enter a number between 1 and ${QUESTIONS.length}.`
      );
      return;
    }
  }

  // We're at a question step
  if (step >= QUESTIONS.length) {
    await sendSummaryWithButtons(chatId, answers);
    return;
  }

  const currentQuestion = QUESTIONS[step];

  // Process the answer based on type
  if (currentQuestion.type === "location") {
    if (location) {
      answers.location = `${location.latitude}, ${location.longitude}`;
      answers.location_lat = String(location.latitude);
      answers.location_lng = String(location.longitude);
    } else {
      const match = text.match(/([-+]?\d+\.\d+)[,\s]+([-+]?\d+\.\d+)/);
      if (match) {
        answers.location = `${match[1]}, ${match[2]}`;
        answers.location_lat = match[1];
        answers.location_lng = match[2];
      } else {
        await sendText(
          chatId,
          "Please share your location using WhatsApp's location feature.\n(Tap + > Location > Send Your Current Location)\n\nOr paste coordinates like: 8.4657, -13.2317"
        );
        return;
      }
    }
  } else if (currentQuestion.type === "choice") {
    const selected = parseChoiceInput(text, currentQuestion.choices!);
    if (!selected) {
      await sendText(
        chatId,
        `Please select an option or reply with a number (1-${currentQuestion.choices!.length}).`
      );
      return;
    }
    answers[currentQuestion.key] = selected;
  } else if (currentQuestion.type === "multi_choice") {
    const result = parseMultiChoiceInput(text, currentQuestion.choices!);
    if (!result) {
      await sendText(
        chatId,
        'Please type numbers separated by commas (e.g. *1,3,5*).'
      );
      return;
    }

    answers[currentQuestion.key] = result.selected.join(", ");

    // If "Other" was selected, prompt for details before advancing
    if (result.hasOther) {
      const isEditing = answers._editing === "true";
      const nextStep = isEditing ? QUESTIONS.length : step + 1;
      answers._awaiting_other = currentQuestion.key;
      await upsertSession(phone, nextStep, answers);
      await sendText(
        chatId,
        "You selected *Other*. Please type what you mean:"
      );
      return;
    }
  } else if (currentQuestion.type === "voice") {
    if (voiceUrl) {
      answers[currentQuestion.key] = "(voice message)";
      const urls = answers._voice_urls
        ? JSON.parse(answers._voice_urls)
        : [];
      urls.push(voiceUrl);
      answers._voice_urls = JSON.stringify(urls);
    } else {
      answers[currentQuestion.key] = text;
    }
  } else {
    if (!text.trim()) {
      await sendText(chatId, "Please type your answer.");
      return;
    }
    answers[currentQuestion.key] = text.trim();
  }

  // If editing, jump back to summary instead of continuing forward
  const isEditing = answers._editing === "true";
  if (isEditing) {
    delete answers._editing;
    await upsertSession(phone, QUESTIONS.length, answers);
    await sendSummaryWithButtons(chatId, answers);
  } else {
    const nextStep = step + 1;
    await upsertSession(phone, nextStep, answers);

    if (nextStep >= QUESTIONS.length) {
      await sendSummaryWithButtons(chatId, answers);
    } else {
      await sendQuestion(chatId, QUESTIONS[nextStep]);
    }
  }
}
