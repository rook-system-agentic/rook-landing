'use client';
import {useEffect,useId,useState} from 'react';
import {searchMunicipalities,type Municipality} from '@/lib/acquisition.mjs';

export default function CityPicker({value,onChange}:{value:string;onChange:(id:string,label:string)=>void}){
 const id=useId();const [query,setQuery]=useState(value);const [cities,setCities]=useState<Municipality[]>([]);const [open,setOpen]=useState(false);const [active,setActive]=useState(-1);const [failed,setFailed]=useState(false);
 useEffect(()=>setQuery(value),[value]);
 async function load(){setOpen(true);if(cities.length)return;try{const data=await import('@/data/municipalities.json');setCities(data.default);}catch{setFailed(true);}}
 const matches=searchMunicipalities(cities,query);
 function choose(city:Municipality){const label=`${city.name}/${city.uf}`;setQuery(label);onChange(city.id,label);setOpen(false);}
 return <div className="relative" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
  <input id="field-cityId" aria-label="Cidade/UF" role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={active>=0&&matches[active]?`${id}-${active}`:undefined}
   value={query} placeholder="Digite a cidade ou a UF" autoComplete="off" onFocus={load}
   onChange={event=>{setQuery(event.target.value);onChange('',event.target.value);setActive(-1);setOpen(true);}}
   onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);return;}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true);setActive(previous=>Math.max(0,Math.min(matches.length-1,previous+(event.key==='ArrowDown'?1:-1))));}if(event.key==='Enter'&&open&&active>=0&&matches[active]){event.preventDefault();choose(matches[active]);}}}/>
  {open&&<ul id={`${id}-list`} role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg">
   {matches.map((city,index)=><li key={city.id} id={`${id}-${index}`} role="option" aria-selected={active===index}>
    <button type="button" className={`block w-full rounded px-3 py-2 text-left ${active===index?'bg-elevated':''}`} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(city)}>{city.name}/{city.uf}</button>
   </li>)}
   {!matches.length&&<li className="px-3 py-2 text-sm text-muted">{failed?'Não foi possível carregar. Clique no campo para tentar novamente.':query.length<2?'Digite pelo menos duas letras.':cities.length?'Nenhuma cidade encontrada. Confira o nome ou informe a UF.':'Carregando cidades…'}</li>}
  </ul>}
 </div>;
}
