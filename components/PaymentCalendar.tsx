import React, { useState } from 'react';
import { MembershipDue, PaymentStatus } from '../types';

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PaymentStatusBadgeSmall: React.FC<{ status: PaymentStatus }> = ({ status }) => {
    const baseClasses = 'px-1.5 py-0.5 text-[10px] font-semibold rounded-full leading-tight';
    const statusClasses = {
      [PaymentStatus.Pago]: 'bg-green-100 text-green-800',
      [PaymentStatus.Pendente]: 'bg-blue-100 text-blue-800',
      [PaymentStatus.Atrasado]: 'bg-red-100 text-red-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};


interface PaymentCalendarProps {
    dues: MembershipDue[];
}

export const PaymentCalendar: React.FC<PaymentCalendarProps> = ({ dues }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const calendarDays = [];
  let day = new Date(startDate);

  while (day <= endDate) {
    calendarDays.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const duesByDate = dues.reduce((acc, due) => {
    const [year, month, day] = due.dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day).toDateString();
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(due);
    return acc;
  }, {} as Record<string, MembershipDue[]>);


  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
       <h2 className="text-2xl font-bold text-gray-800 mb-4">Calendário de Pagamentos</h2>
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&lt;</button>
        <h3 className="text-xl font-semibold">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map(d => <div key={d} className="font-bold text-gray-600 py-2 text-sm">{d}</div>)}
        {calendarDays.map((d, i) => {
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();
          const duesOnDay = duesByDate[d.toDateString()] || [];
          return (
            <div key={i} className={`border rounded-md p-2 h-32 flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
              <span className={`self-start text-sm font-medium ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                {d.getDate()}
              </span>
              <div className="text-left text-xs mt-1 space-y-1 overflow-y-auto">
                  {duesOnDay.map(due => (
                      <div key={due.id} className="text-gray-800 bg-gray-100 p-1 rounded-md">
                        <div className='flex justify-between items-center'>
                            <span className="text-xs truncate font-medium">{due.memberName.split(' ')[0]}</span>
                            <PaymentStatusBadgeSmall status={due.status} />
                        </div>
                      </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-4 flex items-center justify-end space-x-4 text-sm">
            <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-100 border border-green-300 mr-2"></span>
                <span>Pago</span>
            </div>
            <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-2"></span>
                <span>Pendente</span>
            </div>
             <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-100 border border-red-300 mr-2"></span>
                <span>Atrasado</span>
            </div>
        </div>
    </div>
  );
};
