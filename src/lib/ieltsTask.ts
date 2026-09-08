export type QuestionType =
  | 'multiple-choice'
  | 'true-false-not-given'
  | 'yes-no-not-given'
  | 'matching-headings'
  | 'sentence-completion'
  | 'summary-completion'
  | 'short-answer'
  | 'unknown';

export type AnswerStatus = 'correct' | 'incorrect' | 'unanswered' | 'practice';

export type ReadingParagraph = {
  id: string;
  label: string;
  text: string;
};

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
};

export type ReadingQuestion = {
  id: string;
  number: number;
  type: QuestionType;
  text: string;
  options?: QuestionOption[];
  answer?: string | string[];
  targetParagraphId?: string;
  wordLimit?: string;
};

export type QuestionGroup = {
  id: string;
  title: string;
  instructions: string;
  type: QuestionType;
  options?: QuestionOption[];
  questions: ReadingQuestion[];
};

export type ReadingTask = {
  id: string;
  title: string;
  sourceFileNames: string[];
  extractedAt: string;
  paragraphs: ReadingParagraph[];
  questionGroups: QuestionGroup[];
};

export type AnswerMap = Record<string, string>;

export type CheckResult = {
  mode: 'practice' | 'scored';
  correct: number;
  incorrect: number;
  unanswered: number;
  totalScorable: number;
  items: Record<string, { status: AnswerStatus; expected?: string }>;
};

const SAMPLE_EXTRACTED_AT = '2026-06-16T00:00:00.000Z';

export const SAMPLE_READING_TASK: ReadingTask = {
  id: 'sample-urban-wetlands',
  title: 'Urban Wetlands and the Cities Around Them',
  sourceFileNames: ['sample-reading-page-1.png', 'sample-reading-page-2.png'],
  extractedAt: SAMPLE_EXTRACTED_AT,
  paragraphs: [
    {
      id: 'p-a',
      label: 'A',
      text:
        'For many years wetlands on the edges of large cities were treated as wasted land. Developers saw flat ground near rivers as useful space for roads, warehouses and housing, while residents often associated marshes with mosquitoes and unpleasant smells. In the last two decades, however, planners have begun to describe these places as working infrastructure rather than empty space.',
    },
    {
      id: 'p-b',
      label: 'B',
      text:
        'One reason for this change is flood control. Wetland plants slow down moving water and their soils can hold a remarkable volume of rainfall. When a city replaces marshland with concrete, storm water moves faster into drains and rivers. During extreme weather this can turn a manageable rise in water level into a damaging flood.',
    },
    {
      id: 'p-c',
      label: 'C',
      text:
        'Wetlands also improve water quality. Sediment settles among reeds and grasses, while bacteria in the soil break down some pollutants before they reach open rivers. These processes are not a substitute for modern water treatment plants, but they reduce pressure on expensive systems and provide a buffer when those systems are overloaded.',
    },
    {
      id: 'p-d',
      label: 'D',
      text:
        'The social value of restored wetlands is harder to measure but no less important. Boardwalks, bird hides and outdoor classrooms can bring people close to wildlife without damaging fragile areas. In several cities, former industrial sites have become popular public spaces because designers created routes that guide visitors while leaving the wettest zones undisturbed.',
    },
    {
      id: 'p-e',
      label: 'E',
      text:
        'Restoration is not simple. Urban land is expensive, and projects often need years of monitoring before native plants return in stable numbers. Some schemes fail because they copy a natural wetland shape without restoring the water flows that made the original ecosystem function. Successful projects therefore require engineers, ecologists and local communities to work from the same plan.',
    },
    {
      id: 'p-f',
      label: 'F',
      text:
        'Despite these challenges, city governments increasingly view wetlands as practical assets. They are not a cure for every environmental problem, but they can protect neighbourhoods, support biodiversity and give residents a daily reminder that urban life depends on natural systems as well as built ones.',
    },
  ],
  questionGroups: [
    {
      id: 'group-1',
      title: 'Questions 1-3',
      instructions: 'Choose the correct letter, A, B, C or D.',
      type: 'multiple-choice',
      questions: [
        {
          id: 'q1',
          number: 1,
          type: 'multiple-choice',
          text: 'What recent change in attitude towards urban wetlands is described in paragraph A?',
          options: [
            { id: 'q1-a', label: 'A', text: 'They are now considered useful parts of city systems.' },
            { id: 'q1-b', label: 'B', text: 'They are mainly valued as sites for new housing.' },
            { id: 'q1-c', label: 'C', text: 'They are thought to be too expensive to protect.' },
            { id: 'q1-d', label: 'D', text: 'They are usually removed to improve public health.' },
          ],
          answer: 'A',
          targetParagraphId: 'p-a',
        },
        {
          id: 'q2',
          number: 2,
          type: 'multiple-choice',
          text: 'According to paragraph B, what happens when marshland is replaced by concrete?',
          options: [
            { id: 'q2-a', label: 'A', text: 'Rainfall becomes less predictable.' },
            { id: 'q2-b', label: 'B', text: 'Plants absorb larger volumes of water.' },
            { id: 'q2-c', label: 'C', text: 'Storm water reaches rivers more quickly.' },
            { id: 'q2-d', label: 'D', text: 'Drainage systems become unnecessary.' },
          ],
          answer: 'C',
          targetParagraphId: 'p-b',
        },
        {
          id: 'q3',
          number: 3,
          type: 'multiple-choice',
          text: 'What warning is given about wetland restoration in paragraph E?',
          options: [
            { id: 'q3-a', label: 'A', text: 'Local residents rarely support restoration plans.' },
            { id: 'q3-b', label: 'B', text: 'A natural-looking design may not restore the ecosystem.' },
            { id: 'q3-c', label: 'C', text: 'Native plants usually return within a few weeks.' },
            { id: 'q3-d', label: 'D', text: 'Engineers should avoid working with ecologists.' },
          ],
          answer: 'B',
          targetParagraphId: 'p-e',
        },
      ],
    },
    {
      id: 'group-2',
      title: 'Questions 4-7',
      instructions: 'Do the following statements agree with the information given in the passage? Choose TRUE, FALSE or NOT GIVEN.',
      type: 'true-false-not-given',
      questions: [
        {
          id: 'q4',
          number: 4,
          type: 'true-false-not-given',
          text: 'Wetland soils can store a large amount of rainwater.',
          answer: 'TRUE',
          targetParagraphId: 'p-b',
        },
        {
          id: 'q5',
          number: 5,
          type: 'true-false-not-given',
          text: 'Wetlands can completely replace modern water treatment plants.',
          answer: 'FALSE',
          targetParagraphId: 'p-c',
        },
        {
          id: 'q6',
          number: 6,
          type: 'true-false-not-given',
          text: 'Bird hides are more popular than outdoor classrooms in restored wetlands.',
          answer: 'NOT GIVEN',
          targetParagraphId: 'p-d',
        },
        {
          id: 'q7',
          number: 7,
          type: 'true-false-not-given',
          text: 'Some restored wetlands are located on former industrial sites.',
          answer: 'TRUE',
          targetParagraphId: 'p-d',
        },
      ],
    },
    {
      id: 'group-3',
      title: 'Questions 8-11',
      instructions: 'Choose the correct heading for each paragraph from the list of headings below.',
      type: 'matching-headings',
      options: [
        { id: 'h-i', label: 'i', text: 'The limits of a visual copy' },
        { id: 'h-ii', label: 'ii', text: 'Changing ideas about unused land' },
        { id: 'h-iii', label: 'iii', text: 'Making visits possible without harm' },
        { id: 'h-iv', label: 'iv', text: 'How marshes reduce flood damage' },
        { id: 'h-v', label: 'v', text: 'A permanent end to urban pollution' },
        { id: 'h-vi', label: 'vi', text: 'A useful but limited city asset' },
      ],
      questions: [
        {
          id: 'q8',
          number: 8,
          type: 'matching-headings',
          text: 'Paragraph A',
          answer: 'ii',
          targetParagraphId: 'p-a',
        },
        {
          id: 'q9',
          number: 9,
          type: 'matching-headings',
          text: 'Paragraph B',
          answer: 'iv',
          targetParagraphId: 'p-b',
        },
        {
          id: 'q10',
          number: 10,
          type: 'matching-headings',
          text: 'Paragraph D',
          answer: 'iii',
          targetParagraphId: 'p-d',
        },
        {
          id: 'q11',
          number: 11,
          type: 'matching-headings',
          text: 'Paragraph F',
          answer: 'vi',
          targetParagraphId: 'p-f',
        },
      ],
    },
    {
      id: 'group-4',
      title: 'Questions 12-14',
      instructions: 'Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.',
      type: 'summary-completion',
      questions: [
        {
          id: 'q12',
          number: 12,
          type: 'summary-completion',
          text: 'Wetlands can improve water quality because sediment settles among reeds and ____.',
          answer: 'grasses',
          targetParagraphId: 'p-c',
          wordLimit: 'ONE WORD ONLY',
        },
        {
          id: 'q13',
          number: 13,
          type: 'summary-completion',
          text: 'Restoration projects may need years of ____ before native plants return reliably.',
          answer: 'monitoring',
          targetParagraphId: 'p-e',
          wordLimit: 'ONE WORD ONLY',
        },
        {
          id: 'q14',
          number: 14,
          type: 'short-answer',
          text: 'Which two types of specialists should work with local communities on successful projects?',
          answer: ['engineers and ecologists', 'ecologists and engineers'],
          targetParagraphId: 'p-e',
        },
      ],
    },
  ],
};

export function detectQuestionType(instructions: string): QuestionType {
  const text = instructions.toLowerCase();

  if (text.includes('choose the correct heading') || text.includes('list of headings')) {
    return 'matching-headings';
  }

  if (text.includes('true') && text.includes('false') && text.includes('not given')) {
    return 'true-false-not-given';
  }

  if (
    (text.includes('yes') && text.includes('no') && text.includes('not given')) ||
    text.includes('views of the writer') ||
    text.includes('claims of the writer')
  ) {
    return 'yes-no-not-given';
  }

  if (text.includes('complete the summary')) {
    return 'summary-completion';
  }

  if (text.includes('complete the sentence') || text.includes('sentence completion')) {
    return 'sentence-completion';
  }

  if (text.includes('how many words') || text.includes('answer the questions below')) {
    return 'short-answer';
  }

  if (text.includes('choose the correct letter') || text.includes('a, b, c') || text.includes('multiple choice')) {
    return 'multiple-choice';
  }

  return 'unknown';
}

export async function parseReadingImages(files: File[]): Promise<ReadingTask> {
  if (files.length === 0) {
    throw new Error('Upload at least one image to extract a reading task.');
  }

  await new Promise((resolve) => globalThis.setTimeout(resolve, 650));

  return {
    ...SAMPLE_READING_TASK,
    id: `mock-parse-${Date.now()}`,
    sourceFileNames: files.map((file) => file.name),
    extractedAt: new Date().toISOString(),
  };
}

export function checkReadingAnswers(task: ReadingTask, answers: AnswerMap): CheckResult {
  const questions = task.questionGroups.flatMap((group) => group.questions);
  const scorableQuestions = questions.filter((question) => question.answer !== undefined);
  const mode: CheckResult['mode'] = scorableQuestions.length === 0 ? 'practice' : 'scored';
  const items: CheckResult['items'] = {};
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const question of questions) {
    const userAnswer = normalizeAnswer(answers[question.id] ?? '');
    const expected = expectedAnswerText(question.answer);

    if (mode === 'practice' || question.answer === undefined) {
      items[question.id] = { status: 'practice' };
      continue;
    }

    if (!userAnswer) {
      unanswered += 1;
      items[question.id] = { status: 'unanswered', expected };
      continue;
    }

    const acceptedAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
    const isCorrect = acceptedAnswers.some((answer) => normalizeAnswer(answer) === userAnswer);

    if (isCorrect) {
      correct += 1;
      items[question.id] = { status: 'correct', expected };
    } else {
      incorrect += 1;
      items[question.id] = { status: 'incorrect', expected };
    }
  }

  return {
    mode,
    correct,
    incorrect,
    unanswered,
    totalScorable: scorableQuestions.length,
    items,
  };
}

export function getQuestionChoices(group: QuestionGroup, question: ReadingQuestion): QuestionOption[] {
  if (question.options) {
    return question.options;
  }

  if (question.type === 'true-false-not-given') {
    return [
      { id: `${question.id}-true`, label: 'TRUE', text: 'True' },
      { id: `${question.id}-false`, label: 'FALSE', text: 'False' },
      { id: `${question.id}-not-given`, label: 'NOT GIVEN', text: 'Not given' },
    ];
  }

  if (question.type === 'yes-no-not-given') {
    return [
      { id: `${question.id}-yes`, label: 'YES', text: 'Yes' },
      { id: `${question.id}-no`, label: 'NO', text: 'No' },
      { id: `${question.id}-not-given`, label: 'NOT GIVEN', text: 'Not given' },
    ];
  }

  if (question.type === 'matching-headings') {
    return group.options ?? [];
  }

  return [];
}

export function lookupDefinition(term: string): string {
  const normalized = term.toLowerCase().replace(/[^a-z]/g, '');
  const dictionary: Record<string, string> = {
    asset: 'A useful or valuable thing.',
    biodiversity: 'The variety of living things in one place.',
    buffer: 'Something that reduces the force or effect of another thing.',
    concrete: 'A hard building material made from cement, water, sand and stone.',
    ecologist: 'A scientist who studies relationships between living things and their environment.',
    ecosystem: 'A community of living things and the physical place where they interact.',
    fragile: 'Easily damaged or broken.',
    infrastructure: 'Basic systems and structures that help a place function.',
    marsh: 'Low wet land where grasses and reeds grow.',
    monitoring: 'Regular checking or observing over time.',
    pollutants: 'Substances that make air, water or land dirty or harmful.',
    restoration: 'The process of returning something to a better earlier condition.',
    sediment: 'Small pieces of soil or sand carried by water and left behind.',
    substitute: 'Something used instead of another thing.',
    wetland: 'An area of land that is covered with water or has very wet soil.',
    wetlands: 'Areas of land that are covered with water or have very wet soil.',
  };

  return dictionary[normalized] ?? `A short definition for "${term}" is not in the offline demo dictionary yet.`;
}

function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!?]$/g, '');
}

function expectedAnswerText(answer: ReadingQuestion['answer']): string | undefined {
  if (answer === undefined) {
    return undefined;
  }

  return Array.isArray(answer) ? answer.join(' / ') : answer;
}
