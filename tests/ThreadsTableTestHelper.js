/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');
const NotFoundError = require('../src/Commons/exceptions/NotFoundError');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123', title = 'title', body = 'body', owner = 'user-123', date = '2023',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
