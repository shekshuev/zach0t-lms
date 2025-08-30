export default defineEventHandler(async event => {
  const user = await requireStudentSession(event);
  const classId = getRouterParam(event, "id");
  const quizId = getRouterParam(event, "quiz_id");
  const now = new Date();

  const cls = await Class.findById(classId);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  const quiz = cls.lesson.quizzes.find(q => q.id === quizId);
  if (!quiz) {
    throw createError({ statusCode: 404, message: "quiz_not_found" });
  }

  let quizResultIndex = cls.quizResults.findIndex(
    (result: QuizResultType) => result.quizId === quizId && result.userId.toString() === user.id,
  );
  if (quizResultIndex === -1) {
    throw createError({ statusCode: 404, message: "quiz_not_found" });
  }

  if (++cls.quizResults[quizResultIndex].cheatAttempts === quiz.maxCheatAttempts) {
    cls.quizResults[quizResultIndex].status = "banned";
  }

  cls.updatedAt = now;

  await cls.save();

  return toReadStudentQuizResultDto(cls.quizResults[quizResultIndex]);
});
