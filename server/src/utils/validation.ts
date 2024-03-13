// Check if an email is valid
export function isValidEmail(value: string): boolean {
  let regexp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  return regexp.test(value);
}

// Check if a password is valid
export function isValidPassword(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }
  if (value.length < 8) {
    return false;
  }
  if (value.length > 128) {
    return false;
  }
  return true;
}

// Check if a user_id is valid
export function isValidUserID(value: number): boolean {
  if (!Number.isInteger(value)) {
    return false;
  }
  if (value < 1) {
    return false;
  }
  if (value > 2147483647) {
    return false;
  }
  return true;
}

// Check if a username is valid
export function isValidUsername(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }
  if (value.length < 3) {
    return false;
  }
  if (value.length > 32) {
    return false;
  }
  if (!value.match(/^[a-z0-9_-]+$/)) {
    return false;
  }
  return true;
}
