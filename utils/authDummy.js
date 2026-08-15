import { request } from '@playwright/test';

let token;

export async function generateToken() {
  const apiContext = await request.newContext();

  const response = await apiContext.post('/login', {
    data: {
      username: 'testuser',
      password: 'password'
    }
  });

  const responseBody = await response.json();

  token = responseBody.token;

  await apiContext.dispose();
}

export function getToken() {
  return token;
}

