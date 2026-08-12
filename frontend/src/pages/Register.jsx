import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      // On success, navigate to login
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
            <h2 style={{ color: 'var(--primary)' }}>Create an Account</h2>
            <p style={{ color: 'var(--text-muted)' }}>Register to request auditorium bookings.</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input type="text" className="input-field" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
          </div>

          <div className="input-group">
            <label className="input-label">College Email Address</label>
            <input type="email" className="input-field" name="email" value={formData.email} onChange={handleChange} required placeholder="student@college.edu" />
          </div>
          
          <div className="input-group">
            <label className="input-label">Department</label>
            <select className="input-field" name="department" value={formData.department} onChange={handleChange} required>
                <option value="">Select Department</option>
                <option value="B.E. Engineering">B.E. Engineering</option>
                <option value="Diploma Engineering">Diploma Engineering</option>
                <option value="Law">Law</option>
                <option value="Pharmacy">Pharmacy</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Role</label>
            <select className="input-field" name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="admin">Administrator (Demo)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input type="password" className="input-field" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <span style={{ color: 'var(--secondary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/login')}>Sign in here</span>
        </p>
      </div>
    </div>
  );
};

const styles = {
    container: {
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0)', padding: '2rem'
    },
    card: {
        background: 'white', padding: '3rem', borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px'
    },
    header: { textAlign: 'center', marginBottom: '2rem' },
    error: {
        backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem',
        borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center'
    }
};

export default Register;
