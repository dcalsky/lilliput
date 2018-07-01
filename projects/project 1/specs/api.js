const URL = 'http://192.168.123.105:8081';

const INVALID_USER = { email: 'test1', password: 'test' };
const EXISTED_USER = { email: 'test1@mail.com', password: 'testtest' };

describe('User', () => {
  it('should return an object in the response when query an existed user', (done) => {
    request.get(`${URL}/user`).then((response) => {
      expect(response).to.be.an('object');
      done();
    });
  });
  it('should return code 409 when registering an invalid user', (done) => {
    request.post(`${URL}/user`, INVALID_USER).then((resp) => {
      const { code } = resp.data;
      expect(code).to.equal(409);
      done();
    });
  });
  it('should return code 200 when registering an valid user', (done) => {
    request
      .post(`${URL}/user`, { email: `t${new Date().getTime()}@mail.com`, password: 'testtest' })
      .then((resp) => {
        const { code } = resp.data;
        expect(code).to.equal(200);
        done();
      });
  });
  it('should return code 406 when registering an exised user', (done) => {
    request.post(`${URL}/user`, EXISTED_USER).then((resp) => {
      const { code } = resp.data;
      expect(code).to.equal(406);
      done();
    });
  });
  it('should return code 200 when login successfully', (done) => {
    request.post(`${URL}/user/session`, EXISTED_USER).then((resp) => {
      const { code } = resp.data;
      expect(code).to.equal(200);
      done();
    });
  });
  it('should return code 401 when login failed', (done) => {
    const wrongPasswordUser = { email: 'test1@mail.com', password: 'wrongPassword' };
    request.post(`${URL}/user/session`, wrongPasswordUser).then((resp) => {
      const { code } = resp.data;
      expect(code).to.equal(401);
      done();
    });
  });
});
