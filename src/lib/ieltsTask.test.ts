import { describe, expect, it } from 'vitest';
import {
  SAMPLE_READING_TASK,
  checkReadingAnswers,
  detectQuestionType,
  parseReadingImages,
} from './ieltsTask';

describe('IELTS reading parser boundary', () => {
  it('returns a reusable sample reading task when images are uploaded', async () => {
    const file = new File(['mock image'], 'reading-page.png', { type: 'image/png' });

    const task = await parseReadingImages([file]);

    expect(task.title).toContain('Urban Wetlands');
    expect(task.paragraphs.length).toBeGreaterThan(2);
    expect(task.questionGroups.length).toBeGreaterThan(3);
    expect(task.questionGroups.flatMap((group) => group.questions).length).toBeGreaterThan(8);
  });

  it('rejects empty uploads with a clear error', async () => {
    await expect(parseReadingImages([])).rejects.toThrow('Upload at least one image');
  });
});

describe('question type detection', () => {
  it('detects common IELTS Reading question families from instructions', () => {
    expect(detectQuestionType('Choose the correct letter, A, B, C or D.')).toBe('multiple-choice');
    expect(detectQuestionType('Do the following statements agree with the views of the writer?')).toBe(
      'yes-no-not-given',
    );
    expect(detectQuestionType('Complete the summary below.')).toBe('summary-completion');
    expect(detectQuestionType('Choose the correct heading for each paragraph.')).toBe('matching-headings');
  });
});

describe('answer checking', () => {
  it('scores answered sample questions and leaves unanswered items pending', () => {
    const firstGroup = SAMPLE_READING_TASK.questionGroups[0];
    const firstQuestion = firstGroup.questions[0];
    const secondQuestion = firstGroup.questions[1];
    const firstAnswer = Array.isArray(firstQuestion.answer) ? firstQuestion.answer[0] : firstQuestion.answer;

    const result = checkReadingAnswers(SAMPLE_READING_TASK, {
      [firstQuestion.id]: firstAnswer ?? '',
      [secondQuestion.id]: 'wrong answer',
    });

    expect(result.mode).toBe('scored');
    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(1);
    expect(result.totalScorable).toBeGreaterThan(1);
    expect(result.items[firstQuestion.id]?.status).toBe('correct');
    expect(result.items[secondQuestion.id]?.status).toBe('incorrect');
  });
});
