import type {Metadata} from 'next';
import {siteUrl} from '@/lib/site-origin';
export const metadata:Metadata={alternates: {canonical: siteUrl("/cadastro/")},title:'Conheça o Rook — solicite uma demonstração',description:'Conte sobre seu estabelecimento e conheça a inteligência financeira do Rook.'};
export default function Page(){return <h1 className="sr-only">Solicite uma demonstração do Rook</h1>;}
