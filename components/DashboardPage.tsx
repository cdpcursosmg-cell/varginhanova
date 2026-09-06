
import React from 'react';
import { Member, MembershipDue, Meeting, MemberStatus, PaymentStatus } from '../types';
import { UsersIcon, DollarSignIcon, WaterDropIcon, CalendarIcon, CogIcon } from './Icons';

interface DashboardPageProps {
  members: Member[];
  dues: MembershipDue[];
  meetings: Meeting[];
  onNavigate?: (view: 'members' | 'readings' | 'financials' | 'calendar' | 'backup') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ members, dues, meetings, onNavigate }) => {
  const activeMembers = members.filter(m => m.status === MemberStatus.Ativo).length;
  const pendingDues = dues.filter(d => d.status !== PaymentStatus.Pago);
  const pendingAmount = pendingDues.reduce((acc, d) => acc + d.amount, 0);
  const paidDues = dues.filter(d => d.status === PaymentStatus.Pago);
  const paidAmount = paidDues.reduce((acc, d) => acc + d.amount, 0);
  const totalConsumption = dues.filter(d => d.readingDetails).reduce((acc, d) => acc + (d.readingDetails?.consumption || 0), 0);

  // Rateio mais recente
  const latestDueWithReading = [...dues].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months.indexOf(b.month) - months.indexOf(a.month);
  }).find(d => d.readingDetails);

  const currentRateio = latestDueWithReading?.readingDetails?.pricePerCubicMeter || 0;
  const lastEnergyBill = latestDueWithReading?.readingDetails?.totalEnergyBill || 0;
  const lastReference = latestDueWithReading ? `${latestDueWithReading.month}/${latestDueWithReading.year}` : 'Nenhuma';
  const nextMeeting = meetings.length > 0 ? new Date(meetings[0].date).toLocaleDateString('pt-BR') : 'Sem reunião agendada';

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Cabeçalho Simples */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Comunidade de Varginha</h1>
          <p className="text-sm text-gray-500 mt-1">Resumo geral da associação e abastecimento de água</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistema Operacional
        </div>
      </div>

      {/* 4 Indicadores Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sócios */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Sócios Cadastrados</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{members.length}</p>
            <p className="text-xs text-emerald-600 mt-0.5 font-medium">{activeMembers} ativos</p>
          </div>
        </div>

        {/* Consumo */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <WaterDropIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Consumo Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{(totalConsumption || 0).toFixed(0)} <span className="text-sm font-normal text-gray-500">m³</span></p>
            <p className="text-xs text-gray-500 mt-0.5">Medição acumulada</p>
          </div>
        </div>

        {/* Preço Rateio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CogIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Preço do m³</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">R$ {currentRateio.toFixed(4)}</p>
            <p className="text-xs text-gray-500 mt-0.5">Último rateio de energia</p>
          </div>
        </div>

        {/* Pendências */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSignIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">A Receber</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">R$ {pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-amber-600 mt-0.5 font-medium">{pendingDues.length} pendentes</p>
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos e Resumo Simples */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acesso Rápido */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate?.('readings')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <WaterDropIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Leituras de Hidrômetros</p>
                <p className="text-xs text-gray-500 mt-0.5">Lançar consumo e gerar faturas</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('members')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <UsersIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Lista de Sócios</p>
                <p className="text-xs text-gray-500 mt-0.5">Ver cadastros e imprimir carteirinhas</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('financials')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <DollarSignIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Financeiro & Faturas</p>
                <p className="text-xs text-gray-500 mt-0.5">Dar baixa e controlar recebimentos</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate?.('calendar')}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Agenda & Reuniões</p>
                <p className="text-xs text-gray-500 mt-0.5">Próxima: {nextMeeting}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Resumo do Último Rateio */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Último Fechamento</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Mês de Referência</span>
                <span className="font-semibold text-gray-900">{lastReference}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Conta de Energia</span>
                <span className="font-semibold text-gray-900">R$ {lastEnergyBill.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Preço Calculado</span>
                <span className="font-semibold text-emerald-700">R$ {currentRateio.toFixed(4)} / m³</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Recebido até agora</span>
                <span className="font-semibold text-green-600">R$ {paidAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => onNavigate?.('readings')}
              className="w-full text-center text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl transition-colors"
            >
              Abrir Leituras do Mês →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

