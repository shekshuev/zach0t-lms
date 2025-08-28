import { Types } from "mongoose";

export default defineEventHandler(async event => {
  await requireStudentSession(event);
  const classId = getRouterParam(event, "id");
  const quizId = getRouterParam(event, "quiz_id");
  const body = await readBody<CreateQuizResultAnswerDto>(event);
  const user = await requireStudentSession(event);
  const now = new Date();
  const parsed = answerQuizSchema.safeParse(body);
  if (!parsed.success || !classId || !quizId) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }

  const cls = await Class.findById(classId);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  const quiz = cls.lesson.quizzes.find(q => q.id === quizId);
  const question = quiz?.questions.find(q => q.id === parsed.data.questionId);

  if (!question) {
    throw createError({ statusCode: 404, message: "question_not_found" });
  }

  let quizResultIndex = cls.quizResults.findIndex(
    (result: QuizResultType) => result.quizId === quizId && result.userId.toString() === user.id,
  );

  if (quizResultIndex === -1) {
    const newQuizResult = {
      quizId,
      userId: new Types.ObjectId(user.id),
      answers: [],
      score: 0,
      startedAt: now,
      completedAt: null,
    };
    cls.quizResults.push(newQuizResult);
    quizResultIndex = cls.quizResults.length - 1;
  } else if (!cls.quizResults[quizResultIndex].startedAt) {
    cls.quizResults[quizResultIndex].startedAt = now;
  }

  let isCorrect = false;
  if (question.type === "multiple") {
    const correctOptions = new Set(question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id));
    isCorrect = correctOptions.difference(new Set(parsed.data.options)).size === 0;
  }

  const newAnswer = {
    questionId: parsed.data.questionId,
    options: parsed.data.options,
    isCorrect,
  };

  const existingAnswerIndex = cls.quizResults[quizResultIndex].answers.findIndex(
    answer => answer.questionId === parsed.data.questionId,
  );

  if (existingAnswerIndex !== -1) {
    throw createError({ statusCode: 409, message: "question_already_answered" });
  }

  cls.quizResults[quizResultIndex].answers.push({
    questionId: parsed.data.questionId,
    options: parsed.data.options,
    isCorrect,
  });

  cls.updatedAt = now;

  await cls.save();

  return { isCorrect };
});
