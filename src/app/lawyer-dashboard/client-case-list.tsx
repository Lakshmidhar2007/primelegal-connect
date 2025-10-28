'use client';

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

function CaseItem({ caseData }: { caseData: any }) {
    const { t } = useTranslation();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (firestore && caseData.userId) {
            return collection(firestore, 'users', caseData.userId);
        }
        return null;
    }, [firestore, caseData.userId]);

    // Although we expect one user, useCollection is simpler if we just take the first result
    const { data: userData, isLoading: isUserLoading } = useCollection(userDocRef);
    const user = !isUserLoading && userData?.[0] ? userData[0] : null;

    if (isUserLoading) {
        return (
            <div className="flex items-center p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        );
    }
    
    return (
        <AccordionItem value={caseData.id}>
            <AccordionTrigger>
                <div className="flex items-center gap-4 text-left">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={(user as any)?.photoURL} />
                        <AvatarFallback>{(user as any)?.firstName?.charAt(0)}{(user as any)?.lastName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-semibold">{caseData.fullName}</p>
                        <p className="text-sm text-muted-foreground">{t(caseData.legalIssueType)}</p>
                    </div>
                    <Badge variant="secondary">{t(caseData.status)}</Badge>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h4>{t('Case Details')}</h4>
                    <p><strong>{t('Submitted on')}:</strong> {format(new Date(caseData.submittedAt), 'PPP p')}</p>
                    <p><strong>{t('Client Email')}:</strong> {caseData.email}</p>
                    <p><strong>{t('Client Phone')}:</strong> {caseData.phone || 'N/A'}</p>
                    <p><strong>{t('Preferred Contact')}:</strong> {t(caseData.contactMethod)}</p>
                    
                    <h4>{t('Issue Description')}</h4>
                    <p>{caseData.description}</p>
                    
                    <h4>{t('Desired Outcome')}</h4>
                    <p>{caseData.desiredOutcome}</p>

                    <h4>{t('Involved Parties')}</h4>
                    <p>{caseData.involvedParties}</p>

                    {caseData.previousStepsTaken === 'yes' && (
                        <>
                           <h4>{t('Previous Steps Taken')}</h4>
                           <p>{caseData.previousStepsDescription}</p>
                        </>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export function ClientCaseList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { t } = useTranslation();

    const casesQuery = useMemoFirebase(() => {
        if (firestore && user) {
            return query(
                collection(firestore, 'cases'),
                where('lawyerId', '==', user.uid),
                orderBy('submittedAt', 'desc')
            );
        }
        return null;
    }, [firestore, user]);

    const { data: cases, isLoading } = useCollection(casesQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Client Cases')}</CardTitle>
                <CardDescription>{t('Review and manage incoming cases from clients.')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {isLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                           <div key={i} className="flex items-center p-4 border-b">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="ml-4 space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : cases && cases.length > 0 ? (
                        cases.map((caseItem) => <CaseItem key={caseItem.id} caseData={caseItem} />)
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            <p>{t('You have no client cases at this time.')}</p>
                        </div>
                    )}
                </Accordion>
            </CardContent>
        </Card>
    );
}
