const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');
const AuthService = require('../auth/auth-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();
const jsonParser = express.json();

const serializeUser = (user) => ({
  id: user.id,
  user_name: xss(user.user_name),
});

usersRouter.post('/users', jsonBodyParser, (req, res, next) => {
  const { password, user_name } = req.body;

  for (const field of ['user_name', 'password'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`,
      });

  const passwordError = UsersService.validatePassword(password);

  if (passwordError) return res.status(400).json({ error: passwordError });

  UsersService.hasUserWithUserName(req.app.get('db'), user_name)
    .then((hasUserWithUserName) => {
      if (hasUserWithUserName)
        return res.status(400).json({ error: `Username already taken` });

      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          user_name,
          password: hashedPassword,
        };
        console.log('New User: ' + newUser.user_name);
        return UsersService.insertUser(req.app.get('db'), newUser).then(
          (user) => {
            console.log(user);
            res.status(201).json(UsersService.serializeUser(user));
          }
        );
      });
    })
    .catch(next);
});

usersRouter.post('/login', jsonBodyParser, (req, res, next) => {
  const { user_name, password } = req.body;
  const loginUser = { user_name, password };

  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });

  AuthService.getUserWithUserName(req.app.get('db'), loginUser.user_name)
    .then((dbUser) => {
      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect user_name or password',
        });

      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then((compareMatch) => {
        if (!compareMatch)
          return res.status(400).json({
            error: 'Incorrect user_name or password',
          });

        const sub = dbUser.user_name;
        const payload = { user_id: dbUser.id };
        res.send({
          authToken: AuthService.createJwt(sub, payload),
        });
      });
    })
    .catch(next);
});

usersRouter.route('/:user_name').get((req, res, next) => {
  UsersService.getUserId(req.app.get('db'), req.params.user_name)
    .then((user) => {
      console.log(user);
      res.json(user);
    })
    .catch((err) => next(err));
});

usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    UsersService.getById(req.app.get('db'), req.params.user_id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` },
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user));
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(req.app.get('db'), req.params.user_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const userToUpdate = { user_name, password };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either  'user_name', 'password''`,
        },
      });

    UsersService.updateUser(req.app.get('db'), req.params.user_id, userToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;
