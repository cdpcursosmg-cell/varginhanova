import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Member, MembershipDue, PaymentStatus } from '../types';
import { SearchIcon, WaterDropIcon, DownloadIcon, PrinterIcon, SaveIcon, CogIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';
import { importedData } from '../App';
import * as XLSX from 'xlsx';

interface ReadingsListPageProps {
  members: Member[];
  dues: MembershipDue[];
  waterPrice: number;
  serviceFee: number;
  onNavigate?: (view: any) => void;
  onUpdateDues?: (newDues: MembershipDue[]) => void;
  onSelectMemberHistory?: (member: Member) => void;
}

const getMonthName = (monthIndex: number) => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[monthIndex];
};

export const ReadingsListPage: React.FC<ReadingsListPageProps> = ({
  members,
  dues,
  waterPrice,
  serviceFee,
  onNavigate,
  onUpdateDues
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 1)); // Março de 2026
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'with-consumption' | 'zero-consumption' | 'pending'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [printMode, setPrintMode] = useState<'report' | 'field-sheet' | null>(null);

  const monthStr = getMonthName(selectedDate.getMonth());
  const year = selectedDate.getFullYear();

  // Normalize string for robust matching
  const normalize = (s: string) =>
    s.toUpperCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "");

  // Mapeamento dos valores de leituras para cada membro
  const [readingsData, setReadingsData] = useState<Record<string, { previous: number; current: number | null; source: string }>>({});

  // Carrega ou inicializa as leituras a partir das faturas geradas ou dados importados
  useEffect(() => {
    const map: Record<string, { previous: number; current: number | null; source: string }> = {};

    members.forEach(member => {
      // 1. Procura se já há fatura cadastrada para o mês selecionado
      const bill = dues.find(d => d.memberId === member.id && d.month === monthStr && d.year === year);
      if (bill && bill.readingDetails) {
        map[member.id] = {
          previous: bill.readingDetails.previousReading,
          current: bill.readingDetails.currentReading,
          source: 'Fatura Gerada'
        };
        return;
      }

      // 2. Procura na lista oficial importada consolidada
      const importedMatch = importedData.find(d => normalize(d.name) === normalize(member.name));
      if (importedMatch) {
        map[member.id] = {
          previous: importedMatch.prev,
          current: importedMatch.curr,
          source: 'Oficial Consolidado'
        };
        return;
      }

      // 3. Fallback: Leitura inicial do membro
      map[member.id] = {
        previous: member.initialReading ?? 0,
        current: null,
        source: 'Cadastro'
      };
    });

    setReadingsData(map);
  }, [members, dues, monthStr, year]);

  // Lista de sócios sempre em rigorosa ordem alfabética (A-Z)
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [members]);

  // Itens calculados para a tabela
  const listItems = useMemo(() => {
    return sortedMembers.map((member, index) => {
      const data = readingsData[member.id] || { previous: 0, current: null, source: '' };
      const prev = data.previous ?? 0;
      const curr = data.current;
      const hasCurrent = curr !== null && !isNaN(curr);
      const consumption = hasCurrent ? Math.max(0, curr - prev) : 0;
      const waterTotal = consumption * waterPrice;
      const finalAmount = hasCurrent ? (waterTotal + serviceFee) : 0;

      let statusLabel: 'Normal' | 'Sem Consumo' | 'Consumo Alto' | 'Pendente' = 'Normal';
      if (!hasCurrent) {
        statusLabel = 'Pendente';
      } else if (consumption === 0) {
        statusLabel = 'Sem Consumo';
      } else if (consumption >= 30) {
        statusLabel = 'Consumo Alto';
      }

      return {
        number: index + 1,
        member,
        previous: prev,
        current: curr,
        hasCurrent,
        consumption,
        finalAmount,
        statusLabel,
        source: data.source
      };
    });
  }, [sortedMembers, readingsData, waterPrice, serviceFee]);

  // Filtro de busca e tipo de status
  const filteredItems = useMemo(() => {
    return listItems.filter(item => {
      const matchesSearch = item.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.member.cpf.includes(searchTerm) ||
                            (item.member.address && item.member.address.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesFilter = true;
      if (filterType === 'with-consumption') {
        matchesFilter = item.hasCurrent && item.consumption > 0;
      } else if (filterType === 'zero-consumption') {
        matchesFilter = item.hasCurrent && item.consumption === 0;
      } else if (filterType === 'pending') {
        matchesFilter = !item.hasCurrent;
      }

      return matchesSearch && matchesFilter;
    });
  }, [listItems, searchTerm, filterType]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalMembers = listItems.length;
    const withCurrent = listItems.filter(i => i.hasCurrent).length;
    const pendingCount = totalMembers - withCurrent;
    const totalConsumption = listItems.reduce((acc, i) => acc + (i.hasCurrent ? i.consumption : 0), 0);
    const totalBilled = listItems.reduce((acc, i) => acc + (i.hasCurrent ? i.finalAmount : 0), 0);
    const avgConsumption = withCurrent > 0 ? (totalConsumption / withCurrent) : 0;
    const maxConsumption = listItems.reduce((max, i) => i.consumption > max ? i.consumption : max, 0);

    return {
      totalMembers,
      withCurrent,
      pendingCount,
      totalConsumption,
      totalBilled,
      avgConsumption,
      maxConsumption
    };
  }, [listItems]);

  // Exportar para Excel (.xlsx)
  const handleExportExcel = () => {
    const data = filteredItems.map(item => ({
      'Nº': item.number,
      'Sócio': item.member.name,
      'Endereço / Local': item.member.address || 'Comunidade de Varginha',
      'CPF': item.member.cpf,
      'Referência': `${monthStr}/${year}`,
      'Leitura Anterior (m³)': item.previous,
      'Leitura Atual (m³)': item.hasCurrent ? item.current : 'Pendente',
      'Consumo Apurado (m³)': item.hasCurrent ? item.consumption : '-',
      'Tarifa por m³ (R$)': waterPrice.toFixed(4),
      'Taxa de Manutenção (R$)': serviceFee.toFixed(2),
      'Valor Total (R$)': item.hasCurrent ? item.finalAmount.toFixed(2) : '-',
      'Situação': item.statusLabel
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Leituras_${monthStr}`);
    XLSX.writeFile(workbook, `Lista_Usuarios_Leituras_${monthStr}_${year}.xlsx`);
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    const headers = ['Nº', 'Sócio', 'Endereço', 'CPF', 'Referência', 'Leitura Anterior', 'Leitura Atual', 'Consumo (m³)', 'Valor Total (R$)', 'Situação'];
    const rows = filteredItems.map(item => [
      item.number,
      item.member.name,
      item.member.address || 'Comunidade de Varginha',
      item.member.cpf,
      `${monthStr}/${year}`,
      item.previous,
      item.hasCurrent ? item.current : '',
      item.hasCurrent ? item.consumption : '',
      item.hasCurrent ? item.finalAmount.toFixed(2) : '',
      item.statusLabel
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Lista_Leituras_${monthStr}_${year}.csv`);
    link.click();
  };

  // Imprimir Relatório Geral
  const handlePrintReport = () => {
    setPrintMode('report');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Imprimir Folha de Leitura de Campo
  const handlePrintFieldSheet = () => {
    setPrintMode('field-sheet');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Salvar alterações manuais de leitura
  const handleSaveEdits = () => {
    setIsEditing(false);
    alert('Alterações salvas com sucesso no painel!');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Impressão: Folha Oficial ou Caderno de Campo */}
      {printMode && (
        <div className="hidden print:block fixed inset-0 bg-white p-6 z-50 text-black">
          {printMode === 'report' ? (
            <div>
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                <h1 className="text-2xl font-black uppercase tracking-wider">COMUNIDADE DE VARGINHA</h1>
                <p className="text-sm font-semibold uppercase text-gray-700">Associação Comunitária Rural — Fazenda Mamonas — São João da Ponte - MG</p>
                <h2 className="text-base font-bold text-gray-900 mt-2 bg-gray-100 py-1 uppercase tracking-wide">
                  Relatório Geral Consolidado de Leituras de Hidrômetros — {monthStr.toUpperCase()} / {year}
                </h2>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</span>
                  <span>Tarifa: R$ {waterPrice.toFixed(4)}/m³ | Taxa: R$ {serviceFee.toFixed(2)}</span>
                  <span>Total de Sócios: {stats.totalMembers}</span>
                </div>
              </div>

              <table className="w-full text-xs border border-gray-400 border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-900 font-bold border-b border-gray-400">
                    <th className="border border-gray-300 p-1 text-center w-10">Nº</th>
                    <th className="border border-gray-300 p-1 text-left">Nome do Sócio</th>
                    <th className="border border-gray-300 p-1 text-center w-20">Leit. Ant.</th>
                    <th className="border border-gray-300 p-1 text-center w-20">Leit. Atual</th>
                    <th className="border border-gray-300 p-1 text-center w-16">Consumo</th>
                    <th className="border border-gray-300 p-1 text-right w-24">Valor (R$)</th>
                    <th className="border border-gray-300 p-1 text-center w-20">Situação</th>
                  </tr>
                </thead>
                <tbody>
                  {listItems.map((item) => (
                    <tr key={item.member.id} className="border-b border-gray-300">
                      <td className="border border-gray-300 p-1 text-center font-mono">{item.number}</td>
                      <td className="border border-gray-300 p-1 font-bold">{item.member.name}</td>
                      <td className="border border-gray-300 p-1 text-center font-mono">{item.previous}</td>
                      <td className="border border-gray-300 p-1 text-center font-mono font-bold">{item.hasCurrent ? item.current : '-'}</td>
                      <td className="border border-gray-300 p-1 text-center font-mono font-bold">
                        {item.hasCurrent ? `${item.consumption} m³` : '-'}
                      </td>
                      <td className="border border-gray-300 p-1 text-right font-mono font-bold">
                        {item.hasCurrent ? `R$ ${item.finalAmount.toFixed(2)}` : '-'}
                      </td>
                      <td className="border border-gray-300 p-1 text-center text-[10px]">{item.statusLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 border-t-2 border-gray-800 pt-3 flex justify-between text-xs font-bold">
                <div>Consumo Total: <span className="font-mono text-sm">{stats.totalConsumption} m³</span></div>
                <div>Arrecadação Estimada: <span className="font-mono text-sm">R$ {stats.totalBilled.toFixed(2)}</span></div>
                <div>Média por Sócio: <span className="font-mono text-sm">{stats.avgConsumption.toFixed(1)} m³</span></div>
              </div>

              <div className="mt-14 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-gray-500 w-3/4 mx-auto pt-1">Responsável pelas Leituras</div>
                </div>
                <div>
                  <div className="border-t border-gray-500 w-3/4 mx-auto pt-1">Diretoria da Associação</div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Folha de Leitura de Campo para Anotação */}
              <div className="text-center border-b-2 border-gray-800 pb-3 mb-3">
                <h1 className="text-xl font-black uppercase tracking-wider">COMUNIDADE DE VARGINHA — CADERNO DE CAMPO</h1>
                <p className="text-xs font-semibold uppercase text-gray-700">Folha de Coleta de Leituras de Hidrômetros — {monthStr.toUpperCase()} / {year}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Leiturista: Anotar a Leitura Atual com clareza nos espaços em branco.</p>
              </div>

              <table className="w-full text-xs border border-gray-400 border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-gray-900 font-bold border-b border-gray-400">
                    <th className="border border-gray-300 p-1.5 text-center w-8">#</th>
                    <th className="border border-gray-300 p-1.5 text-left">Nome do Sócio / Família</th>
                    <th className="border border-gray-300 p-1.5 text-center w-20">Leit. Ant.</th>
                    <th className="border border-gray-300 p-1.5 text-center w-28 bg-emerald-50">LEITURA ATUAL</th>
                    <th className="border border-gray-300 p-1.5 text-left">Assinatura / Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {listItems.map((item) => (
                    <tr key={item.member.id} className="border-b border-gray-300 h-8">
                      <td className="border border-gray-300 p-1 text-center font-mono">{item.number}</td>
                      <td className="border border-gray-300 p-1 font-bold">{item.member.name}</td>
                      <td className="border border-gray-300 p-1 text-center font-mono text-gray-600">{item.previous}</td>
                      <td className="border border-gray-300 p-1 text-center font-mono bg-emerald-50/50">
                        {item.hasCurrent ? item.current : '________________'}
                      </td>
                      <td className="border border-gray-300 p-1 text-gray-400 text-[10px]">
                        ___________________________________
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 flex justify-between text-xs">
                <div>Data da Coleta: ____/____/________</div>
                <div>Assinatura do Leiturista: ____________________________________</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cabeçalho da Página */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <WaterDropIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Lista Geral de Usuários e Leituras
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Visualização completa de todos os {stats.totalMembers} sócios da Comunidade de Varginha com leituras de hidrômetros em ordem alfabética (A-Z).
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white font-semibold text-xs rounded-xl shadow hover:bg-gray-800 transition-colors"
            title="Imprimir relatório completo oficial formatado para folha A4"
          >
            <PrinterIcon className="w-4 h-4" />
            Imprimir Relatório
          </button>

          <button
            onClick={handlePrintFieldSheet}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow hover:bg-emerald-900 transition-colors"
            title="Imprimir caderno de campo para o leiturista anotar no local"
          >
            <PrinterIcon className="w-4 h-4" />
            Folha de Campo
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
            title="Exportar tabela para Excel (.xlsx)"
          >
            <DownloadIcon className="w-4 h-4" />
            Excel
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl hover:bg-emerald-100 transition-colors"
            title="Exportar arquivo CSV"
          >
            <DownloadIcon className="w-4 h-4" />
            CSV
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('readings')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow hover:bg-emerald-700 transition-colors"
            >
              <CogIcon className="w-4 h-4" />
              Lançamento Mensal
            </button>
          )}
        </div>
      </div>

      {/* 4 Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Sócios com Leituras</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-gray-900 font-mono">{stats.withCurrent}</span>
            <span className="text-xs text-gray-500 font-medium">de {stats.totalMembers}</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${stats.totalMembers > 0 ? (stats.withCurrent / stats.totalMembers) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Consumo Geral</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600 font-mono">{stats.totalConsumption}</span>
            <span className="text-xs text-gray-500 font-medium">m³ medidos</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Média: {stats.avgConsumption.toFixed(1)} m³/família</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Tarifa Vigente</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-gray-900 font-mono">R$ {waterPrice.toFixed(4)}</span>
            <span className="text-xs text-gray-500 font-medium">/ m³</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Taxa de Manutenção: R$ {serviceFee.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase">Arrecadação Prevista</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-gray-900 font-mono">R$ {stats.totalBilled.toFixed(2)}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats.pendingCount > 0 ? `${stats.pendingCount} leituras pendentes` : '100% lançado'}
          </p>
        </div>
      </div>

      {/* Barra de Filtros, Mês e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between no-print">
        {/* Busca */}
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por sócio ou CPF..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Seleção de Mês e Filtros */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Mês de Referência */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700">
            <span>Mês:</span>
            <input
              type="month"
              value={`${year}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-');
                setSelectedDate(new Date(parseInt(y), parseInt(m) - 1, 1));
              }}
              className="bg-transparent border-none text-xs font-bold text-emerald-800 p-0 focus:ring-0 cursor-pointer"
            />
          </div>

          {/* Filtro de Status */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold rounded-xl px-3 py-2 text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Todos ({listItems.length})</option>
            <option value="with-consumption">Com Consumo &gt; 0 ({listItems.filter(i => i.hasCurrent && i.consumption > 0).length})</option>
            <option value="zero-consumption">Sem Consumo / Zerado ({listItems.filter(i => i.hasCurrent && i.consumption === 0).length})</option>
            <option value="pending">Leitura Pendente ({listItems.filter(i => !i.hasCurrent).length})</option>
          </select>

          {/* Alternar Edição Rápida */}
          <button
            onClick={() => {
              if (isEditing) {
                handleSaveEdits();
              } else {
                setIsEditing(true);
              }
            }}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isEditing
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SaveIcon className="w-3.5 h-3.5" />
            {isEditing ? 'Salvar Edições' : 'Editar Leituras'}
          </button>
        </div>
      </div>

      {/* Tabela de Sócios com Leituras */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-6 py-3">Sócio / Família</th>
                <th className="px-4 py-3 text-center">Leitura Ant.</th>
                <th className="px-4 py-3 text-center">Leitura Atual</th>
                <th className="px-4 py-3 text-center">Consumo Apurado</th>
                <th className="px-6 py-3 text-right">Valor Total Estimado</th>
                <th className="px-4 py-3 text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.member.id} className="hover:bg-emerald-50/40 transition-colors">
                  {/* Número */}
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-400 font-bold">
                    {item.number}
                  </td>

                  {/* Nome do Sócio */}
                  <td className="px-6 py-3">
                    <div className="font-bold text-gray-900 uppercase tracking-wide">
                      {item.member.name}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {item.member.address || 'Comunidade de Varginha'} • CPF: {item.member.cpf}
                    </div>
                  </td>

                  {/* Leitura Anterior */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.previous}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setReadingsData(prev => ({
                            ...prev,
                            [item.member.id]: {
                              ...prev[item.member.id],
                              previous: val
                            }
                          }));
                        }}
                        className="w-20 text-center font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg p-1.5 focus:ring-1 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className="font-mono text-gray-600 font-medium">
                        {item.previous}
                      </span>
                    )}
                  </td>

                  {/* Leitura Atual */}
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.current ?? ''}
                        placeholder="Atual"
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          setReadingsData(prev => ({
                            ...prev,
                            [item.member.id]: {
                              ...prev[item.member.id],
                              current: val
                            }
                          }));
                        }}
                        className="w-20 text-center font-mono text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg p-1.5 focus:ring-2 focus:ring-emerald-500"
                      />
                    ) : (
                      <span className={`font-mono font-bold ${item.hasCurrent ? 'text-emerald-700' : 'text-gray-300'}`}>
                        {item.hasCurrent ? item.current : '—'}
                      </span>
                    )}
                  </td>

                  {/* Consumo */}
                  <td className="px-4 py-3 text-center">
                    {item.hasCurrent ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                          item.consumption > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.consumption} m³
                      </span>
                    ) : (
                      <span className="text-xs text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                        Pendente
                      </span>
                    )}
                  </td>

                  {/* Valor Total */}
                  <td className="px-6 py-3 text-right">
                    {item.hasCurrent ? (
                      <div>
                        <span className="font-black text-gray-900 font-mono">
                          R$ {item.finalAmount.toFixed(2)}
                        </span>
                        <div className="text-[10px] text-gray-400">
                          {item.consumption} m³ × R$ {waterPrice.toFixed(2)} + R$ {serviceFee.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300 font-mono">—</span>
                    )}
                  </td>

                  {/* Situação */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.statusLabel === 'Normal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.statusLabel === 'Consumo Alto'
                          ? 'bg-indigo-100 text-indigo-800'
                          : item.statusLabel === 'Sem Consumo'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nenhum sócio encontrado */}
        {filteredItems.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <WaterDropIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="font-bold text-gray-600">Nenhum sócio encontrado para esta busca ou filtro.</p>
            <p className="text-xs mt-1">Tente ajustar o termo digitado ou mude o filtro.</p>
          </div>
        )}

        {/* Rodapé com Totais */}
        <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600 font-medium gap-2">
          <div>
            Exibindo <span className="font-bold text-gray-900">{filteredItems.length}</span> de <span className="font-bold text-gray-900">{listItems.length}</span> sócios cadastrados.
          </div>
          <div className="flex items-center gap-4">
            <span>
              Consumo Apurado da Lista: <strong className="text-emerald-700 font-mono">{filteredItems.reduce((acc, i) => acc + (i.hasCurrent ? i.consumption : 0), 0)} m³</strong>
            </span>
            <span>
              Total: <strong className="text-gray-900 font-mono">R$ {filteredItems.reduce((acc, i) => acc + (i.hasCurrent ? i.finalAmount : 0), 0).toFixed(2)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
