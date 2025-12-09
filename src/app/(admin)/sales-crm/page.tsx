"use client";

import React, { useState, useEffect } from 'react';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { 
  PlusIcon, 
  ExportIcon, 
  // MoreDotIcon, // Commented out - not currently used
  PencilIcon,
  SalesIcon,
  SalesIconOrange,
  SalesIconGreen,
  SalesIconViolet
} from '@/icons';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

// Types for Lead management
interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: 'New' | 'In Progress' | 'Converted' | 'Lost';
  assignedTo: string;
  investment: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NewLead {
  name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string;
  investment: string;
  nextFollowUp: string;
  notes: string;
}

// API service functions (ready for backend integration)
const leadsAPI = {
  // Get all leads
  getLeads: async (): Promise<Lead[]> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/leads');
      // return await response.json();
      
      // Mock data for now
      return [
        {
          id: 1,
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          email: 'rajesh.k@email.com',
          source: 'Website',
          status: 'New',
          assignedTo: 'Amit Singh',
          investment: '5,00,000',
          lastContact: '2024-11-25',
          nextFollowUp: '2024-11-30',
          notes: 'Interested in ETF portfolio',
          createdAt: '2024-11-20',
          updatedAt: '2024-11-25'
        },
        {
          id: 2,
          name: 'Priya Sharma',
          phone: '+91 98765 43211',
          email: 'priya.s@email.com',
          source: 'Referral',
          status: 'In Progress',
          assignedTo: 'Neha Patel',
          investment: '10,00,000',
          lastContact: '2024-11-27',
          nextFollowUp: '2024-12-02',
          notes: 'Requested debt freedom plan',
          createdAt: '2024-11-22',
          updatedAt: '2024-11-27'
        },
        {
          id: 3,
          name: 'Vikram Mehta',
          phone: '+91 98765 43212',
          email: 'vikram.m@email.com',
          source: 'Cold Call',
          status: 'Converted',
          assignedTo: 'Amit Singh',
          investment: '15,00,000',
          lastContact: '2024-11-28',
          nextFollowUp: '-',
          notes: 'Onboarded successfully',
          createdAt: '2024-11-15',
          updatedAt: '2024-11-28'
        }
      ];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  // Create new lead
  createLead: async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/leads', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(leadData)
      // });
      // return await response.json();

      // Mock response for now
      return {
        ...leadData,
        id: Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  // Update lead status
  updateLeadStatus: async (leadId: number, status: string): Promise<Lead> => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/leads/${leadId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status })
      // });
      // return await response.json();

      // Mock response for now
      console.log(`Updating lead ${leadId} status to ${status}`);
      return {} as Lead;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  },

  // Delete lead
  deleteLead: async (leadId: number): Promise<void> => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      console.log(`Deleting lead ${leadId}`);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }
};

export default function SalesCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [newLead, setNewLead] = useState<NewLead>({
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    status: 'New',
    assignedTo: '',
    investment: '',
    nextFollowUp: '',
    notes: ''
  });

  // Load leads on component mount
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const leadsData = await leadsAPI.getLeads();
      setLeads(leadsData);
    } catch (err) {
      setError('Failed to load leads. Please try again.');
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // const statusColors = {
  //   'New': 'info',
  //   'In Progress': 'warning', 
  //   'Converted': 'success',
  //   'Lost': 'error'
  // };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    inProgress: leads.filter(l => l.status === 'In Progress').length,
    converted: leads.filter(l => l.status === 'Converted').length,
    conversionRate: leads.length > 0 ? ((leads.filter(l => l.status === 'Converted').length / leads.length) * 100).toFixed(1) : '0'
  };

  const handleAddLead = async () => {
    if (newLead.name && newLead.phone) {
      try {
        setLoading(true);
        const leadData = {
          ...newLead,
          lastContact: new Date().toISOString().split('T')[0],
          status: newLead.status as 'New' | 'In Progress' | 'Converted' | 'Lost'
        };
        
        const createdLead = await leadsAPI.createLead(leadData);
        setLeads(prevLeads => [...prevLeads, createdLead]);
        
        // Reset form
        setNewLead({
          name: '',
          phone: '',
          email: '',
          source: 'Website',
          status: 'New',
          assignedTo: '',
          investment: '',
          nextFollowUp: '',
          notes: ''
        });
        setShowAddLead(false);
      } catch (err) {
        setError('Failed to create lead. Please try again.');
        console.error('Error creating lead:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // const updateLeadStatus = async (id: number, newStatus: string) => {
  //   try {
  //     await leadsAPI.updateLeadStatus(id, newStatus);
  //     setLeads(leads.map(lead => 
  //       lead.id === id ? { 
  //         ...lead, 
  //         status: newStatus as 'New' | 'In Progress' | 'Converted' | 'Lost', 
  //         lastContact: new Date().toISOString().split('T')[0] 
  //       } : lead
  //     ));
  //   } catch (err) {
  //     setError('Failed to update lead status. Please try again.');
  //     console.error('Error updating lead status:', err);
  //   }
  // };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Source', 'Status', 'Assigned To', 'Investment', 'Last Contact', 'Next Follow-up', 'Notes'];
    const csvData = leads.map(lead => [
      lead.name,
      lead.phone,
      lead.email,
      lead.source,
      lead.status,
      lead.assignedTo,
      lead.investment,
      lead.lastContact,
      lead.nextFollowUp,
      lead.notes
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_export.csv';
    a.click();
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (loading) {
    return (
      <>
        <PageBreadCrumb pageTitle="Sales CRM" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadCrumb pageTitle="Sales CRM" />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {setError(null); loadLeads();}}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}
      
      <div className="grid gap-6">
        {/* Header */}
        <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Sales CRM</h1>
              <p className="text-body dark:text-bodydark">Lead & Conversion Tracking</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={leads.length === 0}
              >
                <ExportIcon className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowAddLead(true)}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Lead
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="xl:flex items-stretch justify-between mt-5 sales-box-row">
            <div className="col-span-4">
              <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{stats.total}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Total Leads
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRightIcon className="w-3 h-3 inline-block" />
                    </span>
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <SalesIconOrange />
                <h2 className="numbers-sale text-gray-900">{stats.new}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    New Leads
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRightIcon className="w-3 h-3 inline-block" />
                    </span>
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <SalesIconGreen />
                <h2 className="numbers-sale text-gray-900">{stats.inProgress}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    In Progress
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRightIcon className="w-3 h-3 inline-block" />
                    </span>
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <SalesIconViolet />
                <h2 className="numbers-sale text-gray-900">{stats.converted}</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Converted
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRightIcon className="w-3 h-3 inline-block" />
                    </span>
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="box-total-sales h-full hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer">
                <SalesIcon />
                <h2 className="numbers-sale text-gray-900">{stats.conversionRate}%</h2>
                <p className="total-sale-text">
                  <span className="flex items-center gap-2">
                    Conversion Rate
                    <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRightIcon className="w-3 h-3 inline-block" />
                    </span>
                  </span>
                </p>
                <span className="total-yes"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative search-box">
              <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                <svg
                  className="fill-gray-500 dark:fill-gray-400"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4702 18.2377 17.1773L15.4176 14.357C16.5344 13.003 17.2053 11.2674 17.2053 9.37363C17.2053 5.04817 13.6989 1.54199 9.37508 1.54199Z"
                    fill=""
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 text-body dark:text-bodydark flex items-center justify-center">🔽</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option>All</option>
                <option>New</option>
                <option>In Progress</option>
                <option>Converted</option>
                <option>Lost</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white dark:bg-dark rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-2 dark:bg-meta-4 border-b border-stroke dark:border-strokedark">
                <tr>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Name</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Contact</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Source</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Status</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Assigned To</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Investment</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Next Follow-up</th>
                  <th className="text-left text-black dark:text-white text-sm font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-stroke dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4/10 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-black dark:text-white">{lead.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-sm">
                        <span className="text-black dark:text-white flex items-center mb-1">
                          <span className="w-3 h-3 mr-1">📞</span>
                          {lead.phone}
                        </span>
                        <span className="text-body dark:text-bodydark flex items-center">
                          <span className="w-3 h-3 mr-1">📧</span>
                          {lead.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-black dark:text-white text-sm">{lead.source}</span>
                    </td>
                    <td className="px-4 py-3">
                     
                        {lead.status}
                      
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-black dark:text-white text-sm">{lead.assignedTo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-black dark:text-white text-sm font-medium">₹{lead.investment}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-black dark:text-white">
                        <span className="w-3 h-3 mr-1">📅</span>
                        {lead.nextFollowUp}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-primary hover:text-primary/70 transition p-1 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <Modal 
          isOpen={showAddLead} 
          onClose={() => setShowAddLead(false)}
          showCloseButton={true}
          className="max-w-2xl w-full mx-auto my-8"
        >
          <div className="bg-white dark:bg-dark rounded-xl border border-stroke dark:border-strokedark max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-stroke dark:border-strokedark">
              <h2 className="text-2xl font-bold text-black dark:text-white">Add New Lead</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Name *</label>
                  <input
                    type="text"
                    value={newLead.name}
                    onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Phone *</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Source</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                    <option>Social Media</option>
                    <option>Event</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Assigned To</label>
                  <input
                    type="text"
                    value={newLead.assignedTo}
                    onChange={(e) => setNewLead({...newLead, assignedTo: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Expected Investment</label>
                  <input
                    type="text"
                    value={newLead.investment}
                    onChange={(e) => setNewLead({...newLead, investment: e.target.value})}
                    placeholder="5,00,000"
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Next Follow-up Date</label>
                  <input
                    type="date"
                    value={newLead.nextFollowUp}
                    onChange={(e) => setNewLead({...newLead, nextFollowUp: e.target.value})}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">Notes</label>
                  <textarea
                    value={newLead.notes}
                    onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                    rows={3}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddLead(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddLead}
                  disabled={!newLead.name || !newLead.phone || loading}
                  className="flex-1"
                >
                  {loading ? 'Adding...' : 'Add Lead'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* View Lead Details Modal */}
      {selectedLead && (
        <Modal 
          isOpen={!!selectedLead} 
          onClose={() => setSelectedLead(null)}
          showCloseButton={true}
          className="max-w-2xl w-full mx-auto my-8"
        >
          <div className="bg-white dark:bg-dark rounded-xl border border-stroke dark:border-strokedark">
            <div className="p-6 border-b border-stroke dark:border-strokedark">
              <h2 className="text-2xl font-bold text-black dark:text-white">{selectedLead.name}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Phone</p>
                  <p className="text-black dark:text-white">{selectedLead.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Email</p>
                  <p className="text-black dark:text-white">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Source</p>
                  <p className="text-black dark:text-white">{selectedLead.source}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Status</p>
                    {selectedLead.status}
                  
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Assigned To</p>
                  <p className="text-black dark:text-white">{selectedLead.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Investment</p>
                  <p className="text-black dark:text-white">₹{selectedLead.investment}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Last Contact</p>
                  <p className="text-black dark:text-white">{selectedLead.lastContact}</p>
                </div>
                <div>
                  <p className="text-sm text-body dark:text-bodydark mb-1">Next Follow-up</p>
                  <p className="text-black dark:text-white">{selectedLead.nextFollowUp}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-body dark:text-bodydark mb-1">Notes</p>
                  <p className="text-black dark:text-white">{selectedLead.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}