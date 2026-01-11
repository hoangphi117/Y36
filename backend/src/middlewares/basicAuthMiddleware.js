require('dotenv').config();

const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Board Game API Documentation"');
    return res.status(401).send('<h1>401 - Yêu cầu xác thực để xem tài liệu!</h1>');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  const validUser = process.env.DOCS_USER || 'admin';
  const validPass = process.env.DOCS_PASS || '123456';

  if (user === validUser && pass === validPass) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Board Game API Documentation"');
    return res.status(401).send('<h1>401 - Sai tài khoản hoặc mật khẩu!</h1>');
  }
};

module.exports = basicAuth;