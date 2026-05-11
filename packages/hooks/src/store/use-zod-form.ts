import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form';

export type ZodFormSchema<TInput extends FieldValues = FieldValues, TOutput extends FieldValues = TInput> = {
  _def: {
    typeName: string;
  };
  _input: TInput;
  _output: TOutput;
};

export type UseZodFormOptions<TInput extends FieldValues, TOutput extends FieldValues = TInput> = Omit<
  UseFormProps<TInput, unknown, TOutput>,
  'resolver'
>;

export const useZodForm = <TInput extends FieldValues, TOutput extends FieldValues = TInput>(
  schema: ZodFormSchema<TInput, TOutput>,
  options: UseZodFormOptions<TInput, TOutput> = {},
): UseFormReturn<TInput, unknown, TOutput> =>
  useForm<TInput, unknown, TOutput>({
    ...options,
    resolver: zodResolver(schema),
  });
