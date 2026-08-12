import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Check, Clock, LogOut, X } from 'lucide-react';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [user, setUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        setUser(parsedUser);
        fetchAllBookings(token);
    }, [navigate]);

    const fetchAllBookings = async (token) => {
        try {
            const res = await api.get('/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleDecision = async (id, decision) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('token');
            // This endpoint updateBookingStatus will be handled by the backend
            await api.put(`/bookings/${id}/status`, { status: decision }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh list
            fetchAllBookings(token);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update action. The backend might not support this fully yet.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h2><span style={{ color: 'var(--success)' }}>Admin Portal</span></h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Centralized Auditorium Management</p>
                </div>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            {/* Main Content */}
            <main style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>All Booking Requests</h3>

                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--surface-border)' }}>
                            <tr>
                                <th style={styles.th}>Department & User</th>
                                <th style={styles.th}>Event Details</th>
                                <th style={styles.th}>Date & Time</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{booking.department}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Req by: {booking.user_name}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 500 }}>{booking.event_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{booking.auditorium_name}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                                            <Calendar size={14} color="var(--text-muted)"/> {new Date(booking.start_time).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            <Clock size={14} /> 
                                            {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                            {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge, 
                                            ...(booking.status === 'approved' ? styles.statusApproved : 
                                               booking.status === 'rejected' ? styles.statusRejected : styles.statusPending)
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {booking.status === 'pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button 
                                                    style={styles.btnApprove} 
                                                    onClick={() => handleDecision(booking.id, 'approved')}
                                                    disabled={actionLoading === booking.id}
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button 
                                                    style={styles.btnReject} 
                                                    onClick={() => handleDecision(booking.id, 'rejected')}
                                                    disabled={actionLoading === booking.id}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {booking.status !== 'pending' && (
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No booking requests found in the system.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

const styles = {
    header: {
        background: 'white', padding: '1.5rem 5%', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    },
    th: {
        padding: '1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'
    },
    td: {
        padding: '1rem', verticalAlign: 'top'
    },
    statusBadge: {
        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase'
    },
    statusApproved: { background: '#d1fae5', color: '#059669' },
    statusRejected: { background: '#fee2e2', color: '#dc2626' },
    statusPending: { background: '#fef3c7', color: '#d97706' },
    btnApprove: {
        background: '#10b981', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    btnReject: {
        background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
};

export default AdminDashboard;
