# Authentication

## Account Creation

### Required Fields

1. Username
2. Email Address
3. Password

### Optional Fields

1. Display Name
2. Country
3. Region
4. City

### Username Validation

Username string must satisfy the following requirements:

1. Unique (doesn't exist yet in the database)
2. 4-32 characters
3. Alphabet: A-Z, a-z, 0-9, !@$%^&\*?.-+\_, ...

### Email Address Validation

Email address string must satisfy the following requirements:

1. Unique (doesn't exist yet in the database)
2. Fewer than 128 characters
3. Contains 1 "@"
4. Contains no illegal email address characters

Additionally, email addresses must be verified within `n` days to avoid automatic termination.

### Password Validation

Password string must satisfy the following requirements:

1. 8-256 characters
2. [other character requirements]
3. Entered twice for input validation

## Login

Required Fields:

1. Username
2. Password

## Account Termination

### Causes for Account Termination

1. Email address has not been verified within the required timeframe.
2. User violated terms of use.
3. User requested account termination.

### What Happens on Termination
