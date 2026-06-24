import { Request, Response } from 'express';
import multer from 'multer';

export const uploadTxtOnly = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for parsing
    fileFilter: (req, file, cb) => {
        if (file.originalname.toLowerCase().endsWith('.txt') || file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only TXT files are allowed') as any);
        }
    }
});

interface ParsedQuestion {
    text: string;
    options: string[];
    correctAnswer?: number;
}

/**
 * Parse a TXT file containing quiz questions in the format:
 * Q: Question text? OR 1. Question text?
 * A. Option 1
 * B. Option 2 *
 * C. Option 3
 * D. Option 4
 */
function parseTxtContent(content: string): { questions: ParsedQuestion[]; errors: string[] } {
    const errors: string[] = [];
    const questions: ParsedQuestion[] = [];

    // Normalize line endings
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    let currentQuestion: string | null = null;
    let currentOptions: string[] = [];
    let currentCorrectAnswer: number = -1;
    let questionNumber = 0;

    const pushCurrentQuestion = () => {
        if (currentQuestion !== null) {
            questionNumber++;
            if (currentOptions.length !== 4) {
                errors.push(`Question ${questionNumber} ("${currentQuestion.substring(0, 50)}...") has ${currentOptions.length} options instead of 4.`);
            } else if (currentOptions.some(o => !o.trim())) {
                errors.push(`Question ${questionNumber} has empty option(s).`);
            } else {
                questions.push({
                    text: currentQuestion.trim(),
                    options: currentOptions.map(o => o.trim()),
                    correctAnswer: currentCorrectAnswer !== -1 ? currentCorrectAnswer : undefined,
                });
            }
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        // Check for question line: starts with Q:, Q., 1., 1) etc.
        if (/^(?:Q[\s]*[:.]|\d+[\s]*[.)])/i.test(line)) {
            // Save previous question if any
            pushCurrentQuestion();
            // Start new question
            currentQuestion = line.replace(/^(?:Q[\s]*[:.]|\d+[\s]*[.)])\s*/i, '').trim();
            currentOptions = [];
            currentCorrectAnswer = -1;
            continue;
        }

        // Check for option lines: A. B. C. D.
        const optionMatch = line.match(/^([A-D])[\s]*[.)]\s*(.*)/i);
        if (optionMatch && currentQuestion !== null) {
            let optionText = optionMatch[2].trim();
            
            // Check if option ends with a non-alphanumeric character (e.g. *, ^, #) indicating it is the correct answer
            // Excluding common punctuation like ., ?, ! etc.
            const markerMatch = optionText.match(/^(.*?)\s*([^a-zA-Z0-9.,;:'"!?\s()\[\]{}%]+)$/);
            if (markerMatch) {
                optionText = markerMatch[1].trim();
                currentCorrectAnswer = currentOptions.length;
            }

            currentOptions.push(optionText);
            continue;
        }

        // If we're in a question, append to question text (multi-line questions)
        if (currentQuestion !== null && currentOptions.length === 0) {
            currentQuestion += ' ' + line;
        }
    }

    // Don't forget the last question
    pushCurrentQuestion();

    if (questions.length === 0 && errors.length === 0) {
        errors.push('No valid questions found. Make sure questions start with a number or "Q:" and options with "A.", "B.", "C.", "D."');
    }

    return { questions, errors };
}

/**
 * POST /api/quizzes/parse-txt
 * Accepts a .txt file, parses it, and returns the questions as JSON for the admin to review.
 */
export const parseTxtQuiz = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate file type
        const originalName = req.file.originalname.toLowerCase();
        if (!originalName.endsWith('.txt')) {
            return res.status(400).json({ message: 'Only .txt files are allowed' });
        }

        // Read file content
        const content = req.file.buffer.toString('utf-8');

        if (!content.trim()) {
            return res.status(400).json({ message: 'File is empty' });
        }

        const { questions, errors } = parseTxtContent(content);

        if (errors.length > 0 && questions.length === 0) {
            return res.status(400).json({
                message: 'Failed to parse quiz file',
                errors,
            });
        }

        res.json({
            message: `Successfully parsed ${questions.length} question(s)`,
            questions,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error('parseTxtQuiz error:', error);
        res.status(500).json({ message: 'Error parsing quiz file' });
    }
};
