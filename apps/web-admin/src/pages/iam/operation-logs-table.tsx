import {
  memo,
  useCallback,
  useState,
  type ChangeEvent,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';
import { LoaderCircle, Search } from 'lucide-react';
import { formatUserDateTime, useAdminT } from '@tetap/hooks';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tetap/ui';
import type { IamOperationLogsData } from '@tetap/schema/iam';

export type OperationLogQueryState = {
  page: number;
  pageSize: number;
  search: string;
  sort: 'asc' | 'desc';
};

type OperationLogsTableProps = {
  isLoading: boolean;
  onQueryChange: Dispatch<SetStateAction<OperationLogQueryState>>;
  operationLogs: IamOperationLogsData | null;
  query: OperationLogQueryState;
  timeZone: string;
};

export const OperationLogsTable = memo(function OperationLogsTable({
  isLoading,
  onQueryChange,
  operationLogs,
  query,
  timeZone,
}: OperationLogsTableProps) {
  const t = useAdminT();
  const logs = operationLogs?.items ?? [];
  const total = operationLogs?.total ?? 0;
  const totalPages = operationLogs?.totalPages ?? 1;
  const submitSearch = useCallback(
    (search: string) => {
      onQueryChange(current => ({ ...current, page: 1, search }));
    },
    [onQueryChange],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('webAdmin.iam.tabs.operationLogs')}</CardTitle>
        <CardDescription>{t('webAdmin.iam.policy.operationLogDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <OperationLogSearchControls
            key={query.search}
            initialSearch={query.search}
            isLoading={isLoading}
            onSearch={submitSearch}
          />
          <OperationLogSortSelect onQueryChange={onQueryChange} sort={query.sort} />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('webAdmin.iam.operationLogs.operator')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.item')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.detail')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.time')}</TableHead>
              <TableHead>{t('webAdmin.iam.operationLogs.ip')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map(log => (
              <TableRow key={log.id}>
                <TableCell>{log.operator}</TableCell>
                <TableCell>{log.operationItem}</TableCell>
                <TableCell className="max-w-sm truncate">{JSON.stringify(log.operationDetail)}</TableCell>
                <TableCell>{formatUserDateTime(log.operationTime, timeZone)}</TableCell>
                <TableCell>{log.operationIp ?? '-'}</TableCell>
              </TableRow>
            ))}
            {!logs.length ? (
              <TableRow>
                <TableCell colSpan={5}>{t('webAdmin.iam.operationLogs.empty')}</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        <OperationLogsPagination
          isLoading={isLoading}
          onQueryChange={onQueryChange}
          page={query.page}
          total={total}
          totalPages={totalPages}
        />
      </CardContent>
    </Card>
  );
});

type OperationLogSearchControlsProps = {
  initialSearch: string;
  isLoading: boolean;
  onSearch: (search: string) => void;
};

const OperationLogSearchControls = memo(function OperationLogSearchControls({
  initialSearch,
  isLoading,
  onSearch,
}: OperationLogSearchControlsProps) {
  const t = useAdminT();
  const [searchDraft, setSearchDraft] = useState(initialSearch);
  const submitSearch = useCallback(() => {
    onSearch(searchDraft);
  }, [onSearch, searchDraft]);
  const changeSearchDraft = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchDraft(event.target.value);
  }, []);
  const submitOnEnter = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        submitSearch();
      }
    },
    [submitSearch],
  );

  return (
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
        <InputGroup className="min-w-0 flex-1">
          <InputGroupInput
            aria-label={t('webAdmin.iam.operationLogs.search')}
            onChange={changeSearchDraft}
            onKeyDown={submitOnEnter}
            placeholder={t('webAdmin.iam.operationLogs.search')}
            value={searchDraft}
          />
          <InputGroupAddon align="inline-start">
            <Search aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>
        <Button className="shrink-0" disabled={isLoading} onClick={submitSearch} type="button">
          {isLoading ? (
            <LoaderCircle className="animate-spin" data-icon="inline-start" />
          ) : (
            <Search data-icon="inline-start" />
          )}
          {t('webAdmin.iam.operationLogs.search')}
        </Button>
      </div>
    </div>
  );
});

type OperationLogSortSelectProps = {
  onQueryChange: Dispatch<SetStateAction<OperationLogQueryState>>;
  sort: OperationLogQueryState['sort'];
};

const OperationLogSortSelect = memo(function OperationLogSortSelect({
  onQueryChange,
  sort,
}: OperationLogSortSelectProps) {
  const t = useAdminT();
  const changeSort = useCallback(
    (value: string) => {
      onQueryChange(current => ({ ...current, page: 1, sort: value === 'asc' ? 'asc' : 'desc' }));
    },
    [onQueryChange],
  );

  return (
    <Select onValueChange={changeSort} value={sort}>
      <SelectTrigger className="w-full md:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="desc">{t('webAdmin.iam.operationLogs.sortDesc')}</SelectItem>
          <SelectItem value="asc">{t('webAdmin.iam.operationLogs.sortAsc')}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
});

type OperationLogsPaginationProps = {
  isLoading: boolean;
  onQueryChange: Dispatch<SetStateAction<OperationLogQueryState>>;
  page: number;
  total: number;
  totalPages: number;
};

const OperationLogsPagination = memo(function OperationLogsPagination({
  isLoading,
  onQueryChange,
  page,
  total,
  totalPages,
}: OperationLogsPaginationProps) {
  const t = useAdminT();
  const goPrevious = useCallback(() => {
    onQueryChange(current => ({ ...current, page: Math.max(1, current.page - 1) }));
  }, [onQueryChange]);
  const goNext = useCallback(() => {
    onQueryChange(current => ({ ...current, page: Math.min(totalPages, current.page + 1) }));
  }, [onQueryChange, totalPages]);

  return (
    <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <span>{t('webAdmin.iam.operationLogs.total', { total })}</span>
      <div className="flex items-center gap-2">
        <Button disabled={isLoading || page <= 1} onClick={goPrevious} size="sm" type="button" variant="outline">
          {isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
          {t('webAdmin.iam.selection.prev')}
        </Button>
        <span>{t('webAdmin.iam.operationLogs.pageInfo', { page, totalPages })}</span>
        <Button disabled={isLoading || page >= totalPages} onClick={goNext} size="sm" type="button" variant="outline">
          {isLoading ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
          {t('webAdmin.iam.selection.next')}
        </Button>
      </div>
    </div>
  );
});
