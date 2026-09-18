'use client';
import {Suspense, useEffect} from 'react';
import {useSearchParams} from 'next/navigation';

function Watcher({onChange}: {onChange: (preview: boolean) => void}) {
  const searchParams = useSearchParams();
  const preview = process.env.NEXT_PUBLIC_ENV === 'homolog' && searchParams.get('preview') === '1';
  useEffect(() => {onChange(preview);}, [preview, onChange]);
  return null;
}

/** Isola a leitura da query; o formulário permanece no HTML servido. */
export default function PreviewModeWatcher(props: {onChange: (preview: boolean) => void}) {
  return <Suspense fallback={null}><Watcher {...props}/></Suspense>;
}
