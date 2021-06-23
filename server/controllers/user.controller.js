class UserController {
  getUserByEmail = (req, res, next) => {
    res.send(200);
  };
}

const controller = new UserController();
export default controller;
