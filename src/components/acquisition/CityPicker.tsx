'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { searchMunicipalities, type Municipality } from '@/lib/acquisition.mjs';

type CityPickerProps = {
  value: string;
  onChange: (id: string, label: string) => void;
  inputId?: string;
  invalid?: boolean;
  describedBy?: string;
};

export default function CityPicker({ value, onChange, inputId = 'field-cityId', invalid = false, describedBy }: CityPickerProps) {
  const id = useId();
  const [query, setQuery] = useState(value);
  const [cities, setCities] = useState<Municipality[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);
  const list = useRef<HTMLUListElement>(null);
  const matches = searchMunicipalities(cities, query);

  useEffect(() => { setQuery(value); setActive(-1); }, [value]);
  useEffect(() => {
    if (open && active >= 0) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  async function load() {
    setOpen(true);
    if (cities.length || loading.current) return;
    loading.current = true;
    setFailed(false);
    try {
      const data = await import('@/data/municipalities.json');
      setCities(data.default);
    } catch {
      setFailed(true);
    } finally {
      loading.current = false;
    }
  }

  function close() { setOpen(false); setActive(-1); }

  function choose(city: Municipality) {
    const label = `${city.name}/${city.uf}`;
    setQuery(label);
    onChange(city.id, label);
    close();
  }

  return <div className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <input id={inputId} aria-label="Cidade/UF" aria-invalid={invalid || undefined} aria-describedby={describedBy} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-activedescendant={open && active >= 0 && matches[active] ? `${id}-${active}` : undefined}
      value={query} placeholder="Digite a cidade ou a UF" autoComplete="off" maxLength={100} required onFocus={load} onClick={load}
      onChange={event => { setQuery(event.target.value); onChange('', event.target.value); setActive(-1); setOpen(true); }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing) return;
        if (event.key === 'Escape') { if (open) event.preventDefault(); close(); return; }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          setOpen(true);
          setActive(previous => matches.length ? previous < 0
            ? event.key === 'ArrowDown' ? 0 : matches.length - 1
            : Math.max(0, Math.min(matches.length - 1, previous + (event.key === 'ArrowDown' ? 1 : -1))) : -1);
        }
        // Enter escolhe a opção ativa. Sem seleção, não envia o formulário
        // enquanto o visitante ainda está consultando cidades.
        if (event.key === 'Enter' && open) {
          event.preventDefault();
          if (active >= 0 && matches[active]) choose(matches[active]);
        }
      }} />
    {open && <ul ref={list} id={`${id}-list`} role="listbox" aria-label="Sugestões de Cidade/UF" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
      {matches.map((city, index) => <li key={city.id} id={`${id}-${index}`} role="option" aria-selected={active === index}>
        <button type="button" tabIndex={-1} className={`block w-full rounded px-3 py-2 text-left ${active === index ? 'bg-elevated' : ''}`} onMouseDown={event => event.preventDefault()} onClick={() => choose(city)}>{city.name}/{city.uf}</button>
      </li>)}
      {!matches.length && <li role="presentation" className="px-3 py-2 text-sm text-muted">{failed ? 'Não foi possível carregar. Clique no campo para tentar novamente.' : query.length < 2 ? 'Digite pelo menos duas letras.' : cities.length ? 'Nenhuma cidade encontrada. Confira o nome ou informe a UF.' : 'Carregando cidades…'}</li>}
    </ul>}
  </div>;
}
