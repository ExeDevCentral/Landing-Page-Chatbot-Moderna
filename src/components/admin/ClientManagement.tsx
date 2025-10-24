import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

interface Client {
  _id: string;
  nickname: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  preferences?: string;
  contactHours?: string;
}

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState({
    nickname: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    preferences: '',
    contactHours: ''
  });

  useEffect(() => {
    // Fetch clients from the API
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        const data = await response.json();
        setClients(data.data.clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newClient)
      });
      const data = await response.json();
      setClients([...clients, data.data.client]);
      setNewClient({
        nickname: '',
        email: '',
        phone: '',
        address: '',
        bio: '',
        preferences: '',
        contactHours: ''
      });
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  return (
    <div>
      <h2>Client Management</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nickname"
          placeholder="Nickname"
          value={newClient.nickname}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newClient.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={newClient.phone}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={newClient.address}
          onChange={handleInputChange}
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={newClient.bio}
          onChange={handleInputChange}
        />
        <textarea
          name="preferences"
          placeholder="Preferences"
          value={newClient.preferences}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="contactHours"
          placeholder="Contact Hours"
          value={newClient.contactHours}
          onChange={handleInputChange}
        />
        <button type="submit">Add Client</button>
      </form>
      <h3>Existing Clients</h3>
      <ul>
        {clients.map((client) => (
          <li key={client._id}>
            {client.nickname} - {client.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientManagement;
