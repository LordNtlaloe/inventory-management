import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PenIcon, InfoIcon, Trash2Icon } from 'lucide-react';
import { User } from '@/lib/types';
import { getAllUsers, deleteUser } from '@/actions/user.actions';
import AppLayout from '@/layouts/app-layout';
import UsersLayout from '@/layouts/users/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BreadcrumbItem {
  title: string;
  href: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Users', href: '/users' },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await getAllUsers();
      if (fetchedUsers) {
        setUsers(fetchedUsers);
        setUserCount(fetchedUsers.length);
      } else {
        setAlert({ message: 'Failed to fetch users', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: `Failed to fetch users ${error}`, type: 'error' });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      const result = await deleteUser(id);
      if (result?.success) {
        setAlert({ message: `${result.success}`, type: 'success' });
        setUserCount(prev => prev - 1);
        fetchUsers();
      } else if (result?.error) {
        setAlert({ message: result.error, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: `An error occurred while deleting user ${error}`, type: 'error' });
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head>
        <title>Users</title>
      </Head>

      <UsersLayout>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Input className="w-1/4" placeholder="Search" />
            <Link href="/users/create" passHref>
              <Button variant="secondary">Add New User</Button>
            </Link>
          </div>

          <Table className="border px-5 rounded-md">
            <TableCaption>A list of all users.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number || '-'}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/users/edit/${user._id}`} passHref>
                        <Button variant="outline">
                          <PenIcon className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <Trash2Icon className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>Total Users</TableCell>
                <TableCell className="text-right">{userCount}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {alert && (
          <Alert 
            className={`z-50 h-15 w-96 fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
              alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            <InfoIcon className="h-4 w-4" />
            <AlertTitle className="pb-2">
              {alert.type === 'success' ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription className="text-white pb-4">
              {alert.message}
            </AlertDescription>
          </Alert>
        )}
      </UsersLayout>
    </AppLayout>
  );
}