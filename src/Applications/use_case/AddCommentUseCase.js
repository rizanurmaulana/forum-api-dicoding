const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.thread);
    const newComment = new AddComment(useCasePayload);

    return this._commentRepository.addComment(newComment);
  }
}

module.exports = AddCommentUseCase;
