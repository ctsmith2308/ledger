'use client';

import { useState } from 'react';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { useFeatureFlags } from '@/app/_entities/identity/hooks';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Spinner,
} from '@/app/_components';

import { useConfigureMfa, MFA_PROGRESS } from '../hooks/use-configure-mfa.hook';

import { type MfaSettingsCardProps } from './types';

function MfaSettingsCard({ mfaEnabled }: MfaSettingsCardProps) {
  const { isDisabled } = useFeatureFlags();
  const mfaDisabled = isDisabled(FEATURE_KEYS.MFA);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>

        <CardDescription>
          {mfaEnabled
            ? 'Your account is protected with two-factor authentication.'
            : 'Add an extra layer of security to your account. Compatible with Google Authenticator, Authy, 1Password, Bitwarden, Microsoft Authenticator, and 2FAS.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {mfaEnabled ? (
          <DisableMfaSection disabled={mfaDisabled} />
        ) : (
          <EnableMfaSection disabled={mfaDisabled} />
        )}
      </CardContent>
    </Card>
  );
}

function EnableMfaSection({ disabled }: { disabled: boolean }) {
  const {
    mfaProgress,
    qrCodeDataUrl,
    enableMfa,
    isEnabling,
    isVerifying,
    form,
    formId,
    reset,
  } = useConfigureMfa();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) reset();
  };

  const handleEnable = () => {
    enableMfa();
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.handleSubmit();
  };

  const handleDone = () => {
    handleOpenChange(false);
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            onClick={handleEnable}
          />
        }
      >
        Enable
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up two-factor authentication</DialogTitle>

          <DialogDescription>
            Scan the QR code with your authenticator app, then enter the 6-digit
            code to confirm.
          </DialogDescription>
        </DialogHeader>

        {isEnabling && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {mfaProgress === MFA_PROGRESS.SHOWING_QR && qrCodeDataUrl && (
          <>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URL, not optimizable by next/image */}
              <img src={qrCodeDataUrl} alt="MFA QR code" className="size-48" />
            </div>

            <form id={formId} onSubmit={handleSubmit}>
              <FieldGroup>
                <form.Field name="totpCode">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Authentication code
                      </FieldLabel>

                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoComplete="one-time-code"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="000000"
                      />
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button type="submit" form={formId} disabled={isVerifying}>
                {isVerifying && <Spinner />}
                Verify and enable
              </Button>
            </DialogFooter>
          </>
        )}

        {mfaProgress === MFA_PROGRESS.SUCCESS && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication has been enabled.
            </p>

            <Button variant="outline" onClick={handleDone}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DisableMfaSection({ disabled }: { disabled: boolean }) {
  const { disableMfa, isDisabling } = useConfigureMfa();

  const handleDisable = () => disableMfa();

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="destructive" disabled={disabled} />}
      >
        Disable
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication?</DialogTitle>

          <DialogDescription>
            This will remove the extra layer of security from your account.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="destructive"
            disabled={isDisabling}
            onClick={handleDisable}
          >
            {isDisabling && <Spinner />}
            Disable MFA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { MfaSettingsCard };
