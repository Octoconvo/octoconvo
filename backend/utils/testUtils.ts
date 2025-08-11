import TestAgent from "supertest/lib/agent";
import { ErrorResponse } from "../@types/error";

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

const getValidationErrorMsg = ({
  error,
  field,
}: {
  error?: ErrorResponse;
  field: string;
}) => {
  let msg: null | string = null;

  if (error) {
    const newMsg = error.validationError?.find(
      (obj: { field: string; msg: string; value: string }) =>
        obj.field === field,
    )?.msg;

    if (newMsg) msg = newMsg;
  }

  return msg;
};

export { login, getValidationErrorMsg };
