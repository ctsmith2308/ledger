class InvalidEmailException extends Error {
  constructor(message: string = 'Email does not meet email requirements') {
    super(message);
    this.name = 'InvalidEmailException';
  }
}

export { InvalidEmailException };
