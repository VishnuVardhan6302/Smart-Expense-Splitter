import {useState, useEffect, useMemo} from 'react'
import './App.css'

export default function App() {
  const [members, setMembers] = useState(() => {
    const s = localStorage.getItem('split_members')
    return s ? JSON.parse(s) : [{id: 1, name: 'Vishnu (You)', color: '#0f766e'}]
  })

  const [expenses, setExpenses] = useState(() => {
    const s = localStorage.getItem('split_expenses')
    return s
      ? JSON.parse(s)
      : [
          {
            id: 1,
            desc: 'Dinner at Italian',
            amount: 120,
            paidBy: 1,
            participants: [1, 2, 3, 4],
            date: 'Today',
          },
          {
            id: 2,
            desc: 'Groceries',
            amount: 45.6,
            paidBy: 2,
            participants: [1, 2, 3, 4],
            date: 'Yesterday',
          },
          {
            id: 3,
            desc: 'Uber Ride',
            amount: 22.4,
            paidBy: 3,
            participants: [1, 3, 4],
            date: '2 days ago',
          },
        ]
  })

  const [newMember, setNewMember] = useState('')
  const [form, setForm] = useState({
    desc: '',
    amount: '',
    paidBy: 1,
    participants: [1, 2, 3, 4],
  })

  useEffect(
    () => localStorage.setItem('split_members', JSON.stringify(members)),
    [members],
  )
  useEffect(
    () => localStorage.setItem('split_expenses', JSON.stringify(expenses)),
    [expenses],
  )

  const balances = useMemo(() => {
    const bal = {}
    members.forEach(m => (bal[m.id] = 0))
    expenses.forEach(exp => {
      const share = exp.amount / exp.participants.length
      exp.participants.forEach(pid => {
        if (bal[pid] !== undefined) bal[pid] -= share
      })
      bal[exp.paidBy] += exp.amount
    })
    return bal
  }, [members, expenses])

  const clickedAdd = () => {
    if (!newMember.trim()) return
    const member = {id: Date.now(), name: newMember, color: '#6b7280'}
    setMembers([...members, member])
    setNewMember('')
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <div className="logo">
            <div className="logo-icon">⇄</div>
            <h1>Smart Expense Splitter</h1>
            <span className="badge">Weekend Trip • LocalStorage</span>
          </div>
          <span style={{fontSize: 12, color: '#6b7280'}}>
            {members.length} members • {expenses.length} expenses
          </span>
        </div>

        <div className="stats-bar">
          <div className="stat">
            <p>Total Group Balance</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <div className="stat">
            <p>Total Expenses</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <div className="stat">
            <p>Your Balance</p>
            <p style={{color: balances[1] >= 0 ? '#16a34a' : '#dc2626'}}>
              ${balances[1]?.toFixed(2)}
            </p>
          </div>
          <div className="stat">
            <p>Settled</p>
            <p>$0.00</p>
          </div>
        </div>

        <div className="main-grid">
          {/* Members */}
          <div className="card">
            <h2>+ Add Members</h2>
            {members.map(m => (
              <div className="member-row" key={m.id}>
                <div className="avatar" style={{background: m.color}}>
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <span style={{fontSize: 14, fontWeight: 600}}>{m.name}</span>
              </div>
            ))}
            <div className="input-row">
              <input
                required
                placeholder="+ Add member name"
                value={newMember}
                onChange={e => setNewMember(e.target.value)}
              />
              <button className="btn" onClick={clickedAdd}>
                Add
              </button>
            </div>
          </div>

          {/* Add Expense */}
          <div>
            <div className="card" style={{marginBottom: 20}}>
              <h2>Add Expense</h2>
              <div className="form-group">
                <label htmlFor="exp" className="form-label">
                  Expense Description
                </label>
                <input
                  id="exp"
                  className="form-input"
                  placeholder="e.g., Dinner at Italian"
                  value={form.desc}
                  onChange={e => setForm({...form, desc: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group" style={{flex: 1}}>
                  <label htmlFor="amount" className="form-label">
                    Amount ($)
                  </label>
                  <input
                    id="amount"
                    type="number"
                    className="form-input"
                    value={form.amount}
                    onChange={e => setForm({...form, amount: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{flex: 1}}>
                  <label htmlFor="paid" className="form-label">
                    Paid by
                  </label>
                  <select
                    id="paid"
                    className="form-input"
                    value={form.paidBy}
                    onChange={e =>
                      setForm({...form, paidBy: parseInt(e.target.value)})
                    }
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="split" className="form-label">
                  Split between
                </label>
                <div id="split" className="check-grid">
                  {members.map(m => (
                    <label className="check-item" key={m.id}>
                      <input
                        type="checkbox"
                        checked={form.participants.includes(m.id)}
                        onChange={() =>
                          setForm(p => ({
                            ...p,
                            participants: p.participants.includes(m.id)
                              ? p.participants.filter(x => x !== m.id)
                              : [...p.participants, m.id],
                          }))
                        }
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn"
                  onClick={() => {
                    if (!form.desc || !form.amount) return
                    setExpenses([
                      {
                        id: Date.now(),
                        desc: form.desc,
                        amount: parseFloat(form.amount),
                        paidBy: form.paidBy,
                        participants: form.participants,
                        date: 'Just now',
                      },
                      ...expenses,
                    ])
                    setForm({
                      desc: '',
                      amount: '',
                      paidBy: 1,
                      participants: members.map(m => m.id),
                    })
                  }}
                >
                  + Add Expense
                </button>
                <button className="btn btn-outline">Cancel</button>
              </div>
            </div>

            <div className="card">
              <h2>Recent Expenses</h2>
              {expenses.map(e => (
                <div className="expense-item" key={e.id}>
                  <div>
                    <b>{e.desc}</b>
                    <p style={{fontSize: 11, color: '#6b7280'}}>
                      Paid by {members.find(m => m.id === e.paidBy)?.name}
                      {e.date}
                    </p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <b>${e.amount.toFixed(2)}</b>
                    <p style={{fontSize: 11}}>
                      Split {e.participants.length} ways
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Balance */}
          <div className="card">
            <h2>Balance Summary</h2>
            {members
              .filter(m => m.id !== 1)
              .map(m => {
                const b = balances[m.id]
                if (Math.abs(b) < 0.01) return null
                return (
                  <div key={m.id}>
                    <div className="balance-big-label">
                      {b > 0 ? 'You will receive' : 'You owe'}
                    </div>
                    <div className={b > 0 ? 'balance-receive' : 'balance-owe'}>
                      ${Math.abs(b).toFixed(2)}
                    </div>
                    <div className={`balance-sub ${b > 0 ? 'receive' : 'owe'}`}>
                      {b > 0 ? `from ${m.name}` : `to ${m.name}`}
                    </div>
                  </div>
                )
              })}

            <div
              style={{
                borderTop: '1px solid #eee',
                paddingTop: 12,
                marginTop: 12,
              }}
            >
              <b style={{fontSize: 14}}>Net Balances</b>
              {members.map(m => (
                <div className="net-row" key={m.id}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div
                      className="avatar"
                      style={{
                        width: 28,
                        height: 28,
                        fontSize: 10,
                        background: m.color,
                      }}
                    >
                      {m.name.slice(0, 2)}
                    </div>
                    {m.name}
                  </div>
                  <span
                    className={`amount ${
                      balances[m.id] > 0
                        ? 'receive'
                        : balances[m.id] < 0
                        ? 'owe'
                        : ''
                    }`}
                  >
                    {balances[m.id] > 0
                      ? `owes you $${balances[m.id].toFixed(2)}`
                      : balances[m.id] < 0
                      ? `You owe $${Math.abs(balances[m.id]).toFixed(2)}`
                      : 'Settled'}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-dark"
              onClick={() => {
                if (window.confirm('Clear all?')) setExpenses([])
              }}
            >
              ↗ Settle Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
