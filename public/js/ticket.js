const ticketDetails = document.getElementById('ticket-details');

const getTicketDetails = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');

  if (ticketId) {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const ticket = await res.json();
        ticketDetails.innerHTML = `
          <p><strong>Order Number:</strong> ${ticket.orderNumber}</p>
          <p><strong>Menu:</strong> ${ticket.menu}</p>
          <p><strong>Table:</strong> ${ticket.table}</p>
          <p><strong>Waiter:</strong> ${ticket.waiter}</p>
          <p><strong>Date:</strong> ${new Date(ticket.createdAt).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(ticket.createdAt).toLocaleTimeString()}</p>
        `;
      } else {
        console.error('Failed to fetch ticket');
        ticketDetails.innerHTML = '<p>Ticket not found</p>';
      }
    } catch (err) {
      console.error(err);
      ticketDetails.innerHTML = '<p>Error loading ticket</p>';
    }
  } else {
    ticketDetails.innerHTML = '<p>No ticket ID provided</p>';
  }
};

getTicketDetails();
