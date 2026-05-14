import { useCallback, useEffect, useState } from 'react';
import { listUsers } from '../../services/authService';
import { User } from '../../types/auth-type/user';

export default function useUsers() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState('');

  const handlePageChange = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  }, []);

  const updateUsers = useCallback(() => {
    setIsLoading(true);
    listUsers()
      .then(({ status, data }) => {
        setUsers(data);
        setPage(0);
        setStatus(status);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    updateUsers();
  }, []);

  return {
    status,
    allUsers: users,
    page,
    pageSize,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    updateUsers,
  };
}
