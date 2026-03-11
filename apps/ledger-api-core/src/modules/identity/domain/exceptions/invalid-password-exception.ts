class InvalidPasswordException extends Error {
  constructor(
    message: string = 'Password does not meet security requirements',
  ) {
    super(message);
    this.name = 'InvalidPasswordException';
  }
}

export { InvalidPasswordException };
