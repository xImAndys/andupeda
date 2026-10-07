// Content for the three LLM-application decks (5 slides each = 15 slides).
// Every fact on a slide is taken from one of the deck's reference URLs.
// Prompts on slide 4 are our own educated guesses and are labelled as such.

export const decks = [
  // ───────────────────────────────────────────── 1 · FINTECH ──
  {
    slug: "klarna-ai-assistant",
    index: 1,
    industry: "Fintech · Payments",
    app: "Klarna AI Assistant",
    company: "Klarna",
    theme: { accent: "#FFB3C7", accentInk: "#8C1D4B", accentSoft: "#FFE3EB" },
    title: {
      kicker: "LLM application 1 of 3",
      tagline: "An OpenAI-powered customer-service agent inside the Klarna shopping & payments app.",
      facts: [
        ["Company", "Klarna (Sweden), buy now, pay later"],
        ["Industry", "Fintech / consumer payments"],
        ["LLM", "OpenAI models, orchestrated with LangGraph"],
        ["Live", "Global since Feb 2024, 23 markets"],
      ],
    },
    references: [
      ["Klarna press release (27 Feb 2024)", "https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/"],
      ["OpenAI customer story", "https://openai.com/index/klarna/"],
      ["LangChain case study (LangGraph + LangSmith)", "https://www.langchain.com/blog/customers-klarna"],
      ["The Pragmatic Engineer — critical analysis", "https://blog.pragmaticengineer.com/klarnas-ai-chatbot/"],
      ["CX Today — launch coverage", "https://www.cxtoday.com/contact-center/klarna-claims-its-new-ai-assistant-does-the-work-of-700-full-time-agents/"],
    ],
    summary: {
      headline: "Klarna’s assistant took over two-thirds of customer-service chats in its first month.",
      rows: [
        ["Who", "Klarna shoppers who need help with a purchase or a payment, chatting inside the Klarna app."],
        ["Job", "Answer and act on refunds, returns, payment schedules and other account questions, 24/7, in 35+ languages."],
        ["How", "The assistant reads the customer’s own orders and payments, then answers or hands off to a human agent."],
      ],
      stats: [
        ["2.3M", "conversations in month one"],
        ["2 min", "to resolve, down from 11 min"],
        ["−25%", "repeat inquiries"],
        ["700", "full-time agents’ worth of work"],
      ],
      source: "Klarna press release, 27 Feb 2024 [1]",
    },
    diagram: {
      headline: "Every chat is routed by intent, answered with the customer’s own account data, or escalated.",
      nodes: [
        { id: "a", x: 0, y: 0, kind: "user", title: "Customer opens chat", sub: "Klarna app, any of 35+ languages" },
        { id: "b", x: 302, y: 0, kind: "system", title: "Load account context", sub: "orders, purchases, payment plan" },
        { id: "c", x: 604, y: 0, kind: "llm", title: "Intent router", sub: "LLM classifies the request" },
        { id: "d", x: 906, y: 0, kind: "llm", title: "Specialist agent", sub: "tailored prompt per intent" },
        { id: "e", x: 1208, y: 0, kind: "system", title: "Klarna back-end tools", sub: "look up order, pause payment, refund" },
        { id: "f", x: 1510, y: 0, kind: "llm", title: "Reply to customer", sub: "in the customer’s language" },
        { id: "h", x: 755, y: 330, kind: "human", title: "Human agent", sub: "handoff with chat summary" },
        { id: "g", x: 1359, y: 330, kind: "system", title: "Resolved", sub: "chat closed, satisfaction survey" },
        { id: "i", x: 151, y: 330, kind: "system", title: "LangSmith traces & evals", sub: "test and improve prompts" },
      ],
      edges: [
        ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e", "tool call"], ["e", "f"],
        ["f", "g", "solved"], ["d", "h", "needs a human"], ["i", "c", "", "dashed"],
      ],
      footnote: "Reconstructed from public sources [1][3]; tool names are our illustration.",
    },
    prompts: {
      headline: "Our guess: a router prompt picks the intent, then a specialist prompt answers with real account data.",
      blocks: [
        {
          label: "Prompt A · Intent router",
          text: `SYSTEM
You are the router for Klarna customer service.
Classify the customer's latest message into ONE intent:
REFUND, RETURN, PAYMENT_SCHEDULE, DISPUTE,
PAYMENT_DECLINED, ACCOUNT, SHOPPING, OTHER.
Set "human": true if the customer asks for a person,
mentions fraud, financial hardship or legal action.
Reply only with JSON:
{"intent": "...", "language": "...", "human": false}

USER
{customer_message}`,
        },
        {
          label: "Prompt B · Returns & refunds specialist",
          text: `SYSTEM
You are Klarna's assistant helping {first_name}.
Always reply in {language}. Be friendly and brief.
Customer data (the only facts you may use):
  orders: {orders_json}
  upcoming payments: {payment_plan_json}
Policy: {returns_policy_excerpt}
Rules:
- Never invent amounts, dates or order numbers.
- If an item is being returned, offer to pause the
  payment with pause_payment(order_id).
- If you cannot solve it, call
  handoff_to_agent(summary).
- End by asking if the issue is solved.`,
        },
      ],
    },
    screenshots: {
      headline: "In the Klarna app, the assistant answers as a chat thread next to the customer’s orders and payments.",
    },
    notes: [
      "Introduce Klarna: Swedish fintech, buy-now-pay-later. The assistant lives inside the Klarna app. References are on the slide.",
      "Lead with the two-thirds number. Then who uses it, what it does, and the four headline metrics from Klarna's press release.",
      "Walk left to right: context load, LLM router, specialist prompt plus tools, reply. Point out the human handoff and the LangSmith evaluation loop.",
      "These are our guesses. The router returns structured JSON. The specialist gets only the customer's own data and is told never to invent numbers.",
      "Show the real product UI. Point out that it is a chat inside the app, not a separate website.",
    ],
  },

  // ───────────────────────────────────────────── 2 · EDUCATION ──
  {
    slug: "khanmigo",
    index: 2,
    industry: "Education",
    app: "Khanmigo",
    company: "Khan Academy",
    theme: { accent: "#7FE0C4", accentInk: "#0B6650", accentSoft: "#DDF6EE" },
    title: {
      kicker: "LLM application 2 of 3",
      tagline: "Khan Academy’s AI tutor for students and teaching assistant for teachers.",
      facts: [
        ["Company", "Khan Academy — nonprofit online learning platform"],
        ["Industry", "Education (K-12 tutoring & teacher tools)"],
        ["LLM", "OpenAI GPT-4 (launch partner); Azure OpenAI for teachers"],
        ["Price", "Free for U.S. teachers; $4/month for learners & parents"],
      ],
    },
    references: [
      ["Khanmigo product site", "https://www.khanmigo.ai/"],
      ["OpenAI customer story — Khan Academy", "https://openai.com/index/khan-academy/"],
      ["Khan Academy — 7-step approach to prompt engineering", "https://blog.khanacademy.org/khan-academys-7-step-approach-to-prompt-engineering-for-khanmigo"],
      ["Khan Academy — prompt engineering a lesson plan", "https://blog.khanacademy.org/prompt-engineering-using-ai-for-effective-lesson-planning/"],
      ["Khan Academy — unlimited tutoring for $4/month", "https://blog.khanacademy.org/unlimited-homework-tutoring-for-4-month/"],
      ["Khan Academy Help — Khanmigo moderation", "https://support.khanacademy.org/hc/en-us/articles/14394569357069"],
    ],
    summary: {
      headline: "Khanmigo tutors like a patient teacher: it asks guiding questions instead of giving the answer.",
      rows: [
        ["Who", "Students working through Khan Academy exercises, and teachers who plan lessons."],
        ["Job", "Tutor students step by step (Socratic method); help teachers write lesson plans, rubrics and more."],
        ["Safety", "Chats are moderated; flagged content triggers an alert to the child’s parent or teacher."],
      ],
      stats: [
        ["GPT-4", "OpenAI launch partner, March 2023"],
        ["$4", "per month for learners & parents"],
        ["Free", "for all U.S. teachers (Microsoft)"],
        ["24/7", "always-available tutor"],
      ],
      source: "OpenAI story [2], Khan Academy blog [5], Khanmigo site [1]",
    },
    diagram: {
      headline: "Each student message passes a safety check, then a tutor prompt that knows the solution but only hints.",
      nodes: [
        { id: "a", x: 0, y: 0, kind: "user", title: "Student asks for help", sub: "on a Khan Academy exercise" },
        { id: "b", x: 302, y: 0, kind: "system", title: "Assemble context", sub: "exercise, hidden solution, hints, grade" },
        { id: "c", x: 604, y: 0, kind: "system", title: "Moderation check", sub: "unsafe text or images?" },
        { id: "d", x: 906, y: 0, kind: "llm", title: "Check the work", sub: "find the first wrong step" },
        { id: "e", x: 1208, y: 0, kind: "llm", title: "Socratic tutor reply", sub: "one hint or question, no answer" },
        { id: "f", x: 1510, y: 0, kind: "user", title: "Student tries again", sub: "loop until they solve it" },
        { id: "g", x: 604, y: 330, kind: "human", title: "Parent / teacher alert", sub: "email + in-app notification" },
        { id: "h", x: 1208, y: 330, kind: "human", title: "Chat history", sub: "visible to parent / teacher" },
        { id: "t", x: 0, y: 330, kind: "llm", title: "Teacher tools", sub: "separate flow: lesson plans from Khan content" },
      ],
      edges: [
        ["a", "b"], ["b", "c"], ["c", "d", "safe"], ["d", "e"], ["e", "f"],
        ["c", "g", "flagged"], ["e", "h", "", "dashed"], ["f", "a", "next message", "loop"],
      ],
      footnote: "Reconstructed from public sources [2][3][4][6]; the internal work-check step is our inference.",
    },
    prompts: {
      headline: "Our guess: the tutor prompt sees the solution, hides it, and builds on learning-science rules.",
      blocks: [
        {
          label: "Prompt A · Socratic tutor (student)",
          text: `SYSTEM
You are Khanmigo, a friendly, patient tutor.
Student: grade {grade}, interests: {interests}.
Exercise: {exercise_text}
Solution (NEVER reveal): {solution_steps}
Rules:
- Never give the final answer or do a step
  for the student.
- First ask what they have tried so far.
- Ask ONE guiding question at a time.
- If a step is wrong, point to where and ask
  them to explain their reasoning.
- Use examples from their interests.
- Keep replies under 60 words.`,
        },
        {
          label: "Prompt B · Hidden work check (not shown)",
          text: `SYSTEM
Compare the student's work with the solution.
Student work: {student_work}
Solution: {solution_steps}
Return JSON only:
{"first_wrong_step": <number or null>,
 "misconception": "...",
 "next_hint_goal": "..."}

-- Teacher tool (chained prompts) --
Write a lesson plan for {standard}.
Use only this Khan content: {articles},
{video_transcripts}, {practice_items}.`,
        },
      ],
    },
    screenshots: {
      headline: "Khanmigo works inside Khan Academy: the tutor chat sits next to the student’s exercise.",
    },
    notes: [
      "Introduce Khan Academy and Khanmigo. It is a nonprofit, and it was a GPT-4 launch partner. References are on the slide.",
      "Lead with the Socratic idea: it never just gives the answer. Then the teacher side, pricing, and safety moderation.",
      "Walk through the loop: context, moderation, work check, Socratic reply, student retries. Moderation flags go to the parent or teacher.",
      "These are our guesses, based on Khan's published prompt-engineering principles: meet students where they are, use their interests, give immediate feedback, ask for self-explanation.",
      "Show the real UI: exercise and tutor chat side by side.",
    ],
  },

  // ───────────────────────────────────────────── 3 · HEALTHCARE ──
  {
    slug: "abridge",
    index: 3,
    industry: "Healthcare",
    app: "Abridge",
    company: "Abridge",
    theme: { accent: "#A9B8FF", accentInk: "#2B3A9C", accentSoft: "#E3E8FF" },
    title: {
      kicker: "LLM application 3 of 3",
      tagline: "Ambient AI that listens to a doctor’s visit and writes the clinical note.",
      facts: [
        ["Company", "Abridge (Pittsburgh) — healthcare AI"],
        ["Industry", "Healthcare / clinical documentation"],
        ["LLM", "Generative AI with a “Contextual Reasoning Engine”"],
        ["Scale", "100+ health-system deployments; inside Epic"],
      ],
    },
    references: [
      ["Abridge — product", "https://www.abridge.com/product"],
      ["Abridge — AI & Linked Evidence", "https://www.abridge.com/ai"],
      ["Press: “Abridge Inside” for Epic", "https://www.abridge.com/press-release/abridge-inside-emory"],
      ["Press: Series D & Contextual Reasoning Engine", "https://www.abridge.com/press-release/series-d"],
      ["Press: UPMC scales Abridge to 12,000 clinicians", "https://www.abridge.com/press-release/upmc-scales-abridge"],
      ["Abridge Help — complete a recording", "https://support.abridge.com/hc/en-us/articles/30235024449427-Complete-a-Recording-in-the-Abridge-app"],
    ],
    summary: {
      headline: "Abridge drafts the clinical note during the visit, and links every sentence back to what was said.",
      rows: [
        ["Who", "Doctors and nurses at health systems, working in the Epic electronic health record (EHR)."],
        ["Job", "Turn the patient–clinician conversation into a structured note the clinician reviews and signs."],
        ["Trust", "“Linked Evidence” maps each part of the note to the transcript and audio, so it can be checked."],
      ],
      stats: [
        ["100+", "health-system deployments"],
        ["12,000", "clinicians at UPMC alone"],
        ["$250M", "Series D (Feb 2025)"],
        ["Epic", "built into Haiku & Hyperdrive"],
      ],
      source: "Abridge press releases [3][4][5]",
    },
    diagram: {
      headline: "Audio becomes a transcript, the LLM writes a note with sources, and the clinician signs it.",
      nodes: [
        { id: "a", x: 0, y: 0, kind: "user", title: "Clinician taps record", sub: "in Epic; patient consents" },
        { id: "b", x: 302, y: 0, kind: "system", title: "Speech-to-text", sub: "speaker-labelled transcript" },
        { id: "c", x: 604, y: 0, kind: "system", title: "Add EHR context", sub: "problems, meds, past notes" },
        { id: "d", x: 906, y: 0, kind: "llm", title: "Draft clinical note", sub: "HPI, exam, assessment & plan" },
        { id: "e", x: 1208, y: 0, kind: "system", title: "Linked Evidence", sub: "sentence → transcript + audio" },
        { id: "f", x: 1510, y: 0, kind: "human", title: "Clinician reviews", sub: "edits and signs in Epic" },
        { id: "g", x: 1208, y: 330, kind: "llm", title: "Codes & orders", sub: "suggested for the clinician to review" },
        { id: "h", x: 1510, y: 330, kind: "system", title: "Note filed in EHR", sub: "part of the patient record" },
      ],
      edges: [
        ["a", "b"], ["b", "c"], ["c", "d"], ["d", "e"], ["e", "f"],
        ["d", "g", "billing & orders"], ["f", "h", "signed"],
      ],
      footnote: "Reconstructed from public sources [2][3][4][6]; internal model steps are our inference.",
    },
    prompts: {
      headline: "Our guess: the note prompt allows only facts from the visit, with a source for every sentence.",
      blocks: [
        {
          label: "Prompt A · Clinical note writer",
          text: `SYSTEM
You write a {specialty} outpatient note.
Input: transcript with segment ids [S1]..[Sn],
EHR context: {problem_list}, {medications}.
Sections: HPI, ROS, Physical Exam,
Assessment & Plan (one block per problem).
Rules:
- Use ONLY facts said in the transcript or
  given in the EHR context.
- After every sentence cite its segments,
  e.g. [S12, S14].
- Skip small talk. Use medical terminology.
- Missing info -> "[clinician to complete]".`,
        },
        {
          label: "Prompt B · Codes & orders",
          text: `SYSTEM
From the note and transcript below, list:
1. Each problem discussed, with the most
   specific ICD-10 code and the evidence ids.
2. Orders the clinician said out loud
   (labs, imaging, prescriptions, referrals).
Do NOT add anything that was not said.
Mark every item "needs clinician review".
Return JSON:
{"problems": [...], "orders": [...]}

NOTE: {draft_note}
TRANSCRIPT: {transcript}`,
        },
      ],
    },
    screenshots: {
      headline: "Abridge shows the draft note next to the conversation, so the clinician can check each line.",
    },
    notes: [
      "Introduce Abridge: healthcare AI, ambient documentation, used inside Epic. References are on the slide.",
      "Lead with the problem: documentation burden. Abridge drafts the note during the visit. Linked Evidence is the trust feature.",
      "Walk the pipeline: record, speech-to-text, EHR context, LLM draft, Linked Evidence, human review and signature. Codes and orders come from the Contextual Reasoning Engine.",
      "These are our guesses. The key constraint is grounding: only facts from the visit, a citation per sentence, and placeholders instead of guesses.",
      "Show the real product UI with the note and its linked evidence.",
    ],
  },
];
