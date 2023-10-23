const DetailComment = require('../../Domains/comments/entities/DetailComment');

class DetailthreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.thread);

    const thread = await this._threadRepository.getThreadById(useCasePayload.thread);
    const comments = await this._commentRepository.getCommentByThreadId(useCasePayload.thread);

    const detailComments = comments.map((comment) => new DetailComment({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_deleted ? '**komentar telah dihapus**' : comment.content,
    }));

    thread.comments = detailComments;
    return thread;
  }
}

module.exports = DetailthreadUseCase;
