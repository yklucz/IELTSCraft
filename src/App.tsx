import { useMemo, useState } from 'react';
import type { ChangeEvent, DragEvent, MouseEvent, ReactNode } from 'react';
import {
  SAMPLE_READING_TASK,
  checkReadingAnswers,
  getQuestionChoices,
  lookupDefinition,
  parseReadingImages,
} from './lib/ieltsTask';
import type {
  AnswerMap,
  CheckResult,
  QuestionGroup,
  QuestionOption,
  ReadingParagraph,
  ReadingQuestion,
  ReadingTask,
} from './lib/ieltsTask';

type AppStatus = 'empty' | 'parsing' | 'parsed' | 'error';
type ToolMode = 'select' | 'define' | 'highlight';
type MobilePane = 'passage' | 'questions';

type Highlight = {
  id: string;
  paragraphId: string;
  text: string;
};

type DefinitionResult = {
  term: string;
  definition: string;
};

const TYPE_LABELS: Record<ReadingQuestion['type'], string> = {
  'multiple-choice': 'Multiple choice',
  'true-false-not-given': 'True / False / Not Given',
  'yes-no-not-given': 'Yes / No / Not Given',
  'matching-headings': 'Matching headings',
  'sentence-completion': 'Sentence completion',
  'summary-completion': 'Summary completion',
  'short-answer': 'Short answer',
  unknown: 'Question',
};

export default function App() {
  const [status, setStatus] = useState<AppStatus>('empty');
  const [task, setTask] = useState<ReadingTask | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [definition, setDefinition] = useState<DefinitionResult | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [mobilePane, setMobilePane] = useState<MobilePane>('passage');

  const questionCount = useMemo(
    () => task?.questionGroups.reduce((sum, group) => sum + group.questions.length, 0) ?? 0,
    [task],
  );

  const handleFiles = async (files: File[]) => {
    setStatus('parsing');
    setError('');
    setDefinition(null);
    setCheckResult(null);
    setAnswers({});
    setHighlights([]);
    setUploadedFiles(files.map((file) => file.name));

    try {
      const parsedTask = await parseReadingImages(files);
      setTask(parsedTask);
      setStatus('parsed');
      setMobilePane('passage');
    } catch (parseError) {
      setTask(null);
      setStatus('error');
      setError(parseError instanceof Error ? parseError.message : 'The images could not be parsed.');
    }
  };

  const loadSample = () => {
    setStatus('parsed');
    setTask(SAMPLE_READING_TASK);
    setUploadedFiles(SAMPLE_READING_TASK.sourceFileNames);
    setError('');
    setDefinition(null);
    setCheckResult(null);
    setAnswers({});
    setHighlights([]);
    setMobilePane('passage');
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setCheckResult(null);
  };

  const checkAnswers = () => {
    if (!task) {
      return;
    }

    setCheckResult(checkReadingAnswers(task, answers));
  };

  const handlePassageSelection = (paragraphId: string, event: MouseEvent<HTMLElement>) => {
    if (toolMode === 'select') {
      return;
    }

    const selection = globalThis.getSelection?.();
    const selectedText = selection?.toString().trim().replace(/\s+/g, ' ');

    if (!selection || !selectedText || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedElement =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as Element)
        : range.commonAncestorContainer.parentElement;

    if (!selectedElement?.closest(`[data-paragraph-id="${paragraphId}"]`)) {
      return;
    }

    if (toolMode === 'highlight') {
      setHighlights((current) => {
        const exists = current.some(
          (highlight) => highlight.paragraphId === paragraphId && highlight.text.toLowerCase() === selectedText.toLowerCase(),
        );

        if (exists) {
          return current;
        }

        return [
          ...current,
          {
            id: `${paragraphId}-${Date.now()}`,
            paragraphId,
            text: selectedText,
          },
        ];
      });
      setDefinition(null);
      selection.removeAllRanges();
      return;
    }

    const term = extractDefinitionTerm(selectedText);
    setDefinition({
      term,
      definition: lookupDefinition(term),
    });
    setToolMode('define');
    event.currentTarget.focus();
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">IELTSCraft Reading MVP</p>
          <h1>Image to interactive reading task</h1>
        </div>
        <div className="header-actions">
          <button className="button secondary" type="button" onClick={loadSample}>
            Load sample
          </button>
        </div>
      </header>

      <UploadPanel
        status={status}
        uploadedFiles={uploadedFiles}
        error={error}
        questionCount={questionCount}
        task={task}
        onFiles={handleFiles}
        onLoadSample={loadSample}
      />

      <section className="mobile-switch" aria-label="Task panes">
        <button
          className={mobilePane === 'passage' ? 'is-active' : ''}
          type="button"
          onClick={() => setMobilePane('passage')}
        >
          Passage
        </button>
        <button
          className={mobilePane === 'questions' ? 'is-active' : ''}
          type="button"
          onClick={() => setMobilePane('questions')}
        >
          Questions
        </button>
      </section>

      <section className={`workspace ${task ? 'has-task' : ''}`} aria-live="polite">
        <PassagePane
          isActive={mobilePane === 'passage'}
          task={task}
          status={status}
          toolMode={toolMode}
          definition={definition}
          highlights={highlights}
          onToolModeChange={setToolMode}
          onClearHighlights={() => setHighlights([])}
          onSelectText={handlePassageSelection}
        />
        <QuestionPane
          isActive={mobilePane === 'questions'}
          task={task}
          status={status}
          answers={answers}
          checkResult={checkResult}
          onAnswerChange={updateAnswer}
          onCheckAnswers={checkAnswers}
        />
      </section>
    </main>
  );
}

function UploadPanel({
  status,
  uploadedFiles,
  error,
  questionCount,
  task,
  onFiles,
  onLoadSample,
}: {
  status: AppStatus;
  uploadedFiles: string[];
  error: string;
  questionCount: number;
  task: ReadingTask | null;
  onFiles: (files: File[]) => void;
  onLoadSample: () => void;
}) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    onFiles(Array.from(event.dataTransfer.files).filter((file) => file.type.startsWith('image/')));
  };

  return (
    <section className="upload-band">
      <label
        className={`upload-target ${status === 'parsing' ? 'is-loading' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <input accept="image/*" multiple type="file" onChange={handleInputChange} />
        <span className="upload-title">{status === 'parsing' ? 'Extracting task...' : 'Upload reading-task images'}</span>
        <span className="upload-copy">PNG, JPG, or HEIC pages. The MVP uses a replaceable mock parser.</span>
      </label>

      <div className="extraction-status">
        {status === 'error' ? (
          <div className="status-message error">{error}</div>
        ) : task ? (
          <>
            <div className="status-kicker">Parsed task</div>
            <strong>{task.title}</strong>
            <span>
              {task.paragraphs.length} paragraphs, {questionCount} questions
            </span>
            <span className="file-list">{uploadedFiles.join(', ')}</span>
          </>
        ) : (
          <>
            <div className="status-kicker">No task loaded</div>
            <strong>Start with images or the demo set.</strong>
            <button className="button text" type="button" onClick={onLoadSample}>
              Open sample task
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function PassagePane({
  isActive,
  task,
  status,
  toolMode,
  definition,
  highlights,
  onToolModeChange,
  onClearHighlights,
  onSelectText,
}: {
  isActive: boolean;
  task: ReadingTask | null;
  status: AppStatus;
  toolMode: ToolMode;
  definition: DefinitionResult | null;
  highlights: Highlight[];
  onToolModeChange: (mode: ToolMode) => void;
  onClearHighlights: () => void;
  onSelectText: (paragraphId: string, event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <article className={`pane passage-pane ${isActive ? 'is-active' : ''}`}>
      <div className="pane-header">
        <div>
          <p className="eyebrow">Passage</p>
          <h2>{task?.title ?? 'Reading passage'}</h2>
        </div>
        <div className="tool-strip" aria-label="Passage tools">
          <button
            className={toolMode === 'select' ? 'is-active' : ''}
            type="button"
            onClick={() => onToolModeChange('select')}
          >
            Select
          </button>
          <button
            className={toolMode === 'define' ? 'is-active' : ''}
            type="button"
            onClick={() => onToolModeChange('define')}
          >
            Define
          </button>
          <button
            className={toolMode === 'highlight' ? 'is-active' : ''}
            type="button"
            onClick={() => onToolModeChange('highlight')}
          >
            Highlight
          </button>
          <button type="button" onClick={onClearHighlights} disabled={highlights.length === 0}>
            Clear
          </button>
        </div>
      </div>

      {definition ? (
        <div className="definition-box" role="status">
          <strong>{definition.term}</strong>
          <span>{definition.definition}</span>
        </div>
      ) : null}

      <div className="pane-scroll">
        {status === 'parsing' ? <SkeletonPassage /> : null}
        {status !== 'parsing' && !task ? <EmptyPane title="No passage extracted yet." /> : null}
        {task?.paragraphs.map((paragraph) => (
          <PassageParagraph
            highlights={highlights.filter((highlight) => highlight.paragraphId === paragraph.id)}
            key={paragraph.id}
            paragraph={paragraph}
            onSelectText={onSelectText}
          />
        ))}
      </div>
    </article>
  );
}

function PassageParagraph({
  paragraph,
  highlights,
  onSelectText,
}: {
  paragraph: ReadingParagraph;
  highlights: Highlight[];
  onSelectText: (paragraphId: string, event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <section
      className="passage-paragraph"
      data-paragraph-id={paragraph.id}
      onMouseUp={(event) => onSelectText(paragraph.id, event)}
      tabIndex={0}
    >
      <span className="paragraph-label">{paragraph.label}</span>
      <p>{renderHighlightedText(paragraph.text, highlights)}</p>
    </section>
  );
}

function QuestionPane({
  isActive,
  task,
  status,
  answers,
  checkResult,
  onAnswerChange,
  onCheckAnswers,
}: {
  isActive: boolean;
  task: ReadingTask | null;
  status: AppStatus;
  answers: AnswerMap;
  checkResult: CheckResult | null;
  onAnswerChange: (questionId: string, value: string) => void;
  onCheckAnswers: () => void;
}) {
  const answeredCount = task?.questionGroups
    .flatMap((group) => group.questions)
    .filter((question) => answers[question.id]?.trim()).length;
  const totalQuestions = task?.questionGroups.reduce((sum, group) => sum + group.questions.length, 0) ?? 0;

  return (
    <aside className={`pane question-pane ${isActive ? 'is-active' : ''}`}>
      <div className="pane-header">
        <div>
          <p className="eyebrow">Questions</p>
          <h2>{totalQuestions ? `${answeredCount ?? 0}/${totalQuestions} answered` : 'Question set'}</h2>
        </div>
        <button className="button primary" type="button" onClick={onCheckAnswers} disabled={!task}>
          Check
        </button>
      </div>

      {checkResult ? <ScoreSummary result={checkResult} /> : null}

      <div className="pane-scroll questions-scroll">
        {status === 'parsing' ? <SkeletonQuestions /> : null}
        {status !== 'parsing' && !task ? <EmptyPane title="No questions extracted yet." /> : null}
        {task?.questionGroups.map((group) => (
          <QuestionGroupView
            answers={answers}
            checkResult={checkResult}
            group={group}
            key={group.id}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    </aside>
  );
}

function QuestionGroupView({
  group,
  answers,
  checkResult,
  onAnswerChange,
}: {
  group: QuestionGroup;
  answers: AnswerMap;
  checkResult: CheckResult | null;
  onAnswerChange: (questionId: string, value: string) => void;
}) {
  return (
    <section className="question-group">
      <div className="group-header">
        <div>
          <h3>{group.title}</h3>
          <p>{group.instructions}</p>
        </div>
        <span>{TYPE_LABELS[group.type]}</span>
      </div>

      {group.options && group.type === 'matching-headings' ? (
        <div className="heading-bank">
          {group.options.map((option) => (
            <span key={option.id}>
              <strong>{option.label}</strong> {option.text}
            </span>
          ))}
        </div>
      ) : null}

      <div className="question-list">
        {group.questions.map((question) => (
          <QuestionView
            answer={answers[question.id] ?? ''}
            checkResult={checkResult}
            group={group}
            key={question.id}
            question={question}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionView({
  group,
  question,
  answer,
  checkResult,
  onAnswerChange,
}: {
  group: QuestionGroup;
  question: ReadingQuestion;
  answer: string;
  checkResult: CheckResult | null;
  onAnswerChange: (questionId: string, value: string) => void;
}) {
  const choices = getQuestionChoices(group, question);
  const itemResult = checkResult?.items[question.id];

  return (
    <div className={`question-card ${itemResult ? `is-${itemResult.status}` : ''}`}>
      <div className="question-text">
        <span>{question.number}</span>
        <p>{question.text}</p>
      </div>

      <AnswerControl choices={choices} question={question} value={answer} onChange={onAnswerChange} />

      {itemResult ? (
        <div className="answer-feedback">
          <span>{formatStatus(itemResult.status)}</span>
          {itemResult.status === 'incorrect' && itemResult.expected ? <strong>Answer: {itemResult.expected}</strong> : null}
          {itemResult.status === 'unanswered' ? <strong>Not answered</strong> : null}
        </div>
      ) : null}
    </div>
  );
}

function AnswerControl({
  question,
  choices,
  value,
  onChange,
}: {
  question: ReadingQuestion;
  choices: QuestionOption[];
  value: string;
  onChange: (questionId: string, value: string) => void;
}) {
  if (choices.length > 0 && question.type !== 'matching-headings') {
    return (
      <div className="choice-list">
        {choices.map((option) => (
          <label className="choice-option" key={option.id}>
            <input
              checked={value === option.label}
              name={question.id}
              type="radio"
              value={option.label}
              onChange={(event) => onChange(question.id, event.target.value)}
            />
            <span className="choice-label">{option.label}</span>
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'matching-headings') {
    return (
      <select value={value} onChange={(event) => onChange(question.id, event.target.value)}>
        <option value="">Select heading</option>
        {choices.map((option) => (
          <option key={option.id} value={option.label}>
            {option.label}. {option.text}
          </option>
        ))}
      </select>
    );
  }

  return (
    <label className="text-answer">
      <span>{question.wordLimit ?? 'Answer'}</span>
      <input
        autoComplete="off"
        type="text"
        value={value}
        onChange={(event) => onChange(question.id, event.target.value)}
      />
    </label>
  );
}

function ScoreSummary({ result }: { result: CheckResult }) {
  if (result.mode === 'practice') {
    return <div className="score-summary">Practice mode. No answer key was extracted.</div>;
  }

  return (
    <div className="score-summary">
      <strong>
        {result.correct}/{result.totalScorable} correct
      </strong>
      <span>
        {result.incorrect} incorrect, {result.unanswered} unanswered
      </span>
    </div>
  );
}

function EmptyPane({ title }: { title: string }) {
  return <div className="empty-pane">{title}</div>;
}

function SkeletonPassage() {
  return (
    <div className="skeleton-stack" aria-label="Loading passage">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function SkeletonQuestions() {
  return (
    <div className="skeleton-stack compact" aria-label="Loading questions">
      <span />
      <span />
      <span />
    </div>
  );
}

function renderHighlightedText(text: string, highlights: Highlight[]): ReactNode[] {
  if (highlights.length === 0) {
    return [text];
  }

  const terms = highlights
    .map((highlight) => highlight.text.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < text.length) {
    const match = terms.find((term) => text.slice(index, index + term.length).toLowerCase() === term.toLowerCase());

    if (!match) {
      nodes.push(text[index]);
      index += 1;
      continue;
    }

    nodes.push(
      <mark className="passage-highlight" key={`${match}-${index}`}>
        {text.slice(index, index + match.length)}
      </mark>,
    );
    index += match.length;
  }

  return nodes;
}

function extractDefinitionTerm(text: string): string {
  return text.match(/[A-Za-z]+/)?.[0] ?? text;
}

function formatStatus(status: CheckResult['items'][string]['status']) {
  if (status === 'correct') {
    return 'Correct';
  }

  if (status === 'incorrect') {
    return 'Incorrect';
  }

  if (status === 'unanswered') {
    return 'Unanswered';
  }

  return 'Practice';
}
