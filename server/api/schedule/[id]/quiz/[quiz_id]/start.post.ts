import { Types } from "mongoose";

export default defineEventHandler(async event => {
  const user = await requireStudentSession(event);
  const classId = getRouterParam(event, "id");
  const quizId = getRouterParam(event, "quiz_id");
  const now = new Date();

  const cls = await Class.findById(classId);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  let quizResultIndex = cls.quizResults.findIndex(
    (result: QuizResultType) => result.quizId === quizId && result.userId.toString() === user.id,
  );

  const quiz = cls.lesson.quizzes.find(q => q.id === quizId);
  if (!cls) {
    throw createError({ statusCode: 404, message: "quiz_not_found" });
  }

  if (quizResultIndex === -1) {
    const newQuizResult = {
      quizId,
      userId: new Types.ObjectId(user.id),
      answers: [],
      score: 0,
      startedAt: now,
      deadlineAt: quiz?.duration && quiz.duration > 0 ? new Date(now.getTime() + quiz.duration * 1000) : null,
      status: "started",
      completedAt: null,
    };
    cls.quizResults.push(newQuizResult);
    quizResultIndex = cls.quizResults.length - 1;
  } else if (!cls.quizResults[quizResultIndex].startedAt) {
    throw createError({ statusCode: 404, message: "quiz_already_started" });
  }

  cls.updatedAt = now;

  await cls.save();

  setResponseStatus(event, 201);
});
