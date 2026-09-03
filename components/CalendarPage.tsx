import React, { useState } from 'react';
import { Meeting } from '../types';
import { PlusIcon } from './Icons';
import Modal from './common/Modal';


const MeetingForm: React.FC<{ onSave: (meeting: Omit<Meeting, 'id' | 'attendees' | 'minutes'>) => void, onClose: () => void }> = ({ onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [agenda, setAgenda] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date || !agenda) return;
        onSave({ title, date, agenda });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Título da Reunião</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Pauta / Descrição</label>
                <textarea value={agenda} onChange={(e) => setAgenda(e.target.value)} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Agendar Reunião</button>
            </div>
        </form>
    );
};

const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface CalendarPageProps {
  meetings: Meeting[];
  onAddMeeting: (meetingData: Omit<Meeting, 'id' | 'attendees' | 'minutes'>) => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ meetings, onAddMeeting }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const meetingsByDate = meetings.reduce((acc, meeting) => {
    const date = new Date(meeting.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="p-6">
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Agendar Nova Reunião">
        <MeetingForm onSave={onAddMeeting} onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Calendário e Reuniões</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">
            <PlusIcon className="w-5 h-5" />
            Nova Reunião
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&lt;</button>
          <h2 className="text-xl font-semibold">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map(d => <div key={d} className="font-bold text-gray-600 py-2">{d}</div>)}
          {calendarDays.map((d, i) => {
            const isToday = d.toDateString() === new Date().toDateString();
            const isCurrentMonth = d.getMonth() === currentDate.getMonth();
            const meetingsOnDay = meetingsByDate[d.toDateString()] || [];
            return (
              <div key={i} className={`border rounded-md p-2 h-28 flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}>
                <span className={`self-end text-sm ${isToday ? 'bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''} ${!isCurrentMonth ? 'text-gray-400' : ''}`}>
                  {d.getDate()}
                </span>
                <div className="text-left text-xs mt-1 space-y-1 overflow-y-auto">
                    {meetingsOnDay.map(m => (
                        <div key={m.id} className="bg-emerald-100 text-emerald-800 p-1 rounded">
                            {m.title}
                        </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
