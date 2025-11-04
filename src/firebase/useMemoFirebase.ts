'use client';
import { useMemo } from 'react';

/**
 * A wrapper around React's `useMemo` hook to stabilize Firestore query/document references.
 * This prevents infinite loops in `useCollection` and `useDoc` hooks by ensuring
 * that the reference object is only recreated when its dependencies change.
 *
 * It is just a re-export of `useMemo` to encourage its use in a specific context.
 */
export const useMemoFirebase = useMemo;
