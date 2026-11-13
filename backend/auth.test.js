import test from 'node:test';
import assert from 'node:assert/strict';

process.env.SESSION_SECRET = 'test-session-secret';

const auth = await import('./src/server/auth.ts');

test('hashPassword and verifyPassword round-trip', () => {
  const hash = auth.hashPassword('correct horse battery staple');
  assert.equal(typeof hash, 'string');
  assert.match(hash, /^scrypt:/);
  assert.equal(auth.verifyPassword('correct horse battery staple', hash), true);
  assert.equal(auth.verifyPassword('wrong-password', hash), false);
  assert.equal(auth.verifyPassword('correct horse battery staple', 'scrypt:bad:hash'), false);
});

test('createSessionToken and verifySessionToken round-trip', () => {
  const token = auth.createSessionToken('user-123');
  const payload = auth.verifySessionToken(token);
  assert.ok(payload);
  assert.equal(payload.uid, 'user-123');
  assert.equal(typeof payload.exp, 'number');
  assert.equal(auth.verifySessionToken('not-a-token'), null);
  assert.equal(auth.verifySessionToken(undefined), null);
});

test('verifySessionToken rejects expired tokens', () => {
  const originalNow = Date.now;
  Date.now = () => 1_000_000;
  try {
    const token = auth.createSessionToken('user-123');
    Date.now = () => 1_000_000 + 1000 * 60 * 60 * 24 * 8;
    assert.equal(auth.verifySessionToken(token), null);
  } finally {
    Date.now = originalNow;
  }
});

test('isUserAdmin respects role and ADMIN_EMAIL_SHIELD', () => {
  const prev = process.env.ADMIN_EMAIL_SHIELD;
  try {
    delete process.env.ADMIN_EMAIL_SHIELD;
    assert.equal(auth.isUserAdmin({ email: 'a@b.com', role: 'admin' }), true);
    assert.equal(auth.isUserAdmin({ email: 'a@b.com', role: 'priestess' }), true);
    assert.equal(auth.isUserAdmin({ email: 'a@b.com', role: 'user' }), false);
    assert.equal(auth.isUserAdmin(null), false);

    process.env.ADMIN_EMAIL_SHIELD = 'shield@example.com';
    assert.equal(auth.isUserAdmin({ email: 'shield@example.com', role: 'user' }), true);
    assert.equal(auth.isUserAdmin({ email: 'other@example.com', role: 'user' }), false);
  } finally {
    if (prev === undefined) delete process.env.ADMIN_EMAIL_SHIELD;
    else process.env.ADMIN_EMAIL_SHIELD = prev;
  }
});

test('publicUser omits secrets and includes admin flag', () => {
  const prev = process.env.ADMIN_EMAIL_SHIELD;
  try {
    delete process.env.ADMIN_EMAIL_SHIELD;
    const pub = auth.publicUser({
      id: 'u1',
      email: 'u@example.com',
      username: 'user',
      role: 'user',
      password_hash: 'secret',
      created_at: 'now',
    });
    assert.deepEqual(pub, {
      id: 'u1',
      email: 'u@example.com',
      username: 'user',
      role: 'user',
      isAdmin: false,
    });
    assert.equal('password_hash' in pub, false);
  } finally {
    if (prev === undefined) delete process.env.ADMIN_EMAIL_SHIELD;
    else process.env.ADMIN_EMAIL_SHIELD = prev;
  }
});
