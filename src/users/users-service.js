const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  getAllUsers(knex) {
    return knex.select('*').from('gaea_users');
  },

  hasUserWithUserName(db, user_name) {
    return db('gaea_users')
      .where({ user_name })
      .first()
      .then((user) => !!user);
  },

  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('gaea_users')
      .returning('*')
      .then(([user]) => user);
  },

  getById(knex, id) {
    return knex.from('gaea_users').select('*').where('id', id).first();
  },
  getUserId(knex, userName) {
    return knex
      .from('gaea_users')
      .select('id')
      .where('user_name', userName)
      .first();
  },
  deleteUser(knex, id) {
    return knex('gaea_users').where({ id }).delete();
  },

  updateUser(knex, id, newUserFields) {
    return knex('gaea_users').where({ id }).update(newUserFields);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
    };
  },
};

module.exports = UsersService;
