import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateUsernameSuggestions,
  getPasswordStrength,
  isValidEmail,
  isValidIranMobile,
  isValidNationalId,
  isValidOtpCode,
  isValidUsername,
  normalizeEmail,
  normalizeOtpCode,
  normalizeUsername,
  RESERVED_USERNAMES,
  validateAddressForm,
  validateProfileForm,
  validateSignupForm,
  validateUsername,
} from './authLogic';

test('normalizeEmail and isValidEmail handle whitespace, casing, and Persian digits', () => {
  assert.equal(normalizeEmail('  Amir.Test@Gmail.COM  '), 'amir.test@gmail.com');
  assert.equal(normalizeEmail('user۱۲@example.ir'), 'user12@example.ir');
  assert.equal(isValidEmail('amir@amirmobile.ir'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidEmail('user@domain'), false);
});

test('normalizeOtpCode and isValidOtpCode accept Persian/Arabic digits and spaces', () => {
  assert.equal(normalizeOtpCode('۴۸۲ - ۹۱۳'), '482913');
  assert.equal(isValidOtpCode('۴۸۲۹۱۳'), true);
  assert.equal(isValidOtpCode('482913'), true);
  assert.equal(isValidOtpCode('12345'), false);
  assert.equal(isValidOtpCode('abcdef'), false);
});

test('getPasswordStrength evaluates rules accurately', () => {
  const weak = getPasswordStrength('1234');
  assert.equal(weak.valid, false);
  assert.equal(weak.score, 1);

  const medium = getPasswordStrength('amir1234');
  assert.equal(medium.valid, true);
  assert.equal(medium.score, 3);

  const strong = getPasswordStrength('Amir@1234');
  assert.equal(strong.valid, true);
  assert.equal(strong.score, 4);
});

test('isValidIranMobile and isValidNationalId validate Iranian formats', () => {
  assert.equal(isValidIranMobile('۰۹۱۲۳۴۵۶۷۸۹'), true);
  assert.equal(isValidIranMobile('09123456789'), true);
  assert.equal(isValidIranMobile('02188889999'), false);

  // Known valid Iranian National ID checksum: 0499370899
  assert.equal(isValidNationalId('0499370899'), true);
  assert.equal(isValidNationalId('1111111111'), false);
  assert.equal(isValidNationalId('1234567890'), false);
});

test('validateSignupForm catches invalid fields and passes valid input', () => {
  const invalid = validateSignupForm({
    fullName: 'ام',
    email: 'bad',
    phone: '123',
    password: '123',
    confirmPassword: '456',
  });
  assert.ok(invalid.fullName);
  assert.ok(invalid.email);
  assert.ok(invalid.phone);
  assert.ok(invalid.password);
  assert.ok(invalid.confirmPassword);

  const valid = validateSignupForm({
    fullName: 'امیرمحمد سلیمی',
    email: 'amir@example.ir',
    phone: '09123456789',
    password: 'AmirMobile2026',
    confirmPassword: 'AmirMobile2026',
  });
  assert.deepEqual(valid, {});
});

test('validateProfileForm and validateAddressForm enforce required constraints', () => {
  const badProfile = validateProfileForm({
    fullName: 'ا',
    phone: '999',
    nationalId: '1111111111',
  });
  assert.ok(badProfile.fullName);
  assert.ok(badProfile.phone);
  assert.ok(badProfile.nationalId);

  const badAddress = validateAddressForm({
    label: '',
    receiverName: 'ا',
    phone: '123',
    city: '',
    address: 'کوتاه',
    postalCode: '123',
  });
  assert.ok(badAddress.label);
  assert.ok(badAddress.receiverName);
  assert.ok(badAddress.phone);
  assert.ok(badAddress.city);
  assert.ok(badAddress.address);
  assert.ok(badAddress.postalCode);

  const goodAddress = validateAddressForm({
    label: 'منزل',
    receiverName: 'امیرمحمد سلیمی',
    phone: '۰۹۱۲۳۴۵۶۷۸۹',
    city: 'تهران',
    address: 'زعفرانیه، خیابان مقدس اردبیلی، پلاک ۸۴، واحد ۱۲',
    postalCode: '۱۹۸۸۲۳۳۱۴۵',
  });
  assert.deepEqual(goodAddress, {});
});

test('username normalization, validation, reserved names, and suggestion generator', () => {
  assert.equal(normalizeUsername('  @Amir.Mobile۱۲  '), 'amir.mobile12');
  assert.equal(isValidUsername('amir_mobile.98'), true);
  assert.equal(isValidUsername('ab'), false);
  assert.equal(isValidUsername('1amir'), false);
  assert.equal(isValidUsername('amir..mobile'), false);
  assert.equal(isValidUsername('amir_'), false);
  assert.equal(validateUsername('admin').valid, false);
  assert.ok(RESERVED_USERNAMES.has('admin'));
  assert.ok(RESERVED_USERNAMES.has('support'));

  const suggestions = generateUsernameSuggestions('Amir.K@example.ir');
  assert.ok(suggestions.length >= 2);
  for (const sug of suggestions) {
    assert.equal(isValidUsername(sug), true);
  }

  const badSignup = validateSignupForm({
    fullName: 'امیرمحمد سلیمی',
    username: '1bad',
    email: 'amir@example.ir',
    phone: '09123456789',
    password: 'AmirMobile2026',
    confirmPassword: 'AmirMobile2026',
  });
  assert.ok(badSignup.username);

  const badProf = validateProfileForm({
    fullName: 'امیرمحمد سلیمی',
    phone: '09123456789',
    username: 'root',
  });
  assert.ok(badProf.username);
});
