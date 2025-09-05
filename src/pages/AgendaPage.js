import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import '../styles/AgendaPage.css';

const localizer = momentLocalizer(moment);

const AgendaPage = ({ tasks, onTaskUpdated, onTaskDeleted, loadTasks }) => {
  const [currentView, setCurrentView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Convert tasks to calendar events
  const events = useMemo(() => {
    return tasks
      .filter(task => task.scheduled_date)
      .map(task => {
        const date = new Date(task.scheduled_date);
        let start, end;

        if (task.has_specific_time && task.scheduled_start_time && task.scheduled_end_time) {
          // Parse time strings (HH:MM format)
          const [startHour, startMinute] = task.scheduled_start_time.split(':').map(Number);
          const [endHour, endMinute] = task.scheduled_end_time.split(':').map(Number);
          
          start = new Date(date);
          start.setHours(startHour, startMinute, 0, 0);
          
          end = new Date(date);
          end.setHours(endHour, endMinute, 0, 0);
        } else if (task.duration_hours || task.duration_minutes) {
          // Duration-based task - default to 9 AM start
          start = new Date(date);
          start.setHours(9, 0, 0, 0);
          
          end = new Date(start);
          const durationMs = ((task.duration_hours || 0) * 60 + (task.duration_minutes || 0)) * 60 * 1000;
          end.setTime(end.getTime() + durationMs);
        } else {
          // All-day event
          start = new Date(date);
          start.setHours(0, 0, 0, 0);
          
          end = new Date(date);
          end.setHours(23, 59, 59, 999);
        }

        return {
          id: task.id,
          title: task.title,
          start,
          end,
          resource: task,
          allDay: !task.has_specific_time,
        };
      });
  }, [tasks]);

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setShowTaskForm(true);
  };

  const handleSelectEvent = (event) => {
    // Handle event click - could show task details or edit form
    console.log('Selected event:', event);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleTaskCreated = () => {
    setShowTaskForm(false);
    setSelectedSlot(null);
    loadTasks();
  };

  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setSelectedSlot(null);
  };

  const eventStyleGetter = (event) => {
    const task = event.resource;
    const importance = task.importance || 'medium';
    
    const colors = {
      critical: { backgroundColor: '#dc2626', borderColor: '#b91c1c' },
      high: { backgroundColor: '#ea580c', borderColor: '#c2410c' },
      medium: { backgroundColor: '#d97706', borderColor: '#b45309' },
      low: { backgroundColor: '#16a34a', borderColor: '#15803d' },
    };

    const style = {
      backgroundColor: colors[importance]?.backgroundColor || colors.medium.backgroundColor,
      borderColor: colors[importance]?.borderColor || colors.medium.borderColor,
      borderRadius: '4px',
      border: 'none',
      color: 'white',
      fontSize: '12px',
      opacity: task.completed ? 0.6 : 1,
      textDecoration: task.completed ? 'line-through' : 'none',
    };

    return { style };
  };

  const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    return (
      <div className="calendar-toolbar">
        <div className="toolbar-navigation">
          <button 
            onClick={() => onNavigate('PREV')}
            className="nav-button"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="calendar-title">{label}</h2>
          <button 
            onClick={() => onNavigate('NEXT')}
            className="nav-button"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="toolbar-actions">
          <button
            onClick={() => onNavigate('TODAY')}
            className="today-button"
          >
            Today
          </button>
          
          <div className="view-buttons">
            {['month', 'week', 'day', 'agenda'].map((viewName) => (
              <button
                key={viewName}
                onClick={() => onView(viewName)}
                className={`view-button ${view === viewName ? 'active' : ''}`}
              >
                {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowTaskForm(true)}
            className="add-task-button"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="agenda-container">
      {/* Header */}
      <div className="agenda-header">
        <div className="header-content">
          <div className="header-title">
            <CalendarIcon size={24} className="title-icon" />
            <div>
              <h1>Agenda</h1>
              <p>Manage your schedule and tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="task-form-overlay">
          <div className="task-form-modal">
            <div className="modal-header">
              <h3>Create New Task</h3>
              <button 
                onClick={handleCancelTaskForm}
                className="close-button"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <TaskForm
                onTaskCreated={handleTaskCreated}
                onCancel={handleCancelTaskForm}
                initialDate={selectedSlot ? moment(selectedSlot.start).format('YYYY-MM-DD') : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 200px)' }}
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar,
          }}
          messages={{
            allDay: 'All Day',
            previous: 'Previous',
            next: 'Next',
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Task',
            noEventsInRange: 'No tasks scheduled for this period.',
            showMore: total => `+${total} more`,
          }}
          formats={{
            timeGutterFormat: 'HH:mm',
            eventTimeRangeFormat: ({ start, end }) => {
              return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
            },
            agendaTimeRangeFormat: ({ start, end }) => {
              return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
            },
          }}
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
          max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
        />
      </div>
    </div>
  );
};

export default AgendaPage;