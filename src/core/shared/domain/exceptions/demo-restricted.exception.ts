import { DomainException } from './base.exception';

class DemoRestrictedException extends DomainException {
  constructor() {
    super(
      'This action is not available for demo accounts.',
      'DEMO_RESTRICTED',
    );
  }
}

export { DemoRestrictedException };
