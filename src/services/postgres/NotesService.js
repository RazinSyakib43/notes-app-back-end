const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModel } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
 
class NotesService {
  constructor() {
    this._pool = new Pool();
  }
 
  // fungsi addNote dan parameter 
  async addNote({ title, body, tags }) {
    const id = nanoid(16);
    // waktu catatan dibuat
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
 
    // query untuk memasukan notes baru ke database
    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt],
    };
 
    // mengeksekusi query yang sudah dibuat
    const result = await this._pool.query(query);
 
    if (!result.rows[0].id) {
        throw new InvariantError('Catatan gagal ditambahkan');
    }
 
    // memastikan notes berhasil dimasukan ke database
    // Jika nilai id tidak undefined, itu berarti catatan berhasil dimasukan dan kembalikan fungsi dengan nilai id. Jika tidak maka throw InvariantError.
    return result.rows[0].id;
  }

  // fungsi getNotes tanpa parameter
  async getNotes() {
    // query untuk mengambil semua data notes dari database dengan query SELECT * FROM notes
    const result = await this._pool.query('SELECT * FROM notes');
    // mengembalikan data notes yang sudah di mapping
    return result.rows.map(mapDBToModel);
  }

  // fungsi deleteNote dengan parameter id
  async getNoteById(id) {
    // query untuk mengambil data notes dari database berdasarkan id
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
 
    // jika data notes tidak ditemukan, maka throw NotFoundError
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
 
    return result.rows.map(mapDBToModel)[0];
  }

  // fungsi editNoteById dengan parameter id dan objek yang berisi title, body, dan tags
  async editNoteById(id, { title, body, tags }) {
    // waktu terakhir kali notes diedit
    const updatedAt = new Date().toISOString();
    // query untuk mengupdate notes berdasarkan id
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  // fungsi deleteNoteById dengan parameter id
  async deleteNoteById(id) {
    // query untuk menghapus notes berdasarkan id
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    };
 
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = NotesService;