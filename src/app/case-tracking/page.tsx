'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


export default function CaseTrackingPage() {
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title="Case Tracking"
        subtitle="Stay updated on the real-time progress of your legal matters."
      />
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
            <CardDescription>
              A summary of all your submitted cases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[200px]">Date Submitted</TableHead>
                  <TableHead className="w-[180px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                        Case listing is temporarily unavailable.
                    </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
