"use client";
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PenIcon, InfoIcon, Trash2Icon, LoaderCircle } from 'lucide-react';
import { Employee } from '@/lib/types';
import { getAllEmployees, deleteEmployee } from '@/actions/employees.actions';
import AppLayout from '@/layouts/app-layout';
import EmployeesLayout from '@/layouts/employees/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

interface BreadcrumbItem {
  title: string;
  href: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Employees', href: '/employees' },
];

const useEmployeeColumns = (handleDelete: (id: string) => void, isPending: boolean) => {
  return [
    {
      accessorKey: "first_name",
      header: "First Name",
    },
    {
      accessorKey: "last_name",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex gap-2">
            <Link href={`/employees/edit/${employee._id}`}>
              <Button variant="outline" size="sm" disabled={isPending}>
                <PenIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(employee._id)}
              disabled={isPending}
            >
              {isPending ? (
                <LoaderCircle className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2Icon className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        );
      },
    },
  ] as ColumnDef<Employee>[];
};

export default function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchEmployees = async () => {
    try {
      setIsPending(true);
      const fetchedEmployees = await getAllEmployees();
      if (fetchedEmployees) {
        setEmployees(fetchedEmployees);
      } else {
        setAlert({ message: 'Failed to fetch employees', type: 'error' });
      }
    } catch (error) {
      setAlert({ message: `Failed to fetch employees ${error}`, type: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      setIsPending(true);
      const result = await deleteEmployee(id);
      if (result?.success) {
        setAlert({ message: result.success, type: 'success' });
        await fetchEmployees(); // Refresh the list after deletion
      } else if (result?.error) {
        setAlert({ message: result.error, type: 'error' });
      }
    } catch (error) {
      setAlert({ message: `An error occurred while deleting employee ${error}`, type: 'error' });
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const columns = useEmployeeColumns(handleDeleteEmployee, isPending);

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head>
        <title>Employees</title>
      </Head>

      <EmployeesLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Input
              className="w-1/4"
              placeholder="Search all columns..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
            />
            <Link href="/employees/create" passHref>
              <Button variant="secondary">
                Add New Employee
              </Button>
            </Link>
          </div>

          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-4 align-middle">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {isPending ? 'Loading...' : 'No employees found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Alert Component */}
        {alert && (
          <div className="fixed bottom-4 right-4 z-50 animate-in fade-in">
            <Alert
              className={`w-96 shadow-lg ${alert.type === 'success'
                  ? 'bg-green-100 border-green-500'
                  : 'bg-red-100 border-red-500'
                }`}
            >
              <InfoIcon
                className={`h-4 w-4 ${alert.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
              />
              <AlertTitle
                className={`${alert.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
              >
                {alert.type === 'success' ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription
                className={`${alert.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}
              >
                {alert.message}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </EmployeesLayout>
    </AppLayout>
  );
}