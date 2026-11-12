
const jwt = require('jsonwebtoken');
const MyConstants = require('./MyConstants');

const JwtUtil = {
  genToken(username) {
    return jwt.sign(
      { username },
      MyConstants.JWT_SECRET,
      {
        expiresIn: MyConstants.JWT_EXPIRES
      }
    );
  },

  checkToken(req, res, next) {
    let token =
      req.headers['x-access-token'] ||
      req.headers['authorization'];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Auth token is not supplied'
      });
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    try {
      req.decoded = jwt.verify(
        token,
        MyConstants.JWT_SECRET
      );

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  }
};

module.exports = JwtUtil;
