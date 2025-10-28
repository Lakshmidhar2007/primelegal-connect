'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data in the collection.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Array of document data with IDs, or null.
  isLoading: boolean; // True if loading for the first time.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references and provides loading and error states.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemoFirebase to memoize it per React guidence.  Also make sure that its dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore Query to subscribe to. The hook will wait if this is null or undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery: Query<DocumentData> | null | undefined
): UseCollectionResult<T> {
  type StateDataType = WithId<T>[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the query is not ready, reset the state and do nothing.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false); // Not loading because we are not fetching anything.
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: WithId<T>[] = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(result);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Here we know the type of targetRefOrQuery is Query<DocumentData> because of the initial check
        const internalQuery = memoizedTargetRefOrQuery as Query<DocumentData> & {
          _query?: { path: { canonicalString: () => string } };
        };

        // Attempt to extract the path for better error context
        const path = internalQuery._query?.path.canonicalString() ?? 'unknown_path';

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Propagate the contextual error to the global listener
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); // Re-run effect if the memoized query reference changes

  return { data, isLoading, error };
}
