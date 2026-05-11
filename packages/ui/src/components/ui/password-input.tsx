import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '../../lib/utils.js';
import { Button } from './button.js';
import { Input } from './input.js';

export type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  hidePasswordLabel: string;
  showPasswordLabel: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, hidePasswordLabel, showPasswordLabel, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const Icon = showPassword ? EyeOff : Eye;

    return (
      <div className={cn('relative', className)}>
        <Input ref={ref} type={showPassword ? 'text' : 'password'} className="pr-10" {...props} />
        <Button
          aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
          onClick={() => setShowPassword(current => !current)}
          size="icon"
          type="button"
          variant="ghost">
          <Icon />
        </Button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
