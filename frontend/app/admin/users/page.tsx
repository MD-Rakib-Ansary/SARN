"use client";
import { useState, useEffect } from "react";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock users data
    const mockUsers = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 234 567 8900",
        orders: 5,
        totalSpent: 1250,
        joinDate: "2024-01-15",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1 234 567 8901",
        orders: 3,
        totalSpent: 750,
        joinDate: "2024-02-20",
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "+1 234 567 8902",
        orders: 8,
        totalSpent: 2100,
        joinDate: "2023-12-10",
      },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full md:w-96 px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-500">ID: {user.id}</span>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{user.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Orders:</span>
                <span className="font-semibold">{user.orders}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Total Spent:</span>
                <span className="font-semibold">${user.totalSpent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Joined:</span>
                <span className="text-sm">{new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}