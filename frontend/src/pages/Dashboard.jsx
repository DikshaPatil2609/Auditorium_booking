import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, LogOut, PlusCircle } from 'lucide-react';

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        auditorium_id: 1, // default to main audi
        event_name: '',
        start_time: '',
        end_time: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (!token || !userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'admin') {
            navigate('/admin-dashboard');
            return;
        }

        setUser(parsedUser);
        fetchMyBookings(token);
    }, [navigate]);

    const fetchMyBookings = async (token) => {
        try {
            const res = await api.get('/bookings/my-bookings', {
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

    const submitBooking = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            await api.post('/bookings', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchMyBookings(token);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit booking request.');
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            {/* Dashboard Header */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h2><span style={{ color: 'var(--primary)' }}>Welcome,</span> {user?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.department} • {user?.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogOut size={16} /> Logout
                </button>
            </header>

            {/* Main Content */}
            <main style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem' }}>My Requests</h3>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <PlusCircle size={20} /> New Request
                    </button>
                </div>

                {/* Bookings List */}
                {bookings.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>You haven't requested any auditorium bookings yet.</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click 'New Request' to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {bookings.map(booking => (
                            <div key={booking.id} style={styles.bookingCard}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ color: 'var(--primary)', margin: 0 }}>{booking.event_name}</h4>
                                    <span style={{
                                        ...styles.statusBadge, 
                                        ...(booking.status === 'approved' ? styles.statusApproved : 
                                           booking.status === 'rejected' ? styles.statusRejected : styles.statusPending)
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Calendar size={16} /> <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    <Clock size={16} /> 
                                    <span>
                                        {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                        {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Venue: {booking.auditorium_name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Request Modal */}
            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--primary)' }}>Request Auditorium</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
                        </div>

                        {error && <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                        <form onSubmit={submitBooking}>
                            <div className="input-group">
                                <label className="input-label">Event Name</label>
                                <input type="text" className="input-field" required value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} placeholder="e.g. Annual Tech Symposium" />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">Start Date & Time</label>
                                    <input type="datetime-local" className="input-field" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label">End Date & Time</label>
                                    <input type="datetime-local" className="input-field" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    header: {
        background: 'white', padding: '1.5rem 5%', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
    },
    headerContent: {},
    emptyState: {
        background: 'white', padding: '4rem 2rem', borderRadius: '12px',
        textAlign: 'center', border: '1px dashed var(--text-muted)'
    },
    bookingCard: {
        background: 'white', padding: '1.5rem', borderRadius: '12px',
        border: '1px solid var(--surface-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    statusBadge: {
        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase'
    },
    statusApproved: { background: '#d1fae5', color: '#059669' },
    statusRejected: { background: '#fee2e2', color: '#dc2626' },
    statusPending: { background: '#fef3c7', color: '#d97706' },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '1rem'
    },
    modalContent: {
        background: 'white', padding: '2rem', borderRadius: '12px',
        width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
    }
};

export default Dashboard;
