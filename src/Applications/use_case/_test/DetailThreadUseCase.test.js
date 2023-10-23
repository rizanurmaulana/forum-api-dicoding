const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should orchestrating detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      thread: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: '2023',
      username: 'dicoding',
      comments: [],
    };

    const createComment = new DetailComment({
      id: 'comment-123',
      username: 'dicoding',
      date: '2023',
      content: 'content',
    });

    const deletedComment = new DetailComment({
      id: 'comment-123',
      username: 'dicoding',
      date: '2023',
      content: '**komentar telah dihapus**',
    });

    const comments = [createComment, deletedComment];

    /** creating dependecy of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest
      .fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest
      .fn(() => Promise.resolve({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        date: '2023',
        username: 'dicoding',
        comments: [],
      }));
    mockCommentRepository.getCommentByThreadId = jest
      .fn(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023',
          thread: 'thread-123',
          content: 'content',
          is_deleted: false,
        },
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023',
          thread: 'thread-123',
          content: '**komentar telah dihapus**',
          is_deleted: true,
        },
      ]));

    /** creating use case instance */
    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.thread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCasePayload.thread);
    expect(detailThread).toEqual({ ...expectedThread, comments });
  });
});
