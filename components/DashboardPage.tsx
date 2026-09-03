
import React, { useState, useEffect } from 'react';
import { Member, MembershipDue, Meeting, MemberStatus, PaymentStatus } from '../types';
import { UsersIcon, DollarSignIcon, WaterDropIcon, CalendarIcon, CogIcon } from './Icons';
import { GoogleGenAI } from '@google/genai';

interface DashboardPageProps {
  members: Member[];
  dues: MembershipDue[];
  meetings: Meeting[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string; trend?: string }> = ({ title, value, icon, colorClass, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      {trend && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">{trend}</span>}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

export const DashboardPage: React.FC<DashboardPageProps> = ({ members, dues, meetings }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const activeMembers = members.filter(m => m.status === MemberStatus.Ativo).length;
  const pendingAmount = dues.filter(d => d.status !== PaymentStatus.Pago).reduce((acc, d) => acc + d.amount, 0);
  const totalConsumption = dues.filter(d => d.readingDetails).reduce((acc, d) => acc + (d.readingDetails?.consumption || 0), 0);
  const nextMeeting = meetings.length > 0 ? new Date(meetings[0].date).toLocaleDateString('pt-BR') : 'Nenhuma';

  // Encontrar o valor do rateio mais recente
  const latestDueWithReading = [...dues].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months.indexOf(b.month) - months.indexOf(a.month);
  }).find(d => d.readingDetails);

  const currentRateio = latestDueWithReading?.readingDetails?.pricePerCubicMeter || 0;
  const lastEnergyBill = latestDueWithReading?.readingDetails?.totalEnergyBill || 0;
  const lastSystemConsumption = latestDueWithReading?.readingDetails?.totalSystemConsumption || 0;

  const generateAIInsight = async () => {
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise os dados desta associação rural e forneça um resumo motivacional de 2 parágrafos:
      - Localidade: COMUNIDADE DE VARGINHA
      - Total de Sócios: ${members.length}
      - Sócios Ativos: ${activeMembers}
      - Valor a Receber: R$ ${(pendingAmount || 0).toFixed(2)}
      - Consumo Total Acumulado: ${(totalConsumption || 0).toFixed(0)} m³
      - Última Conta de Energia: R$ ${(lastEnergyBill || 0).toFixed(2)}
      - Consumo do Sistema (Último Rateio): ${(lastSystemConsumption || 0).toFixed(0)} m³
      - Valor do Rateio (Preço m³): R$ ${(currentRateio || 0).toFixed(4)}
      - Taxa de Serviço (Manutenção): R$ ${(latestDueWithReading?.readingDetails?.serviceFee || 0).toFixed(2)}
      Seja profissional e focado em gestão comunitária.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiInsight(response.text);
    } catch (error) {
      setAiInsight("Mantenha o foco na gestão eficiente e no desenvolvimento da Comunidade de Varginha!");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    generateAIInsight();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">COMUNIDADE DE VARGINHA</h1>
          <p className="text-gray-500 font-medium uppercase text-xs tracking-widest mt-1">Gestão de Recursos Hídricos e Comunitários</p>
        </div>
        <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Status do Sistema</span>
            <span className="font-mono text-emerald-600 font-bold uppercase text-xs">Operacional</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Sócios" 
          value={members.length} 
          icon={<UsersIcon className="w-6 h-6 text-emerald-600" />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Consumo de Água" 
          value={`${(totalConsumption || 0).toFixed(0)} m³`} 
          icon={<WaterDropIcon className="w-6 h-6 text-emerald-600" />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Última Conta de Energia" 
          value={`R$ ${lastEnergyBill.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<DollarSignIcon className="w-6 h-6 text-emerald-600" />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Consumo do Sistema" 
          value={`${(lastSystemConsumption || 0).toFixed(0)} m³`} 
          icon={<WaterDropIcon className="w-6 h-6 text-emerald-600" />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Valor do Rateio" 
          value={`R$ ${currentRateio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`} 
          icon={<CogIcon className="w-6 h-6 text-emerald-600" />} 
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Pendente (AR)" 
          value={`R$ ${pendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          icon={<DollarSignIcon className="w-6 h-6 text-amber-600" />} 
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard 
          title="Próx. Reunião" 
          value={nextMeeting} 
          icon={<CalendarIcon className="w-6 h-6 text-purple-600" />} 
          colorClass="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-emerald-400 w-2 h-8 rounded-full"></span>
              Visão Inteligente
            </h2>
            {loadingAi ? (
              <div className="space-y-3">
                <div className="h-4 bg-emerald-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-emerald-700 rounded w-1/2 animate-pulse"></div>
              </div>
            ) : (
              <p className="text-emerald-50 leading-relaxed text-lg italic">
                {aiInsight || "Processando dados da Comunidade de Varginha..."}
              </p>
            )}
          </div>
          <WaterDropIcon className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-700 opacity-20 rotate-12" />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Status dos Sócios</h3>
            <div className="space-y-6">
                {Object.values(MemberStatus).map(status => {
                    const count = members.filter(m => m.status === status).length;
                    const pct = members.length > 0 ? (count / members.length) * 100 : 0;
                    return (
                        <div key={status}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-600">{status}</span>
                                <span className="font-bold text-gray-900">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-1000 ${
                                        status === 'Ativo' ? 'bg-emerald-500' : 'bg-gray-400'
                                    }`} 
                                    style={{ width: `${pct}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
