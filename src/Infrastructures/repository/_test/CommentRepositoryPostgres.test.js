const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      const newComment = new AddComment({
        content: 'content',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      const newComment = new AddComment({
        content: 'content',
        thread: 'thread-123',
        owner: 'user-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: newComment.content,
        owner: newComment.owner,
      }));
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should throw error when comment not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const id = 'fakeCommentId';

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableComment(id))
        .rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when comment available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread: 'thread-123',
        content: 'content',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableComment('comment-123'));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError if the comment is accessed by the wrong owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread: 'thread-123',
        content: 'content',
      });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'fakeOwnerId'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError if the comment is accessed by its owner', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread: 'thread-123',
        content: 'content',
      });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123'))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return comment by thread id correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      const currentDate = new Date().toISOString();

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread: 'thread-123',
        content: 'content',
        date: currentDate,
      });

      // Action
      const comments = await commentRepositoryPostgres.getCommentByThreadId('thread-123');

      // Assert
      expect(comments).toHaveLength(1);
      expect(comments[0].id).toEqual('comment-123');
      expect(comments[0].content).toEqual('content');
      expect(comments[0].date).toEqual(currentDate);
      expect(comments[0].username).toEqual('dicoding');
      expect(comments[0].is_deleted).toEqual(false);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment correctly', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
        password: 'secret',
      });

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        thread: 'thread-123',
        content: 'content',
      });

      // Action
      await commentRepositoryPostgres.deleteCommentById('comment-123');

      // Assert
      const isDeleted = await CommentsTableTestHelper.isCommentDeleted('comment-123');
      expect(isDeleted).toBe(true);
    });
  });
});
