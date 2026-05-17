'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'lucide-react';

import { cn } from '../../lib/utils.js';

type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> & {
  ref?: React.Ref<React.ElementRef<typeof OTPInput>>;
};

type InputOTPGroupProps = React.ComponentPropsWithoutRef<'div'> & {
  ref?: React.Ref<React.ElementRef<'div'>>;
};

type InputOTPSlotProps = React.ComponentPropsWithoutRef<'div'> & {
  index: number;
  ref?: React.Ref<React.ElementRef<'div'>>;
};

type InputOTPSeparatorProps = React.ComponentPropsWithoutRef<'div'> & {
  ref?: React.Ref<React.ElementRef<'div'>>;
};

const InputOTP = React.memo(function InputOTP({ className, containerClassName, ref, ...props }: InputOTPProps) {
  return (
    <OTPInput
      ref={ref}
      containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
});
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.memo(function InputOTPGroup({ className, ref, ...props }: InputOTPGroupProps) {
  return <div ref={ref} className={cn('flex items-center', className)} {...props} />;
});
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.memo(function InputOTPSlot({ index, className, ref, ...props }: InputOTPSlotProps) {
  const inputOTPContext = React.use(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex size-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-1 ring-ring',
        className,
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.memo(function InputOTPSeparator({ ref, ...props }: InputOTPSeparatorProps) {
  return (
    <div ref={ref} role="separator" {...props}>
      <Minus />
    </div>
  );
});
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
