class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { id, thread, owner } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(thread);
    await this._commentRepository.verifyAvailableComment(id);
    await this._commentRepository.verifyCommentOwner(id, owner);
    await this._commentRepository.deleteCommentById(id);
  }
}

module.exports = DeleteCommentUseCase;
