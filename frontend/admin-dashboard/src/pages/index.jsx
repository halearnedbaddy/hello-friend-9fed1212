// ═══════════════════════════════════════════════════════════════════════════
// Admin Dashboard — Main Page (Next.js)
// ═══════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayouts, setSelectedPayouts] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // TODO: Get auth token from localStorage/cookies
      // const token = localStorage.getItem('adminToken');
      // const headers = { Authorization: `Bearer ${token}` };
      
      // Load admin stats
      // const statsRes = await axios.get(`${API_URL}/analytics/admin`, { headers });
      // setStats(statsRes.data);
      
      // Load pending payouts
      // const payoutsRes = await axios.get(`${API_URL}/payouts/admin/list?status=pending`, { headers });
      // setPayouts(payoutsRes.data.data);

      // Mock data for demo
      setStats({
        new_customers_30d: 142,
        total_agents: 45,
        delivered_orders: 1203,
        total_revenue: 2450000,
        total_products_sold: 4521,
        pending_orders: 28
      });

      setPayouts([
        {
          id: '1',
          payout_number: 'PO-441',
          agent: 'Amara K.',
          amount: 12400,
          status: 'pending',
          created_at: '2026-03-04'
        },
        {
          id: '2',
          payout_number: 'PO-442',
          agent: 'Brian O.',
          amount: 8750,
          status: 'pending',
          created_at: '2026-03-04'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    try {
      if (selectedPayouts.length === 0) {
        alert('Select payouts to disburse');
        return;
      }

      // TODO: Get auth token
      // const token = localStorage.getItem('adminToken');
      // const response = await axios.post(
      //   `${API_URL}/payouts/admin/disburse`,
      //   { payoutIds: selectedPayouts },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      alert(`Disbursing ${selectedPayouts.length} payouts...`);
      setSelectedPayouts([]);
      loadDashboard();
    } catch (error) {
      alert('Error disbursing payouts: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoBox}>P</div>
          <div>
            <div style={styles.logoText}>PayLoom</div>
            <div style={styles.logoSub}>Admin DASHBOARD</div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Stats Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <>
            <div style={styles.statsGrid}>
              <StatCard
                label="New Customers (30d)"
                value={stats?.new_customers_30d || 0}
                icon="👥"
              />
              <StatCard
                label="Total Agents"
                value={stats?.total_agents || 0}
                icon="🧑‍💼"
              />
              <StatCard
                label="Total Revenue"
                value={`KSh ${(stats?.total_revenue || 0).toLocaleString()}`}
                icon="💰"
              />
              <StatCard
                label="Orders Delivered"
                value={stats?.delivered_orders || 0}
                icon="📦"
              />
              <StatCard
                label="Products Sold"
                value={stats?.total_products_sold || 0}
                icon="🛍️"
              />
              <StatCard
                label="Pending Orders"
                value={stats?.pending_orders || 0}
                icon="⏳"
              />
            </div>

            {/* Payouts Section */}
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Pending Payouts ({payouts.length})</h2>
                <button
                  onClick={handleDisburse}
                  disabled={selectedPayouts.length === 0}
                  style={{
                    ...styles.disburseBtn,
                    opacity: selectedPayouts.length === 0 ? 0.5 : 1,
                    cursor: selectedPayouts.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Disburse {selectedPayouts.length > 0 && `(${selectedPayouts.length})`}
                </button>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableCell}>
                      <input
                        type="checkbox"
                        checked={selectedPayouts.length === payouts.length && payouts.length > 0}
                        onChange={(e) =>
                          setSelectedPayouts(
                            e.target.checked ? payouts.map(p => p.id) : []
                          )
                        }
                      />
                    </th>
                    <th style={styles.tableCell}>Payout #</th>
                    <th style={styles.tableCell}>Agent</th>
                    <th style={styles.tableCell}>Amount</th>
                    <th style={styles.tableCell}>Status</th>
                    <th style={styles.tableCell}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(payout => (
                    <tr key={payout.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <input
                          type="checkbox"
                          checked={selectedPayouts.includes(payout.id)}
                          onChange={(e) =>
                            setSelectedPayouts(
                              e.target.checked
                                ? [...selectedPayouts, payout.id]
                                : selectedPayouts.filter(id => id !== payout.id)
                            )
                          }
                        />
                      </td>
                      <td style={styles.tableCell}>{payout.payout_number}</td>
                      <td style={styles.tableCell}>{payout.agent}</td>
                      <td style={styles.tableCell}>KSh {payout.amount.toLocaleString()}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.statusBadge}>{payout.status}</span>
                      </td>
                      <td style={styles.tableCell}>{payout.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {payouts.length === 0 && (
                <div style={styles.emptyState}>
                  <p style={styles.emptyStateText}>No pending payouts</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '"DM Sans", sans-serif',
    backgroundColor: '#F5F5F5',
    minHeight: '100vh'
  },
  header: {
    backgroundColor: '#0A0A0A',
    color: '#fff',
    padding: '20px 40px',
    borderBottom: '1px solid #1C1C24'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  logoBox: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #FF4D00, #FF8C00)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 16,
    color: '#fff'
  },
  logoText: {
    fontSize: 18,
    fontWeight: 800
  },
  logoSub: {
    fontSize: 11,
    fontWeight: 600,
    color: '#FF4D00',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  main: {
    padding: '40px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 40
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0A0A0A',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 600
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: '#0A0A0A',
    margin: 0
  },
  disburseBtn: {
    backgroundColor: '#FF4D00',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
    borderBottom: '2px solid #E0E0E0'
  },
  tableRow: {
    borderBottom: '1px solid #E0E0E0'
  },
  tableCell: {
    padding: '12px',
    textAlign: 'left',
    fontSize: 14
  },
  statusBadge: {
    backgroundColor: '#FFF4E6',
    color: '#FF4D00',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyStateText: {
    color: '#999',
    fontSize: 14
  }
};
