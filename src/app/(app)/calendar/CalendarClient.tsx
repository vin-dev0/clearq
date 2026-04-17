"use client";

import React, { useState, useMemo } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  subDays,
  addWeeks,
  subWeeks,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, Video, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/actions/calendar";

type ViewMode = "MONTH" | "WEEK" | "DAY";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: "meeting" | "review" | "development" | "other";
  time: string;
}

const typeStyles = {
  meeting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  development: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  other: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function CalendarClient({ initialEvents = [] }: { initialEvents?: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("MONTH");
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    return initialEvents.map(e => ({
      ...e,
      date: new Date(e.date)
    }));
  });

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "meeting" as "meeting" | "review" | "development" | "other",
    date: format(new Date(), "yyyy-MM-dd"),
    timeStart: "10:00",
    timeEnd: "11:00"
  });

  const handleCreateEvent = async () => {
    if (!newEvent.title) return;
    const [year, month, day] = newEvent.date.split('-').map(Number);
    const [hour, minute] = newEvent.timeStart.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hour, minute);

    let [endHour, endMinute] = newEvent.timeEnd.split(':').map(Number);
    const ampmStart = hour >= 12 ? 'PM' : 'AM';
    const ampmEnd = endHour >= 12 ? 'PM' : 'AM';
    const fmtHr = (h: number) => h > 12 ? h - 12 : h === 0 ? 12 : h;
    const timeStr = `${fmtHr(hour).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampmStart} - ${fmtHr(endHour).toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')} ${ampmEnd}`;

    try {
      const created = await createCalendarEvent({
        title: newEvent.title,
        type: newEvent.type,
        date: dateObj,
        time: timeStr,
      });

      const nEvent: CalendarEvent = {
        id: created.id,
        title: created.title,
        type: created.type as any,
        date: new Date(created.date),
        time: created.time,
      };

      setEvents([...events, nEvent]);
      setIsAddEventOpen(false);
      setNewEvent({ ...newEvent, title: "" });
    } catch (err) {
      console.error("Failed to save calendar event", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteCalendarEvent(id);
      setEvents(events.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  // Navigation Logic
  const handlePrev = () => {
    if (viewMode === "MONTH") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "WEEK") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "MONTH") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "WEEK") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month View Days
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Week View Days
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const timeSlots = Array.from({ length: 24 }).map((_, i) => `${i.toString().padStart(2, '0')}:00`);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Calendar</h1>
            <p className="text-sm text-zinc-400">Schedule and manage team events</p>
          </div>
          <div className="flex rounded-lg bg-zinc-900/80 p-1 border border-zinc-800">
            {(["MONTH", "WEEK", "DAY"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                  viewMode === mode 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {mode.charAt(0) + mode.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4 bg-zinc-900/50 rounded-full border border-zinc-800 p-1">
            <button onClick={handlePrev} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={handleToday} className="px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
              Today
            </button>
            <button onClick={handleNext} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <h2 className="text-lg font-medium min-w-[140px] text-zinc-200">
            {viewMode === "MONTH" 
              ? format(currentDate, "MMMM yyyy") 
              : viewMode === "WEEK" 
                ? `${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`
                : format(currentDate, "MMMM d, yyyy")
            }
          </h2>
          <div className="w-px h-6 bg-zinc-800 mx-2"></div>
          <button 
            onClick={() => setIsAddEventOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition-all hover:shadow-teal-500/40 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New Event
          </button>
        </div>
      </header>

      {/* Main Calendar Render */}
      <main className="flex-1 overflow-auto p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {viewMode === "MONTH" && (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col min-h-[600px] border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/20 backdrop-blur-sm"
            >
              {/* Day Labels */}
              <div className="grid grid-cols-7 border-b border-zinc-800/80 bg-zinc-900/80">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              {/* Grid */}
              <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-zinc-800/20 gap-px">
                {monthDays.map((day, i) => {
                  const dayEvents = events.filter(e => isSameDay(e.date, day));
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div 
                      key={day.toISOString() + i} 
                      className={cn(
                        "bg-zinc-950 p-2 min-h-[100px] hover:bg-zinc-900/60 transition-colors group relative",
                        !isCurrentMonth && "opacity-40"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
                          isToday ? "bg-teal-500 text-white" : "text-zinc-300"
                        )}>
                          {format(day, 'd')}
                        </span>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-zinc-300">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        {dayEvents.map(evt => (
                          <div 
                            key={evt.id} 
                            onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                            className={cn(
                              "px-2 py-1 text-[10px] rounded border truncate cursor-pointer hover:brightness-110",
                              typeStyles[evt.type]
                            )}
                            title={`${evt.time} - ${evt.title}`}
                          >
                            <span className="font-semibold mr-1">{evt.time.split(' ')[0]}</span>
                            {evt.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {viewMode === "WEEK" && (
            <motion.div
              key="week"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col min-h-[600px] border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/20 backdrop-blur-sm"
            >
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-zinc-800/80 bg-zinc-900/80">
                <div className="py-3 text-center text-xs font-medium text-zinc-600 border-r border-zinc-800/80">Time</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className={cn("py-3 text-center border-r border-zinc-800/80", isSameDay(day, new Date()) && "bg-teal-500/10")}>
                    <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{format(day, 'EEE')}</div>
                    <div className={cn("text-lg font-bold mt-1", isSameDay(day, new Date()) ? "text-teal-400" : "text-zinc-300")}>{format(day, 'd')}</div>
                  </div>
                ))}
              </div>
              {/* Grid with Time slots */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-8 min-h-[800px] relative">
                  <div className="flex flex-col border-r border-zinc-800/50">
                    {timeSlots.map(time => (
                      <div key={time} className="h-16 border-b border-zinc-800/30 flex items-start justify-center pt-2">
                        <span className="text-[10px] text-zinc-600 font-medium">{time}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Columns */}
                  {weekDays.map(day => {
                    const dayEvents = events.filter(e => isSameDay(e.date, day));
                    
                    return (
                      <div key={day.toISOString()} className={cn("border-r border-zinc-800/50 relative border-b border-zinc-800/30", isSameDay(day, new Date()) && "bg-teal-500/5")}>
                         {/* Time Grid Lines */}
                         {timeSlots.map(time => (
                          <div key={time} className="h-16 border-b border-zinc-800/10 w-full" />
                         ))}
                         
                         {/* Render Events */}
                         {dayEvents.map(evt => {
                           // Calculate top position based on hour map
                           const hour = evt.date.getHours();
                           const minute = evt.date.getMinutes();
                           const top = (hour * 64) + ((minute / 60) * 64);
                           
                           return (
                             <div 
                              key={evt.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                              className={cn(
                                "absolute w-[90%] left-[5%] rounded-md border p-1 shadow-md overflow-hidden cursor-pointer hover:brightness-110 z-10 transition-all",
                                typeStyles[evt.type]
                              )}
                              style={{ top: `${top}px`, height: '60px' }} // default 1hr height
                             >
                                <div className="text-[10px] font-bold opacity-80">{evt.time}</div>
                                <div className="text-xs font-semibold truncate leading-tight mt-0.5">{evt.title}</div>
                             </div>
                           );
                         })}
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === "DAY" && (
            <motion.div
              key="day"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col min-h-[600px] border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/20 backdrop-blur-sm"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-[100px_1fr] relative">
                  <div className="flex flex-col border-r border-zinc-800/80 bg-zinc-900/50">
                    {timeSlots.map(time => (
                      <div key={time} className="h-24 border-b border-zinc-800/30 flex items-start justify-end pr-4 pt-2">
                        <span className="text-xs text-zinc-500 font-medium">{time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    {/* Time Grid Lines */}
                    {timeSlots.map(time => (
                      <div key={time} className="h-24 border-b border-zinc-800/10 w-full group relative">
                        <div 
                          onClick={() => {
                            setNewEvent({...newEvent, timeStart: time, timeEnd: time.replace(/\\d+/, (m) => (parseInt(m) + 1).toString().padStart(2, '0')) });
                            setIsAddEventOpen(true);
                          }}
                          className="absolute inset-0 bg-transparent hover:bg-zinc-800/20 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <span className="text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-zinc-800"><Plus className="w-3 h-3"/> Add Event</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Day Events */}
                    {events.filter(e => isSameDay(e.date, currentDate)).map(evt => {
                       const hour = evt.date.getHours();
                       const minute = evt.date.getMinutes();
                       const top = (hour * 96) + ((minute / 60) * 96);
                       
                       return (
                         <div 
                          key={evt.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                          className={cn(
                            "absolute w-[96%] left-[2%] rounded-lg border p-4 shadow-lg cursor-pointer hover:brightness-110 z-10 transition-all flex flex-col",
                            typeStyles[evt.type]
                          )}
                          style={{ top: `${top}px`, minHeight: '88px' }} // 1 hour block minimum
                         >
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-base">{evt.title}</h3>
                              <div className="flex items-center gap-1 text-xs opacity-80 bg-black/20 px-2 py-1 rounded">
                                <Clock className="w-3 h-3" />
                                {evt.time}
                              </div>
                            </div>
                            <div className="mt-auto pt-4 flex justify-end items-center">
                              {evt.type === 'meeting' && (
                                <button className="flex items-center gap-1 text-[10px] uppercase font-bold bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors">
                                  <Video className="w-3 h-3" /> Join
                                </button>
                              )}
                            </div>
                         </div>
                       );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Event Modal */}
      <AnimatePresence>
        {isAddEventOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">Create New Event</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="e.g. Brainstorming Session"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="review">Review</option>
                    <option value="development">Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newEvent.timeStart}
                      onChange={e => setNewEvent({...newEvent, timeStart: e.target.value})}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="text-xs font-medium text-zinc-300 block mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEvent.timeEnd}
                      onChange={e => setNewEvent({...newEvent, timeEnd: e.target.value})}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title}
                  className="flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 py-2 text-sm font-medium text-white transition-all hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Event Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[400px] rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden"
            >
              <div className={cn("p-6 border-b border-zinc-800/80 border-t-4", 
                selectedEvent.type === "meeting" && "border-t-blue-500 bg-blue-500/5",
                selectedEvent.type === "review" && "border-t-amber-500 bg-amber-500/5",
                selectedEvent.type === "development" && "border-t-emerald-500 bg-emerald-500/5",
                selectedEvent.type === "other" && "border-t-zinc-500 bg-zinc-500/5",
              )}>
                <h3 className="text-xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium font-mono">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  {format(selectedEvent.date, "EEEE, MMMM do yyyy")}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1 font-mono">
                  <div className="w-4" /> {/* Spacer */}
                  {selectedEvent.time}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-3 justify-end pt-2">
                   <button 
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
                   >
                     Delete Event
                   </button>
                   <button 
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-2 text-sm font-medium text-zinc-900 bg-white rounded-lg transition-colors hover:bg-zinc-200 shadow-lg shadow-white/10"
                   >
                     Close
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #27272a;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #3f3f46;
        }
      `}} />
    </div>
  );
}
