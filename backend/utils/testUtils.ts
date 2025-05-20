import TestAgent from "supertest/lib/agent";

const login = (
  agent: TestAgent,
  { username, password }: { username: string; password: string },
) =>
  test(`Successfully log in as ${username}`, done => {
    agent
      .post("/account/login")
      .type("form")
      .send({ username, password })
      .expect("Content-Type", /json/)
      .expect(200)
      .expect(res => {
        const message = res.body.message;
        const user = res.body.user;

        expect(message).toEqual("Successfully logged in");
        expect(user.id).toBeDefined();
      })
      .expect("set-cookie", /^connect.sid=/)
      .end(done);
  });

export { login };
