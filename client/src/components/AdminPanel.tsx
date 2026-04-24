import { useState, useEffect } from "react";
import { useAdmin, type AdminQuestion, type AdminUser } from "../hooks/useAdmin";

const CATEGORIES = ['JavaScript', 'React', 'TypeScript', 'CSS', 'Performance', 'Architecture']

type Tab = 'questions' | 'users'

export default function AdminPanel() {
    const [tab, setTab] = useState('questions')
    const [questions, setQuestions] = useState<AdminQuestion[]>([])
    const [users, setUsers] = useState<AdminUser[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingQ, setEditingQ] = useState<AdminQuestion | null>(null)
    const [form, setForm] = useState({ category: 'Javascript', text: '', hint: '' })
    const { loading, error, getQuestions, createQuestion, updateQuestion, deleteQuestion, getUsers, updateUserRole, deleteUser } = useAdmin()

    useEffect(() => {
        if (tab === 'questions') {
            getQuestions().then(setQuestions)
        } else {
            getUsers().then(setUsers)
        }
    }, [tab])

    const handleSaveQuestion = async () => {
        if (!form.text || !form.hint) return
        let success: boolean
        if (editingQ) {
            success = await updateQuestion(editingQ.id, form)
        } else {
            success = await createQuestion(form.category, form.text, form.hint)
        }

        if (success) {
            setShowForm(false)
            setEditingQ(null)
            setForm({ category: 'JavaScript', text: '', hint: '' })
            getQuestions().then(setQuestions)
        }
    }

    const handleEdit = (q: AdminQuestion) => {
        setEditingQ(q)
        setForm({ category: q.category, text: q.text, hint: q.hint })
        setShowForm(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this question?')) return
        const success = await deleteQuestion(id)
        if (success) getQuestions().then(setQuestions)
    }

    const handleToggleActice = async (q: AdminQuestion) => {
        await updateQuestion(q.id, { active: !q.active })
        getQuestions().then(setQuestions)
    }

    const handleRoleChange = async (id: string, role: string) => {
        const success = await updateUserRole(id, role)
        if (success) getUsers().then(setUsers)
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Delete this user and all their data?')) return
        const success = await deleteUser(id)
        if (success) getUsers().then(setUsers)
    }

    const card: React.CSSProperties = {
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1rem',
    }

    const btn: React.CSSProperties = {
        padding: '6px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var (--color-border-strong)',
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
    }

    const btnPrimary: React.CSSProperties = {
        ...btn,
        background: 'var(--color-accent)',
        color: '#fff',
        border: '1px solid var(--color-accent-hover)',
        fontWeight: 500,
    }

    const btnDanger: React.CSSProperties = {
        ...btn,
        background: 'var(--color-danger-bg)',
        color: 'var(--color-danger-text)',
        border: '1px solid #f7c1c1',
    }

    const input: React.CSSProperties = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid var(--color-border-strong)',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'var(--font-sans)',
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        background: 'var(--color-surface)',
        outline: 'none',
        marginBottom: '10px',
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
                    Admin Panel
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                    Manage questions and users
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                {(['questions', 'users'] as Tab[]).map((t) => (
                    <button
                        key={t}
                        style={tab === t ? btnPrimary : btn}
                        onClick={() => setTab(t)}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {error && (
                <p style={{ color: 'var(--color-danger-text', fontSize: '14px', marginBottom: '1rem' }}>
                    {error}
                </p>
            )}

            {/* Questions Tab */}
            {tab === 'questions' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            {questions.length} questions
                        </p>
                        <button
                            style={btnPrimary}
                            onClick={() => {
                                setEditingQ(null)
                                setForm({ category: 'Javascript', text: '', hint: '' })
                                setShowForm(true)
                            }}
                        >
                            + Add question
                        </button>
                    </div>

                    {/* Question form */}
                    {showForm && (
                        <div style={{ ...card, background: 'var(--color-surface-secondary)', marginBottom: '1.5rem' }}>
                            <p style={{ fontWeight: 500, marginBottom: '12px', fontSize: '15px' }}>
                                {editingQ ? 'Edit questions' : 'New question'}
                            </p>
                            <select
                                value={form.category}
                                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                style={input}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <textarea
                                value={form.text}
                                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                                placeholder="Question text"
                                style={{ ...input, minHeight: '80px', resize: 'vertical' }}
                            />
                            <input
                                value={form.hint}
                                onChange={(e) => setForm((f) => ({ ...f, hint: e.target.value }))}
                                placeholder="Hint"
                                style={input}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={btnPrimary} onClick={handleSaveQuestion} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button style={btn} onClick={() => { setShowForm(false); setEditingQ(null) }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Question list */}
                    {loading && !showForm ? (
                        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Loading...</p>
                    ) : (
                        questions.map((q) => (
                            <div key={q.id} style={card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', }}>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 500,
                                                background: 'var(--color-surface-secondary)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                color: 'var(--color-text-secondary)',
                                            }}>
                                                {q.category}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: q.active ? '#085041' : 'var(--color-text-muted)',
                                                background: q.active ? '#e1f5ee' : 'var(--color-surface-secondary)',
                                                padding: '2px 8px',
                                                borderRadius: '4px'
                                            }}>
                                                {q.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '14px', marginBottom: '4px' }}>{q.text}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{q.hint}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        <button style={btn} onClick={() => handleEdit(q)}>Edit</button>
                                        <button style={btn} onClick={() => handleToggleActice(q)}>
                                            {q.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button style={btn} onClick={() => handleDelete(q.id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
                <div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                        {users.length} users
                    </p>
                    {loading ? (
                        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Loading...</p>
                    ) : (
                        users.map((u) => (
                            <div key={u.id} style={card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 500 }}>{u.username}</p>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{u.email}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                            {u._count.sessions} sessions · joined {new Date(u.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            style={{ ...btn, cursor: 'pointer' }}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                        <button style={btnDanger} onClick={() => handleDeleteUser(u.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}