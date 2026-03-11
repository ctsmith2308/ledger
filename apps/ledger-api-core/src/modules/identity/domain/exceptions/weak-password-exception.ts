class WeakPasswordException extends Error {
  constructor(
    message: string = 'Password does not meet security requirements',
  ) {
    super(message);
    this.name = 'WeakPasswordException';
  }
}

export { WeakPasswordException };
