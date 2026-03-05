import React, { useState } from 'react';
import { useStore, Reservation, TableSlot } from '../context/StoreContext';
import { Clock, Users, Calendar, Plus, Trash2, Edit2, CheckCircle, XCircle, Armchair, Settings, Save, Info, Utensils, MessageSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function DineInPage() {
  const { 
    reservations, updateReservation, 
    tableSlots, addTableSlot, updateTableSlot, deleteTableSlot,
    restaurantSettings, updateRestaurantSettings 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'reservations' | 'tables' | 'settings'>('reservations');
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTable, setNewTable] = useState({ name: '', capacity: 2 });
  const [editingTable, setEditingTable] = useState<TableSlot | null>(null);
  
  // Calendar state
  const [viewingCalendarTable, setViewingCalendarTable] = useState<TableSlot | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);

  // Assignment Modal State
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null);
  const [assignmentDate, setAssignmentDate] = useState('');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  
  // Settings state
  const [settingsForm, setSettingsForm] = useState(restaurantSettings);

  // Reservation filters
  const [reservationFilter, setReservationFilter] = useState<'All' | 'Pending' | 'Confirmed'>('All');

  const filteredReservations = reservations
    .filter(res => reservationFilter === 'All' || res.status === reservationFilter)
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  const generateTimeSlots = () => {
    const slots = [];
    const start = parseInt(restaurantSettings.openingTime.split(':')[0]);
    let end = parseInt(restaurantSettings.closingTime.split(':')[0]);
    
    // Handle closing time next day (e.g., 01:00) or just standard
    if (end < start) end += 24;

    for (let i = start; i < end; i++) {
      const startHour = i % 24;
      const endHour = (i + 1) % 24;
      const startTime = `${startHour.toString().padStart(2, '0')}:00`;
      const endTime = `${endHour.toString().padStart(2, '0')}:00`;
      slots.push({ start: startTime, end: endTime, startHour });
    }
    return slots;
  };

  const getSlotBooking = (tableId: string, date: string, slotStartHour: number) => {
    return reservations.find(res => {
      if (res.tableId !== tableId || res.date !== date || res.status !== 'Confirmed') return false;
      const resStart = parseInt(res.time.split(':')[0]);
      const resEnd = resStart + (res.duration || 1);
      return slotStartHour >= resStart && slotStartHour < resEnd;
    });
  };

  const isSlotAvailable = (tableId: string, date: string, hour: number) => {
    const booking = getSlotBooking(tableId, date, hour);
    // If there is a booking, it's not available unless it's the current reservation we are editing
    if (booking && booking.id !== assigningReservation?.id) return false;
    return true;
  };

  const handleAddTable = () => {
    if (newTable.name && newTable.capacity > 0) {
      addTableSlot({ ...newTable, isAvailable: true });
      setNewTable({ name: '', capacity: 2 });
      setShowAddTableModal(false);
    }
  };

  const handleUpdateTable = () => {
    if (editingTable && editingTable.name && editingTable.capacity > 0) {
      updateTableSlot(editingTable.id, { name: editingTable.name, capacity: editingTable.capacity });
      setEditingTable(null);
    }
  };

  const handleAssignTable = () => {
    if (!assigningReservation || !selectedTableId || selectedSlots.length === 0) return;
    
    const sortedSlots = [...selectedSlots].sort();
    const startTime = sortedSlots[0];
    const duration = sortedSlots.length;

    updateReservation(assigningReservation.id, { 
      tableId: selectedTableId, 
      date: assignmentDate,
      time: startTime,
      duration: duration,
      status: 'Confirmed' 
    });
    setAssigningReservation(null);
  };

  const openAssignmentModal = (res: Reservation) => {
    setAssigningReservation(res);
    setAssignmentDate(res.date);
    setSelectedTableId(res.tableId || null);
    
    // Pre-select slots based on current reservation
    const startHour = parseInt(res.time.split(':')[0]);
    const duration = res.duration || 1;
    const slots = [];
    for(let i=0; i<duration; i++) {
        slots.push(`${(startHour + i).toString().padStart(2, '0')}:00`);
    }
    setSelectedSlots(slots);
  };

  const toggleSlotSelection = (time: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time];
      }
    });
  };

  const handleStatusChange = (id: string, status: Reservation['status']) => {
    updateReservation(id, { status });
  };

  const handleSaveSettings = () => {
    updateRestaurantSettings(settingsForm);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0a192f]">Dine-in Management</h1>
        <p className="text-gray-500 mt-1">Manage reservations, tables, and restaurant timings</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reservations')}
          className={clsx(
            "pb-3 px-1 font-medium text-sm transition-colors relative",
            activeTab === 'reservations' ? "text-[#0a192f]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Reservations
          {activeTab === 'reservations' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a192f]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={clsx(
            "pb-3 px-1 font-medium text-sm transition-colors relative",
            activeTab === 'tables' ? "text-[#0a192f]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Tables & Layout
          {activeTab === 'tables' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a192f]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={clsx(
            "pb-3 px-1 font-medium text-sm transition-colors relative",
            activeTab === 'settings' ? "text-[#0a192f]" : "text-gray-500 hover:text-gray-700"
          )}
        >
          Settings
          {activeTab === 'settings' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0a192f]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {['All', 'Pending', 'Confirmed'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setReservationFilter(filter as any)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                      reservationFilter === filter 
                        ? "bg-[#0a192f] text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Guests</th>
                    <th className="px-6 py-4">Table</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#0a192f]">{res.customerName}</div>
                          <div className="text-xs text-gray-500">{res.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1.5 text-gray-400" />
                            {res.date}
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1.5 text-gray-400" />
                            {res.time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-3 w-3 mr-1.5 text-gray-400" />
                            {res.guests}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {res.status === 'Confirmed' && res.tableId ? (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tableSlots.find(t => t.id === res.tableId)?.name || 'Unknown Table'}
                              </span>
                              <button 
                                onClick={() => openAssignmentModal(res)}
                                className="text-xs text-gray-400 hover:text-[#0a192f]"
                                title="Change Table"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openAssignmentModal(res)}
                              className="px-3 py-1.5 text-xs font-medium bg-[#0a192f] text-white rounded-lg hover:bg-[#152a45] transition-colors flex items-center shadow-sm"
                            >
                              Assign Table
                              <Armchair className="h-3 w-3 ml-1.5" />
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium",
                            res.status === 'Confirmed' ? "bg-green-100 text-green-800" :
                            res.status === 'Pending' ? "bg-yellow-100 text-yellow-800" :
                            res.status === 'Cancelled' ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          )}>
                            {res.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {res.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusChange(res.id, 'Confirmed')}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Confirm"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleStatusChange(res.id, 'Cancelled')}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Cancel"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        No reservations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddTableModal(true)}
                className="flex items-center px-4 py-2 bg-[#0a192f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tableSlots.map((table) => (
                <div key={table.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingTable(table)}
                      className="p-1 text-gray-400 hover:text-[#0a192f]"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteTableSlot(table.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Armchair className="h-8 w-8 text-[#c5a059]" />
                    </div>
                    <h3 className="font-bold text-lg text-[#0a192f]">{table.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{table.capacity} Seats</p>
                    <span className={clsx(
                      "mt-3 px-2 py-1 rounded text-xs font-medium",
                      table.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                      {table.isAvailable ? 'Available' : 'Occupied'}
                    </span>
                    
                    <button
                      onClick={() => {
                        setViewingCalendarTable(table);
                        setCalendarDate(new Date().toISOString().split('T')[0]);
                      }}
                      className="mt-4 text-sm text-[#0a192f] hover:text-[#c5a059] font-medium flex items-center transition-colors"
                    >
                      <Calendar className="h-4 w-4 mr-1.5" />
                      View Calendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-xl">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#0a192f] mb-6 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Restaurant Timings
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={settingsForm.openingTime}
                        onChange={(e) => setSettingsForm({ ...settingsForm, openingTime: e.target.value })}
                        className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                      />
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        value={settingsForm.closingTime}
                        onChange={(e) => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
                        className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                      />
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center px-6 py-2 bg-[#0a192f] text-white rounded-lg hover:bg-[#152a45] transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Table Modal */}
      {(showAddTableModal || editingTable) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-[#0a192f] px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-serif text-xl font-bold">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <button 
                onClick={() => { setShowAddTableModal(false); setEditingTable(null); }}
                className="text-white/70 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Table Name/Number</label>
                <input
                  type="text"
                  value={editingTable ? editingTable.name : newTable.name}
                  onChange={(e) => editingTable 
                    ? setEditingTable({ ...editingTable, name: e.target.value })
                    : setNewTable({ ...newTable, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                  placeholder="e.g., Table 5, Booth B"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (Guests)</label>
                <input
                  type="number"
                  min="1"
                  value={editingTable ? editingTable.capacity : newTable.capacity}
                  onChange={(e) => editingTable
                    ? setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) })
                    : setNewTable({ ...newTable, capacity: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => { setShowAddTableModal(false); setEditingTable(null); }}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTable ? handleUpdateTable : handleAddTable}
                  className="px-4 py-2 rounded-lg bg-[#0a192f] text-white hover:bg-[#152a45] transition-colors shadow-md"
                >
                  {editingTable ? 'Update Table' : 'Add Table'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assignment Modal */}
      {assigningReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="bg-[#0a192f] px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-white font-serif text-xl font-bold">
                  Assign Table
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {assigningReservation.customerName} • {assigningReservation.guests} Guests
                </p>
              </div>
              <button 
                onClick={() => setAssigningReservation(null)}
                className="text-white/70 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Sidebar: Date & Requirements */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Date Picker */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={assignmentDate}
                        onChange={(e) => setAssignmentDate(e.target.value)}
                        className="w-full pl-10 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none bg-white font-medium text-gray-700"
                      />
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Customer Requirements */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Requirements
                    </h3>
                    
                    {assigningReservation.specialRequests && (
                      <div className="mb-3 last:mb-0">
                        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1 flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Special Requests
                        </div>
                        <p className="text-sm text-amber-900 bg-white/50 p-2 rounded border border-amber-200/50">
                          {assigningReservation.specialRequests}
                        </p>
                      </div>
                    )}

                    {assigningReservation.dietaryRestrictions && (
                      <div className="mb-3 last:mb-0">
                        <div className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1 flex items-center">
                          <Utensils className="h-3 w-3 mr-1" />
                          Dietary
                        </div>
                        <p className="text-sm text-amber-900 bg-white/50 p-2 rounded border border-amber-200/50">
                          {assigningReservation.dietaryRestrictions}
                        </p>
                      </div>
                    )}

                    {!assigningReservation.specialRequests && !assigningReservation.dietaryRestrictions && (
                      <p className="text-sm text-amber-800/60 italic">No special requirements noted.</p>
                    )}
                  </div>
                </div>

                {/* Table Selection */}
                <div className="lg:col-span-5">
                  <h3 className="text-sm font-bold text-[#0a192f] mb-4 flex items-center">
                    <Armchair className="h-4 w-4 mr-2" />
                    1. Select a Table
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tableSlots.map((table) => {
                      const isCapacitySufficient = table.capacity >= assigningReservation.guests;
                      const isSelected = selectedTableId === table.id;
                      
                      return (
                        <div 
                          key={table.id}
                          onClick={() => {
                            setSelectedTableId(table.id);
                          }}
                          className={clsx(
                            "relative p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all cursor-pointer",
                            isSelected 
                              ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" 
                              : "bg-white border-gray-200 hover:border-[#0a192f]"
                          )}
                        >
                          <div className={clsx("p-3 rounded-full mb-3", 
                            isCapacitySufficient ? "bg-green-100" : "bg-yellow-100"
                          )}>
                            <Armchair className={clsx("h-6 w-6", 
                              isCapacitySufficient ? "text-green-600" : "text-yellow-600"
                            )} />
                          </div>
                          
                          <h4 className="font-bold text-[#0a192f]">{table.name}</h4>
                          <div className="flex items-center text-sm text-gray-500 mt-1 mb-2">
                            <Users className="h-3 w-3 mr-1" />
                            {table.capacity} Seats
                          </div>

                          {!isCapacitySufficient && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                              Too Small
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slot Selection */}
                <div className="lg:col-span-4">
                  <h3 className="text-sm font-bold text-[#0a192f] mb-4 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    2. Select Time Slots
                  </h3>
                  
                  {!selectedTableId ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-8">
                      <Armchair className="h-12 w-12 mb-2 opacity-20" />
                      <p>Please select a table first</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                      {generateTimeSlots().map((slot) => {
                        const isAvailable = isSlotAvailable(selectedTableId, assignmentDate, slot.startHour);
                        const isSelected = selectedSlots.includes(slot.start);
                        
                        return (
                          <button
                            key={slot.start}
                            disabled={!isAvailable}
                            onClick={() => toggleSlotSelection(slot.start)}
                            className={clsx(
                              "py-2 px-1 rounded-lg text-xs font-medium border transition-all",
                              !isAvailable 
                                ? "bg-red-50 border-red-100 text-red-400 cursor-not-allowed"
                                : isSelected
                                  ? "bg-[#0a192f] border-[#0a192f] text-white shadow-md transform scale-105"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#0a192f] hover:text-[#0a192f]"
                            )}
                          >
                            {slot.start}
                            {!isAvailable && <span className="block text-[10px] opacity-75">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {selectedSlots.length > 0 && (
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-blue-800 font-medium">Selected Slots:</span>
                        <span className="text-sm font-bold text-blue-900">{selectedSlots.length} hours</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedSlots.sort().map(time => (
                          <span key={time} className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-200">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => setAssigningReservation(null)}
                className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTable}
                disabled={!selectedTableId || selectedSlots.length === 0}
                className="px-6 py-2 rounded-lg bg-[#0a192f] text-white hover:bg-[#152a45] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Confirm Assignment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Calendar Modal */}
      {viewingCalendarTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="bg-[#0a192f] px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-white font-serif text-xl font-bold">
                  {viewingCalendarTable.name} - Calendar
                </h2>
                <p className="text-white/70 text-sm mt-0.5">
                  Capacity: {viewingCalendarTable.capacity} Guests
                </p>
              </div>
              <button 
                onClick={() => setViewingCalendarTable(null)}
                className="text-white/70 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#c5a059] focus:border-transparent outline-none"
                />
              </div>

              <div className="space-y-3">
                {generateTimeSlots().map((slot, index) => {
                  const booking = getSlotBooking(viewingCalendarTable.id, calendarDate, slot.startHour);
                  const isBooked = !!booking;
                  
                  return (
                    <div 
                      key={index} 
                      className={clsx(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        isBooked 
                          ? "bg-red-50 border-red-100" 
                          : "bg-green-50 border-green-100 hover:bg-green-100"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-600 font-medium w-32">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {slot.start} - {slot.end}
                        </div>
                        {isBooked ? (
                          <div>
                            <div className="font-medium text-red-800">Booked</div>
                            <div className="text-xs text-red-600 mt-0.5">
                              {booking.customerName} ({booking.guests} guests)
                            </div>
                            <div className="text-xs text-red-500">
                              {booking.customerPhone}
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium text-green-800">Available</div>
                        )}
                      </div>
                      
                      {isBooked ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Reserved
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Open
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}