
import React, { useState, useEffect } from 'react';
import { Member, MembershipDue, Expense, Meeting, MemberStatus, PaymentStatus, WaterReadingDetails } from './types';
import { MembersPage } from './components/MembersPage';
import { FinancialsPage } from './components/FinancialsPage';
import { CalendarPage } from './components/CalendarPage';
import { DashboardPage } from './components/DashboardPage';
import { WaterReadingsPage } from './components/WaterReadingsPage';
import { UsersIcon, DollarSignIcon, CalendarIcon, DashboardIcon, WaterDropIcon, CogIcon } from './components/Icons';
import { BackupPage } from './components/BackupPage';

const ASSOC_NAME = "COMUNIDADE DE VARGINHA";
const ASSOC_CNPJ = ""; 
const ASSOC_ADDRESS = "Comunidade de Varginha, São João da Ponte, MG";

// Lista oficial consolidada
export const importedData = [
    { name: "ADÃO DA DOMINGA", prev: 680, curr: 690 },
    { name: "ADELAIDE P, SIQUEIRA", prev: 2124, curr: 2148 },
    { name: "ADENILSON PEREIRA SIQUEIRA(BRANCO", prev: 1508, curr: 1521 },
    { name: "APARECIDA", prev: 50, curr: 58 },
    { name: "ALISSON MARTINS(ALISSON DO JOÃO", prev: 1381, curr: 1394 },
    { name: "ANA FERREIRA FRAGA(CARNEIRO)", prev: 1579, curr: 1587 },
    { name: "PAULIN DA GERALDA(BEBEDOR)", prev: 0, curr: 0 },
    { name: "ARLINDO RIBEIRO", prev: 1421, curr: 1432 },
    { name: "ARMANDO DE BRITO", prev: 1280, curr: 1289 },
    { name: "ANDREIA", prev: 0, curr: 0 },
    { name: "AUGUSTO DIAS MACHADO", prev: 861, curr: 869 },
    { name: "CARMITA", prev: 933, curr: 947 },
    { name: "CATULINA SOARES", prev: 1102, curr: 1113 },
    { name: "CECINA", prev: 1014, curr: 1021 },
    { name: "CELINO DIAS MACHADO", prev: 1143, curr: 1147 },
    { name: "DELSON DO PAULO", prev: 57, curr: 68 },
    { name: "DINALVA MENDES DE OLIVEIRA", prev: 1005, curr: 1008 },
    { name: "DOMINGOS DIAS MACHADO", prev: 0, curr: 1657 },
    { name: "EDILEUZA MENDES DE OLIVEIRA", prev: 1043, curr: 1458 },
    { name: "ESCOLA MUNICIPAL", prev: 430, curr: 436 },
    { name: "FABIO DE OLIVEIRA", prev: 375, curr: 383 },
    { name: "FARLEY DO SI", prev: 666, curr: 672 },
    { name: "GENEROSO FERREIRA FRAGA", prev: 2017, curr: 2050 },
    { name: "GENTIL MENDES DE OLIVEIRA", prev: 1442, curr: 1458 },
    { name: "NILZA MARTINS", prev: 1168, curr: 1176 },
    { name: "DAVI SOUZA", prev: 872, curr: 872 },
    { name: "HAMILTON RIBEIRO(MILTIN)BEBEDOR", prev: 1080, curr: 1341 },
    { name: "IGREJA", prev: 148, curr: 151 },
    { name: "JOÃO DO DOMINGÃO(BEBEDOR)", prev: 327, curr: 334 },
    { name: "JOÃO DO DOMINGAO(CASA)", prev: 940, curr: 347 },
    { name: "JAQUINA FERREIRA FRAGA", prev: 563, curr: 572 },
    { name: "CASSIO DA LURDINHA", prev: 269, curr: 276 },
    { name: "JOSE ANTONIO(J DIAS)", prev: 1107, curr: 1107 },
    { name: "JOSÉ AUTHUR M. OLIVEIRA", prev: 415, curr: 416 },
    { name: "JOSE DOS REIS(MARCELO)", prev: 748, curr: 739 },
    { name: "JOSE DOS REIS D. MACHADO(TETA)", prev: 1280, curr: 1220 },
    { name: "LUCIMAR", prev: 1734, curr: 1749 },
    { name: "JOSE LUIZ F. QUEIROZ(ZEQUINHA)", prev: 1808, curr: 1821 },
    { name: "JOSE MANOEL MENDES(BEBEDOR)", prev: 0, curr: 269 },
    { name: "JOSE OSCAR M. OLIVEIRA", prev: 1081, curr: 1090 },
    { name: "JOSE PAULO P. S. (PAULIN DA GERALDA)", prev: 226, curr: 460 },
    { name: "LOURIVALDO", prev: 0, curr: 1981 },
    { name: "LUCIA DO SI", prev: 66, curr: 667 },
    { name: "LUCILIO DE VÔ", prev: 86, curr: 87 },
    { name: "LUIZÃO BAIANO", prev: 241, curr: 244 },
    { name: "MANOEL DO ORLINDO", prev: 258, curr: 258 },
    { name: "MARCIO(ZILENE)", prev: 890, curr: 1906 },
    { name: "JULIO", prev: 0, curr: 3133 },
    { name: "MARIA ANUNCIAÇÃO", prev: 1073, curr: 1509 },
    { name: "MARIA DOS SANTOS LOPES G.", prev: 1493, curr: 1503 },
    { name: "MARIA SELMA(SELMA DO ZÉ ELIAS)", prev: 394, curr: 402 },
    { name: "NELZITA MENDES DE OLIVEIRA", prev: 1883, curr: 1905 },
    { name: "NILTON MENDES DE OLIVEIRA", prev: 1080, curr: 1004 },
    { name: "OLIMPIO MENDES DE OLIVEIRA", prev: 596, curr: 600 },
    { name: "OSMAR DO CAREIRO", prev: 468, curr: 469 },
    { name: "RENLSON", prev: 1031, curr: 1035 },
    { name: "PAULINHO DA SI", prev: 844, curr: 844 },
    { name: "PAULO FERNANDES DA SILVA", prev: 2099, curr: 2111 },
    { name: "PEDRO PAULA", prev: 1498, curr: 1509 },
    { name: "JOAO CARNEIRO BB", prev: 0, curr: 47 },
    { name: "ROSANA", prev: 0, curr: 1006 },
    { name: "SABINO", prev: 1308, curr: 1303 },
    { name: "SUELANE", prev: 23, curr: 35 },
    { name: "SUELI FERREIRA LIMA", prev: 363, curr: 366 },
    { name: "TEREZINHA PEREIRA(TÊ)", prev: 771, curr: 790 },
    { name: "TONI DA ZENA", prev: 1811, curr: 1822 },
    { name: "VALDEMAR (DEMA)", prev: 784, curr: 791 },
    { name: "GILMAR DA MADALENA", prev: 451, curr: 451 },
    { name: "VANDERLEI RIBEIRO", prev: 718, curr: 1190 },
    { name: "VILMAR DE OLIVEIRA ( BEBEDOR)", prev: 1113, curr: 207 },
    { name: "VILMAR DE OLIVEIRA (CASA)", prev: 207, curr: 1121 },
    { name: "LORIVALDO (BOTECO)", prev: 135, curr: 137 },
    { name: "ROBERTO", prev: 143, curr: 145 },
    { name: "MARCIO(ZILENE)", prev: 147, curr: 150 },
    { name: "JUNIO LOPES", prev: 368, curr: 388 },
    { name: "RAI", prev: 42, curr: 42 },
    { name: "DIJALMA", prev: 323, curr: 326 },
    { name: "SILVESTRE", prev: 0, curr: 397 },
    { name: "GILMAR DE PAULA", prev: 2759, curr: 2769 },
    { name: "GIULIANO", prev: 472, curr: 479 },
    { name: "FLAVIO", prev: 598, curr: 598 },
    { name: "VALDETI CASA", prev: 793, curr: 808 },
    { name: "VALDETI BEBEDOR", prev: 807, curr: 816 },
    { name: "ZE ELIAS", prev: 0, curr: 1690 },
    { name: "JERSON", prev: 40, curr: 40 },
    { name: "SI (BEBEDOR)", prev: 284, curr: 285 },
    { name: "LEO BOMBEIRO", prev: 238, curr: 241 },
    { name: "DETE", prev: 0, curr: 1190 },
    { name: "NEI", prev: 33, curr: 33 },
    { name: "AUGUSTO BB", prev: 0, curr: 539 },
    { name: "NELZITA BB", prev: 0, curr: 31 },
    { name: "SELSO BB", prev: 0, curr: 211 },
    { name: "LIN BB", prev: 0, curr: 144 },
    { name: "NILTIN MENDES", prev: 0, curr: 157 },
    { name: "DEZIN", prev: 0, curr: 66 }
];

const DEFAULT_WATER_PRICE = 1.50;
const DEFAULT_SERVICE_FEE = 5.00;

const initialMembers: Member[] = importedData.map((data, index) => ({
    id: `m_${index + 1}`,
    name: data.name,
    initialReading: data.curr,
    cpf: `${(100 + index).toString().padStart(3, '0')}.000.000-00`,
    address: 'Comunidade de Varginha',
    email: '',
    phone: '',
    joinDate: '2025-01-01',
    category: 'Produtor',
    status: MemberStatus.Ativo,
    naturalness: 'São João da Ponte – MG'
}));

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

type View = 'dashboard' | 'members' | 'readings' | 'financials' | 'calendar' | 'backup';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  
  const [members, setMembers] = usePersistentState<Member[]>('app_members_v10', initialMembers);

  // Auto-sincronizar novos membros da lista oficial com o estado persistente
  useEffect(() => {
    const normalize = (s: string) => s.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
    setMembers(prev => {
      const existingNames = new Set(prev.map(m => normalize(m.name)));
      const missing = importedData.filter(d => !existingNames.has(normalize(d.name)));
      if (missing.length === 0) return prev;
      
      const newMembers: Member[] = missing.map((d, index) => ({
        id: `m_${Date.now()}_${index}`,
        name: d.name,
        initialReading: d.prev,
        cpf: `000.000.000-00`,
        address: 'Comunidade de Varginha',
        email: '',
        phone: '',
        joinDate: '2026-03-01',
        category: 'Produtor',
        status: MemberStatus.Ativo,
        naturalness: 'São João da Ponte – MG'
      }));
      return [...prev, ...newMembers];
    });
  }, [setMembers]);
  const [dues, setDues] = usePersistentState<MembershipDue[]>('app_dues_v10', []);
  const [expenses, setExpenses] = usePersistentState<Expense[]>('app_expenses_v10', []);
  const [meetings, setMeetings] = usePersistentState<Meeting[]>('app_meetings_v10', []);
  const [waterPrice, setWaterPrice] = usePersistentState<number>('app_water_price', DEFAULT_WATER_PRICE);
  const [serviceFee, setServiceFee] = usePersistentState<number>('app_service_fee', DEFAULT_SERVICE_FEE);

  const addMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = { id: `m_${Date.now()}`, ...memberData };
    setMembers([...members, newMember]);
  };

  const updateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { id: `e_${Date.now()}`, ...expenseData };
    setExpenses([...expenses, newExpense]);
  };

  const updateDueStatus = (dueId: string, status: PaymentStatus) => {
    setDues(prev => prev.map(due => due.id === dueId ? { ...due, status, paymentDate: new Date().toISOString() } : due));
  };

  const deleteDue = (dueId: string) => {
    setDues(prev => prev.filter(due => due.id !== dueId));
  };

  const deleteMultipleDues = (dueIds: string[]) => {
    setDues(prev => prev.filter(due => !dueIds.includes(due.id)));
  };

  const addDues = (newDues: MembershipDue[]) => setDues(prev => [...prev, ...newDues]);
  
  const replaceMonthlyDues = (month: string, year: number, newDues: MembershipDue[]) => {
    setDues(prev => {
        const others = prev.filter(d => !(d.month === month && d.year === year));
        return [...others, ...newDues];
    });
  };

  const addMeeting = (meetingData: any) => {
    const newMeeting = { id: `meet_${Date.now()}`, ...meetingData, attendees: [] };
    setMeetings([...meetings, newMeeting].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Início', icon: <DashboardIcon /> },
    { id: 'members', label: 'Sócios', icon: <UsersIcon /> },
    { id: 'readings', label: 'Água / Leituras', icon: <WaterDropIcon /> },
    { id: 'financials', label: 'Financeiro', icon: <DollarSignIcon /> },
    { id: 'calendar', label: 'Agenda', icon: <CalendarIcon /> },
    { id: 'backup', label: 'Configurações', icon: <CogIcon /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-emerald-900 text-white shadow-xl">
          <div className="p-6">
            <h2 className="text-xl font-bold tracking-tight text-emerald-50 leading-tight">
              COMUNIDADE DE VARGINHA
              <span className="block text-[10px] font-normal text-emerald-400 mt-1 uppercase tracking-widest">Gestão Comunitária</span>
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as View)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  activeView === item.id 
                    ? 'bg-emerald-700 text-white shadow-lg' 
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-emerald-800 text-[10px] text-emerald-400 text-center uppercase tracking-widest">
            Associação Rural
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-emerald-900 text-white p-4 flex justify-between items-center">
            <span className="font-bold text-sm uppercase">COMUNIDADE DE VARGINHA</span>
            <div className="flex gap-2">
                {sidebarItems.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveView(item.id as View)}
                        className={`p-1 rounded ${activeView === item.id ? 'bg-emerald-700' : ''}`}
                    >
                        {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                    </button>
                ))}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto focus:outline-none scroll-smooth">
          {activeView === 'dashboard' && <DashboardPage members={members} dues={dues} meetings={meetings} />}
          {activeView === 'members' && <MembersPage members={members} onAddMember={addMember} onUpdateMember={updateMember} />}
          {activeView === 'readings' && (
            <WaterReadingsPage 
              members={members} dues={dues} 
              onAddDues={addDues} onSyncDues={replaceMonthlyDues} 
              onDeleteDue={deleteDue}
              onDeleteMultipleDues={deleteMultipleDues}
              waterPrice={waterPrice} setWaterPrice={setWaterPrice}
              serviceFee={serviceFee} setServiceFee={setServiceFee}
            />
          )}
          {activeView === 'financials' && (
            <FinancialsPage 
              dues={dues} expenses={expenses} 
              onUpdateExpenseStatus={(id, s) => setExpenses(prev => prev.map(e => e.id === id ? {...e, status: s} : e))}
              onAddExpense={addExpense} onUpdateDueStatus={updateDueStatus}
              onDeleteDue={deleteDue}
              onDeleteMultipleDues={deleteMultipleDues}
            />
          )}
          {activeView === 'calendar' && <CalendarPage meetings={meetings} onAddMeeting={addMeeting} />}
          {activeView === 'backup' && <BackupPage data={{members, dues, expenses, meetings}} onRestore={d => {
            setMembers(d.members); setDues(d.dues); setExpenses(d.expenses); setMeetings(d.meetings);
            window.location.reload();
          }} />}
        </div>
      </main>
    </div>
  );
};

export default App;
