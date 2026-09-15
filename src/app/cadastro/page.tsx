import type {Metadata} from 'next';
import {siteUrl} from '@/lib/site-origin';
import ConsultativeExperience from '@/components/acquisition/ConsultativeExperience';
export const metadata:Metadata={alternates: {canonical: siteUrl("/cadastro/")},title:'Conheça o Rook — solicite uma demonstração',description:'Conte sobre seu estabelecimento e conheça a inteligência financeira do Rook.'};
export default function Page(){return <ConsultativeExperience initialMode="form"/>;}
