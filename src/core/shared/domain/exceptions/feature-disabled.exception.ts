import { DomainException } from './base.exception';

class FeatureDisabledException extends DomainException {
  constructor() {
    super(
      'This feature is not available for your account tier.',
      'FEATURE_DISABLED',
    );
  }
}

export { FeatureDisabledException };
