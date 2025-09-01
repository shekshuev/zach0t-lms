export function toReadUserDto(user: UserDocument): ReadUserDto {
  return {
    id: user._id.toString(),
    username: user.username,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    role: user.role as UserRole,
    status: user.status,
    group: user.group || null,
    resetPasswordToken: user.resetPasswordToken,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toReadSubjectDto(subject: SubjectDocument): ReadSubjectDto {
  return {
    id: subject._id.toString(),
    title: subject.title,
    shortTitle: subject.shortTitle,
    description: subject.description,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
  };
}

export function toReadLessonDto(lesson: LessonDocument): ReadLessonDto {
  return {
    id: lesson._id.toString(),
    topic: lesson.topic,
    hours: lesson.hours,
    subjectId: lesson.subjectId.toString(),
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

export function toReadFullLessonDto(lesson: LessonDocument): ReadFullLessonDto {
  return {
    ...toReadLessonDto(lesson),
    content: lesson.content,
    quizzes: lesson.quizzes,
  };
}

export function toReadFullStudentLessonDto(lesson: LessonDocument): ReadFullLessonDto {
  return {
    ...toReadLessonDto(lesson),
    content: lesson.content,
    quizzes: lesson.quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      maxCheatAttempts: quiz.maxCheatAttempts,
      duration: quiz.duration,
      questions: quiz.questions.map(question => ({
        id: question.id,
        type: question.type,
        prompt: question.prompt,
        options: question.options.map(option => ({
          id: option.id,
          text: option.text,
        })),
      })),
    })),
  };
}

export function toReadClassDto(cls: ClassDocument): ReadClassDto {
  return {
    id: cls._id.toString(),
    beginAt: cls.beginAt.toISOString(),
    group: cls.group,
    shortTitle: cls.shortTitle,
    title: cls.title,
    status: cls.status,
    createdAt: cls.createdAt.toISOString(),
    updatedAt: cls.updatedAt.toISOString(),
  };
}

function toReadQuizResultDto(result: QuizResultType): ReadQuizResultDto {
  return {
    quizId: result.quizId,
    userId: result.userId.toString(),
    answers: result.answers.map(answer => ({
      questionId: answer.questionId as string,
      options: answer.options,
      score: answer.score,
    })),
    nextQuestionIndex: result.nextQuestionIndex,
    startedAt: result.startedAt.toISOString(),
    completedAt: result.completedAt?.toISOString() || null,
    deadlineAt: result.deadlineAt?.toISOString() || null,
    status: result.status,
    cheatAttempts: result.cheatAttempts,
  };
}

export function toReadStudentQuizResultDto(result: QuizResultType): ReadStudentQuizResultDto {
  return {
    nextQuestionIndex: result.nextQuestionIndex,
    quizId: result.quizId,
    status: result.status,
    startedAt: result.startedAt.toISOString(),
    deadlineAt: result.deadlineAt?.toISOString() || null,
    completedAt: result.completedAt?.toISOString() || null,
  };
}

export function toReadFullClassDto(cls: ClassDocument): ReadFullClassDto {
  return {
    ...toReadClassDto(cls),
    lesson: toReadFullLessonDto(cls.lesson as LessonDocument),
    quizResults: cls.quizResults.map(toReadQuizResultDto),
  };
}

export function toReadFullStudentClassDto(cls: ClassDocument, userId: string): ReadStudentFullClassDto {
  return {
    ...toReadClassDto(cls),
    lesson: toReadFullStudentLessonDto(cls.lesson as LessonDocument),
    quizResults: cls.quizResults.filter(result => result.userId.toString() === userId).map(toReadStudentQuizResultDto),
  };
}
