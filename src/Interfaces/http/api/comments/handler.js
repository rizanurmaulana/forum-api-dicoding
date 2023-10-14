const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { threadId } = request.params;
    const { id } = request.auth.credentials;
    const useCasePayload = {
      content: request.payload.content,
      thread: threadId,
      owner: id,
    };

    const addedComment = await addCommentUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id } = request.auth.credentials;
    const useCasePayload = {
      id: commentId,
      thread: threadId,
      owner: id,
    };

    await deleteCommentUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = CommentsHandler;
