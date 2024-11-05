import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; 

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [groupBy, setGroupBy] = useState(localStorage.getItem('groupBy') || 'status');
  const [sortBy, setSortBy] = useState(localStorage.getItem('sortBy') || 'priority');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets', error);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    localStorage.setItem('groupBy', groupBy);
    localStorage.setItem('sortBy', sortBy);
  }, [groupBy, sortBy]);

  const groupTickets = (tickets, groupBy) => {
    const grouped = {};

    tickets.forEach(ticket => {
      const key = ticket[groupBy] || 'Unassigned';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(ticket);
    });

    return Object.keys(grouped).map(key => ({
      title: key,
      tickets: grouped[key],
    }));
  };

  // Sort tickets within each group based on the selected sorting option
  const sortedGroups = groupTickets(tickets, groupBy).map(group => {
    const sortedTickets = [...group.tickets].sort((a, b) => {
      if (sortBy === 'priority') return b.priority - a.priority;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
    return { ...group, tickets: sortedTickets };
  });

  return (
    <div className="kanban-board">
      {/* Display options for grouping and sorting */}
      <div className="display-options">
        <label>Group by:</label>
        <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="status">Status</option>
          <option value="user">User</option>
          <option value="priority">Priority</option>
        </select>
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="priority">Priority</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Render columns */}
      <div className="columns">
        {sortedGroups.map((group, index) => (
          <Column key={index} title={group.title} tickets={group.tickets} />
        ))}
      </div>
    </div>
  );
};

// Column component to display each group of tickets
const Column = ({ title, tickets }) => (
  <div className="column">
    <div className="column-header">{title}</div>
    {tickets.map((ticket) => (
      <Ticket key={ticket.id} ticket={ticket} />
    ))}
  </div>
);

// Ticket component to display individual tickets
const Ticket = ({ ticket }) => (
  <div className="ticket">
    <div className="ticket-title">{ticket.title}</div>
    <div className="ticket-details">{ticket.type}</div>
    <div className={`ticket-priority priority-${getPriorityClass(ticket.priority)}`}>
      {getPriorityLabel(ticket.priority)}
    </div>
  </div>
);

// Helper functions to map priority level to CSS class and label
const getPriorityClass = (priority) => {
  switch (priority) {
    case 4: return 'urgent';
    case 3: return 'high';
    case 2: return 'medium';
    case 1: return 'low';
    default: return 'none';
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 4: return 'Urgent';
    case 3: return 'High';
    case 2: return 'Medium';
    case 1: return 'Low';
    default: return 'No Priority';
  }
};

export default KanbanBoard;

