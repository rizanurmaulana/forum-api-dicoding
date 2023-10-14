const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DetailthreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id } = request.auth.credentials;

    const useCasePayload = {
      title: request.payload.title,
      body: request.payload.body,
      owner: id,
    };

    const addedThread = await addThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const detailThreadUseCase = this._container.getInstance(DetailthreadUseCase.name);
    const { threadId } = request.params;
    const useCasePayload = {
      thread: threadId,
    };

    const thread = await detailThreadUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
