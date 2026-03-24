'use client';
import { useEffect, useRef, useState } from 'react'
import OndeSearch from './OndeSearch'
import EventoDropdown from './EventoDropdown'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MM = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'] 
const fd = (d: Date) => `${d.getDate()} ${MM[d.getMonth()]}` 

export default function SearchBar() { // Inicio do Corpo do SearchBar, onde estão as funções e o JSX que compõem a barra de pesquisa na página inicial
  const router = useRouter() // hook do Next.js para navegação programática entre páginas
  const [ondeSelected, setOndeSelected] = useState<any>(null) // estado para armazenar o local selecionado na busca, pode ser um estado, cidade, bairro ou propriedade específica
  const [dataDisplay, setDataDisplay] = useState('Adicionar datas') // estado para exibir as datas selecionadas pelo usuário, inicialmente é "Adicionar datas" e é atualizado quando o usuário seleciona um período no calendário
  const [guests, setGuests] = useState(1) // estado para armazenar a quantidade de convidados, inicialmente é 1 e pode ser incrementado ou decrementado pelo usuário usando os botões de "+" e "−" na interface da barra de pesquisa
  const [eventoValue, setEventoValue] = useState('') // estado para armazenar o tipo de evento selecionado pelo usuário, inicialmente é uma string vazia e é atualizado quando o usuário seleciona um tipo de evento no dropdown de tipos de eventos
  const pickerRef = useRef<any>(null) // referência para o componente de calendário (flatpickr), usada para abrir o calendário quando o usuário clica na seção "Quando?" da barra de pesquisa e para acessar as funções do flatpickr, como abrir ou fechar o calendário programaticamente
  const inputRef = useRef<HTMLInputElement>(null) // referência para o input oculto que é usado pelo flatpickr para anexar o calendário, embora o input esteja oculto na interface do usuário, ele é necessário para o funcionamento do flatpickr, e a referência é usada para inicializar o flatpickr e para acessar o valor selecionado pelo usuário no calendário

  useEffect(() => {  // useEffect para inicializar o flatpickr quando o componente é montado, configurando-o para selecionar um intervalo de datas, desabilitar datas passadas, exibir dois meses no calendário e usar a localização em português
    let fp: any 
    const load = async () => { 
      const flatpickr = (await import('flatpickr')).default 
      await import('flatpickr/dist/l10n/pt.js')
      if (!inputRef.current) return
      fp = flatpickr(inputRef.current, {
        mode: 'range', 
        minDate: 'today', 
        dateFormat: 'Y-m-d', 
        locale: 'pt' as any, 
        showMonths: 2,
        disableMobile: true, 
        onChange(ds: Date[]) {
          if (!ds.length) { setDataDisplay('Adicionar datas') } 
          else if (ds.length === 1) { setDataDisplay(`${fd(ds[0])} → ...`) }
          else {
            const a = fd(ds[0]), b = fd(ds[1])
            setDataDisplay(a === b ? a : `${a} → ${b}`)
          }
        }
      })
      pickerRef.current = fp
    }
    load()
    return () => { fp?.destroy() } 
  }, [])

  const canSearch = !!ondeSelected // variável booleana que indica se a busca pode ser realizada, ou seja, se o usuário selecionou um local (estado, cidade, bairro ou propriedade específica) para a busca. A busca só pode ser realizada se houver um local selecionado, independentemente de outros critérios como datas, tipo de evento ou número de convidados. Se ondeSelected for null ou undefined, canSearch será false e o botão de busca ficará desabilitado, impedindo que o usuário realize uma busca sem selecionar um local primeiro.

  const handleSearch = async () => { 
    if (!ondeSelected) return 

    // Se selecionou um espaço específico (por nome), vai direto para a página da propriedade
    if (ondeSelected.nome === 'nome' && ondeSelected.id) { 
      router.push(`/propriedade/${ondeSelected.id}`)
      return
    }

    const params = new URLSearchParams() 
    if (ondeSelected.estado) params.set('estado', ondeSelected.estado)
    if (ondeSelected.cidade) params.set('cidade', ondeSelected.cidade)
    if (ondeSelected.bairro) params.set('bairro', ondeSelected.bairro)
    if (eventoValue) params.set('evento', eventoValue)
    if (dataDisplay && dataDisplay !== 'Adicionar datas') params.set('data', dataDisplay)

    // Registrar buscas
    if (eventoValue) {
      eventoValue.split(',').forEach(async (t) => { 
        try { await supabase.from('buscas').insert({ tipo_evento: t.trim() }) } catch (_) {}
      })
    }

    router.push(`/busca?${params.toString()}`) 
  }

  return ( 
    <div className="search-container">
      <div className="search-bar">
        {/* ONDE */}
        <OndeSearch onSelect={setOndeSelected} />

        <div className="divider" />

        {/* QUANDO */}
        <div className="search-item" onClick={() => pickerRef.current?.open()}>
          <label>Quando?</label>
          <span className="range-display">{dataDisplay}</span>
          <input ref={inputRef} id="input-periodo" style={{ display: 'none' }} readOnly />
        </div>

        <div className="divider" />

        {/* TIPO DE EVENTO */}
        <div className="search-item" id="tipo-container" style={{ position: 'relative' }}>
          <label>Tipo de Evento</label>
          <EventoDropdown onChange={setEventoValue} />
        </div>

        <div className="divider" />

        {/* CONVIDADOS */}
        <div className="search-item guest-direct-selector">
          <label>Convidados</label>
          <div className="stepper-control">
            <button className="btn-step" onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
            <span className="qtd-display">{guests}</span>
            <button className="btn-step" onClick={() => setGuests(g => g + 1)}>+</button>
          </div>
        </div>

        <button
          className="btn-search"
          disabled={!canSearch}
          onClick={handleSearch}
          style={!canSearch ? { opacity: .3, pointerEvents: 'none' } : {}}
        >
          🔍
        </button>
      </div>
    </div>
  )
}
