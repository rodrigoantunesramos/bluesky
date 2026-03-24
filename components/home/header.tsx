'use client' // usa o cliente do supabase para verificar a sessão do usuário e renderizar o header de acordo.

import { useEffect, useRef, useState } from 'react' // useEffect para verificar a sessão do usuário e atualizar o estado de login
import Link from 'next/link'
import { supabase } from '@/lib/supabase' // importação do cliente do supabase para verificar a sessão do usuário
import SearchBar from './SearchBar' // importação do componente SearchBar para ser usado no header
import Image from 'next/image' // importação do componente Image do Next.js para otimização de imagens

export default function Header() { // componente de header que renderiza o logo, a barra de pesquisa e os links de login/dashboard e menu hambúrguer
  const [isLoggedIn, setIsLoggedIn] = useState(false) // estado para verificar se o usuário está logado ou não
  const [menuOpen, setMenuOpen] = useState(false) // estado para controlar a abertura do menu hambúrguer em telas menores
  const menuRef = useRef<HTMLDivElement>(null) // referência para o menu hambúrguer, usada para fechar o menu quando o usuário clicar fora dele

  useEffect(() => { // verifica a sessão do usuário ao montar o componente e atualiza o estado de login
    supabase.auth.getSession().then(({ data: { session } }) => { // verifica se há uma sessão ativa e atualiza o estado de login
      setIsLoggedIn(!!session) // se houver uma sessão, o usuário está logado, caso contrário, não está logado
    })
  }, [])

  useEffect(() => { // adiciona um event listener para fechar o menu hambúrguer quando o usuário clicar fora dele
    const handler = (e: MouseEvent) => { 
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false) // se o clique for fora do menu hambúrguer, fecha o menu
    }
    document.addEventListener('click', handler) // adiciona o event listener para o clique no documento
    return () => document.removeEventListener('click', handler) // remove o event listener quando o componente for desmontado para evitar vazamento de memória
  }, [])

  return (
    <header className="header"> 
      <div className="header-left"> // seção esquerda do header que contém o logo da VENTSY, que é um link para a página inicial
        <Link href="/"> 
            <Image 
                src="/imagens/logo.png" 
                alt="Ventsy" 
                width={120} 
                height={40} 
            /> 
        </Link> 
      </div>  

      <nav className="header-center">
        <SearchBar />
      </nav>

     <div className="header-right">

  {isLoggedIn ? (
    // 🔐 Usuário logado
    <Link href="/dashboard" className="btn-dashboard-header">
      Dashboard
    </Link>
  ) : (
    // 🚪 Usuário NÃO logado
    <>
      <Link href="/login" className="btn-login-header">
        Entrar
      </Link>

      <div className="menu-hamburguer-container" ref={menuRef}> 
        <button 
          className="btn-menu-header" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰ Menu
        </button> 

        <div className={`extra-menu-dropdown${menuOpen ? ' open' : ''}`}> 
          <Link href="/cadastro" onClick={() => setMenuOpen(false)}>
            ✏️ Cadastre seu espaço
          </Link>

          <Link href="/planos" onClick={() => setMenuOpen(false)}>
            💳 Planos
          </Link>

          <Link href="/como-funciona" onClick={() => setMenuOpen(false)}>
            💡 Como Funciona
          </Link>

          <Link href="/fale-conosco" onClick={() => setMenuOpen(false)}>
            💬 Fale Conosco
          </Link>
        </div>
      </div>
    </>
  )}

</div>
    </header>
  )
}
