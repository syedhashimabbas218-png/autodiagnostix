import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, composeMessage } from '../src/lib/contact.mjs';

const good = { name: 'Ali Raza', email: 'ali@example.com', phone: '+92 300 1234567', subject: 'quote', message: 'Need two 4-ton lifts in Lahore.' };

test('valid enquiries pass and values are trimmed', () => {
  const { valid, values } = validateContact({ ...good, name: '  Ali Raza  ' });
  assert.ok(valid);
  assert.equal(values.name, 'Ali Raza');
});

test('server-side rules reject what the browser rejects, and unknown subjects', () => {
  const { valid, errors } = validateContact({ name: 'A', email: 'bad@', phone: 'abc', subject: 'spam', message: 'short' });
  assert.equal(valid, false);
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name', 'phone', 'subject']);
  assert.ok(validateContact({ ...good, phone: '' }).valid, 'phone is optional');
  assert.equal(validateContact({ ...good, message: 'x'.repeat(3001) }).valid, false, 'message length is capped');
});

test('composed message is readable and omits an empty phone line', () => {
  const text = composeMessage({ ...good, phone: '' });
  assert.match(text, /^Name: Ali Raza\nEmail: ali@example.com\nSubject: Request a Quote\n\nNeed two/);
  assert.doesNotMatch(text, /Phone:/);
});
