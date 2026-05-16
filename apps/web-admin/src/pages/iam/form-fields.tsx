import { memo, useCallback, useMemo, useState, type ChangeEvent, type ReactElement } from 'react';
import { Search } from 'lucide-react';
import { useAdminT } from '@tetap/hooks';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tetap/ui';

export type PickerOption = {
  description?: string;
  label: string;
  value: string;
};

export const optionPageSize = 8;

type CheckedState = boolean | 'indeterminate';

type PickerState = {
  page: number;
  query: string;
};

type TextFieldProps = {
  description?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
};

export const TextField = memo(function TextField({
  description,
  label,
  onChange,
  type = 'text',
  value,
}: TextFieldProps) {
  const t = useAdminT();
  const changeTextValue = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange],
  );

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Input onChange={changeTextValue} type={type} value={value} />
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.generic', { label })}</FieldDescription>
    </Field>
  );
});

export type EnumSelectFieldProps<TValue extends string> = {
  description?: string;
  label: string;
  onChange: (value: TValue) => void;
  options: { label: string; value: TValue }[];
  value: TValue;
};

const EnumSelectFieldBase = <TValue extends string>({
  description,
  label,
  onChange,
  options,
  value,
}: EnumSelectFieldProps<TValue>): ReactElement => {
  const t = useAdminT();
  const handleValueChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue as TValue);
    },
    [onChange],
  );

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select onValueChange={handleValueChange} value={value}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.select', { label })}</FieldDescription>
    </Field>
  );
};

export const EnumSelectField = memo(EnumSelectFieldBase) as typeof EnumSelectFieldBase;

type SearchableSelectFieldProps = {
  description?: string;
  label: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  value: string;
};

const SearchableOptionButton = memo(function SearchableOptionButton({
  onSelect,
  option,
}: {
  onSelect: (value: string) => void;
  option: PickerOption;
}) {
  const handleSelect = useCallback(() => {
    onSelect(option.value);
  }, [onSelect, option.value]);

  return (
    <button
      className="hover:bg-accent flex w-full flex-col gap-1 px-3 py-2 text-left text-sm"
      onClick={handleSelect}
      type="button">
      <span className="font-medium">{option.label}</span>
      {option.description ? <span className="text-muted-foreground text-xs">{option.description}</span> : null}
    </button>
  );
});

export const SearchableSelectField = memo(function SearchableSelectField({
  description,
  label,
  onChange,
  options,
  value,
}: SearchableSelectFieldProps) {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [pickerState, setPickerState] = useState<PickerState>({ page: 0, query: '' });
  const { query } = pickerState;
  const selected = useMemo(() => options.find(option => option.value === value), [options, value]);
  const filteredOptions = useMemo(() => filterOptions(options, query), [options, query]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredOptions.length / optionPageSize)), [filteredOptions]);
  const page = Math.min(pickerState.page, pageCount - 1);
  const pageItems = useMemo(
    () => filteredOptions.slice(page * optionPageSize, (page + 1) * optionPageSize),
    [filteredOptions, page],
  );
  const openPicker = useCallback(() => {
    setOpen(true);
  }, []);
  const selectOption = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      setOpen(false);
    },
    [onChange],
  );
  const changeQuery = useCallback((nextQuery: string) => {
    setPickerState({ page: 0, query: nextQuery });
  }, []);
  const goPrevious = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.max(0, current.page - 1) }));
  }, []);
  const goNext = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.min(pageCount - 1, current.page + 1) }));
  }, [pageCount]);

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Button className="w-full min-w-0 justify-between" onClick={openPicker} type="button" variant="outline">
        <span className="truncate">{selected?.label ?? t('webAdmin.iam.selection.placeholder')}</span>
        <Search />
      </Button>
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.searchableSelect', { label })}</FieldDescription>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.selection.description')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField label={t('webAdmin.iam.selection.search')} onChange={changeQuery} value={query} />
            <div className="max-h-72 overflow-y-auto rounded-md border">
              {pageItems.length ? (
                pageItems.map(option => (
                  <SearchableOptionButton key={option.value} onSelect={selectOption} option={option} />
                ))
              ) : (
                <p className="text-muted-foreground p-3 text-sm">{t('webAdmin.iam.selection.empty')}</p>
              )}
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button disabled={page === 0} onClick={goPrevious} type="button" variant="outline">
              {t('webAdmin.iam.selection.prev')}
            </Button>
            <Button disabled={page + 1 >= pageCount} onClick={goNext} type="button" variant="outline">
              {t('webAdmin.iam.selection.next')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field>
  );
});

type MultiSearchSelectFieldProps = {
  description?: string;
  label: string;
  onChange: (values: string[]) => void;
  options: PickerOption[];
  values: string[];
};

const MultiSearchOptionItem = memo(function MultiSearchOptionItem({
  checked,
  onToggle,
  option,
}: {
  checked: boolean;
  onToggle: (value: string, checked: CheckedState) => void;
  option: PickerOption;
}) {
  const handleCheckedChange = useCallback(
    (nextChecked: CheckedState) => {
      onToggle(option.value, nextChecked);
    },
    [onToggle, option.value],
  );

  return (
    <label className="hover:bg-accent flex items-start gap-3 px-3 py-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={handleCheckedChange} />
      <span className="flex flex-col gap-1">
        <span className="font-medium">{option.label}</span>
        {option.description ? <span className="text-muted-foreground text-xs">{option.description}</span> : null}
      </span>
    </label>
  );
});

export const MultiSearchSelectField = memo(function MultiSearchSelectField({
  description,
  label,
  onChange,
  options,
  values,
}: MultiSearchSelectFieldProps) {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const [pickerState, setPickerState] = useState<PickerState>({ page: 0, query: '' });
  const { query } = pickerState;
  const selected = useMemo(() => new Set(values), [values]);
  const selectedLabels = useMemo(
    () => options.flatMap(option => (selected.has(option.value) ? [option.label] : [])),
    [options, selected],
  );
  const filteredOptions = useMemo(() => filterOptions(options, query), [options, query]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil(filteredOptions.length / optionPageSize)), [filteredOptions]);
  const page = Math.min(pickerState.page, pageCount - 1);
  const pageItems = useMemo(
    () => filteredOptions.slice(page * optionPageSize, (page + 1) * optionPageSize),
    [filteredOptions, page],
  );
  const openPicker = useCallback(() => {
    setOpen(true);
  }, []);
  const closePicker = useCallback(() => {
    setOpen(false);
  }, []);
  const changeQuery = useCallback((nextQuery: string) => {
    setPickerState({ page: 0, query: nextQuery });
  }, []);
  const goPrevious = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.max(0, current.page - 1) }));
  }, []);
  const goNext = useCallback(() => {
    setPickerState(current => ({ ...current, page: Math.min(pageCount - 1, current.page + 1) }));
  }, [pageCount]);
  const toggleOption = useCallback(
    (nextValue: string, checked: CheckedState) => {
      onChange(checked === true ? toUniqueStrings([...values, nextValue]) : values.filter(item => item !== nextValue));
    },
    [onChange, values],
  );

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Button className="w-full min-w-0 justify-between" onClick={openPicker} type="button" variant="outline">
        <span className="truncate">
          {selectedLabels.length ? selectedLabels.join(', ') : t('webAdmin.iam.selection.placeholder')}
        </span>
        <Search />
      </Button>
      <FieldDescription>{description ?? t('webAdmin.iam.fieldHints.multiSelect', { label })}</FieldDescription>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{t('webAdmin.iam.selection.description')}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <TextField label={t('webAdmin.iam.selection.search')} onChange={changeQuery} value={query} />
            <div className="max-h-72 overflow-y-auto rounded-md border">
              {pageItems.length ? (
                pageItems.map(option => (
                  <MultiSearchOptionItem
                    checked={selected.has(option.value)}
                    key={option.value}
                    onToggle={toggleOption}
                    option={option}
                  />
                ))
              ) : (
                <p className="text-muted-foreground p-3 text-sm">{t('webAdmin.iam.selection.empty')}</p>
              )}
            </div>
          </FieldGroup>
          <DialogFooter>
            <Button disabled={page === 0} onClick={goPrevious} type="button" variant="outline">
              {t('webAdmin.iam.selection.prev')}
            </Button>
            <Button disabled={page + 1 >= pageCount} onClick={goNext} type="button" variant="outline">
              {t('webAdmin.iam.selection.next')}
            </Button>
            <Button onClick={closePicker} type="button">
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field>
  );
});

const filterOptions = (options: PickerOption[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  return normalizedQuery
    ? options.filter(
        option =>
          option.label.toLowerCase().includes(normalizedQuery) ||
          option.value.toLowerCase().includes(normalizedQuery) ||
          option.description?.toLowerCase().includes(normalizedQuery),
      )
    : options;
};

const toUniqueStrings = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
