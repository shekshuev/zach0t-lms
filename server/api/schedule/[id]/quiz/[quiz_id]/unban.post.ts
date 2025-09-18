import { UnbanQuizResultDto } from "~~/shared/types/class";

export default defineEventHandler(async event => {
  await requireTeacherSession(event);
  const classId = getRouterParam(event, "id");
  const quizId = getRouterParam(event, "quiz_id");
  const body = await readBody<UnbanQuizResultDto>(event);
  const now = new Date();
  const parsed = unbanQuizResultSchema.safeParse(body);
  if (!parsed.success || !classId || !quizId) {
    throw createError({ statusCode: 422, message: "unprocessable_entity" });
  }
  const userId = parsed.data.userId;

  const cls = await Class.findById(classId);
  if (!cls) {
    throw createError({ statusCode: 404, message: "class_not_found" });
  }

  const quiz = cls.lesson.quizzes.find(q => q.id === quizId);
  if (!quiz) {
    throw createError({ statusCode: 404, message: "quiz_not_found" });
  }

  let quizResultIndex = cls.quizResults.findIndex(
    result => result.quizId === quizId && result.userId.toString() === userId,
  );
  if (quizResultIndex === -1) {
    throw createError({ statusCode: 404, message: "quiz_not_found" });
  }
  cls.quizResults[quizResultIndex].cheatAttempts = 0;
  cls.quizResults[quizResultIndex].status = "started";
  if (quiz.duration && quiz.duration > 0) {
    const buffer = 3000;
    const timeMillisecondsSpent =
      cls.quizResults[quizResultIndex].bannedAt!.getTime() - cls.quizResults[quizResultIndex].startedAt.getTime();
    cls.quizResults[quizResultIndex].deadlineAt = new Date(
      now.getTime() + (quiz.duration * 1000 - timeMillisecondsSpent + buffer),
    );
    cls.quizResults[quizResultIndex].bannedAt = null;
  }

  cls.updatedAt = now;

  await cls.save();

  setResponseStatus(event, 204);
});
