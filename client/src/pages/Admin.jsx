import { Fragment, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Download, ExternalLink, Search } from 'lucide-react';
import Alert from '../components/Alert';
import Button from '../components/Button';
import { Input, Select } from '../components/Field';
import PageLoader from '../components/PageLoader';
import * as adminService from '../services/adminService';
import { parseApiError } from '../services/api';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('registrations');
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  // Stats ek baar
  useEffect(() => {
    adminService.getStats().then(({ data }) => setStats(data)).catch((e) => setError(parseApiError(e).message));
  }, []);

  // Search typing ke baad 350ms wait
  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(id);
  }, [search]);

  // Table data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const request = tab === 'registrations'
      ? adminService.getRegistrations({ page, search: debouncedSearch || undefined, domain: domain || undefined })
      : adminService.getCancellations({ page });
    request
      .then(({ data }) => {
        if (cancelled) return;
        setRows(tab === 'registrations' ? data.registrations : data.cancellations);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch((e) => { if (!cancelled) setError(parseApiError(e).message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, page, debouncedSearch, domain]);

  const switchTab = (next) => { setTab(next); setPage(1); setOpenId(null); };

  const handleExport = async () => {
    setExporting(true);
    try { await adminService.exportRegistrationsCsv(); } catch (e) { setError(parseApiError(e).message); } finally { setExporting(false); }
  };

  if (!stats && !error) return <PageLoader label="Loading admin panel…" />;

  const tiles = stats ? [
    ['Registrations', stats.registrations],
    ['Cancellations', stats.cancellations],
    ['Total participants', stats.totalParticipants],
    ['Verified users', `${stats.verifiedUsers} / ${stats.totalUsers}`],
    ['Contact messages', stats.contactMessages],
  ] : [];

  return (
    <section className="bg-surface px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Admin panel</h1>
        <p className="mt-2 text-muted">Registrations, submissions and cancellations for the hackathon.</p>

        {error && <Alert type="error" className="mt-6">{error}</Alert>}

        {stats && (
          <>
            <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
              {tiles.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-line bg-white p-5 shadow-card">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-2 font-display text-3xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            {stats.byDomain.length > 0 && (
              <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
                <h2 className="text-lg font-semibold">Registrations by domain</h2>
                <ul className="mt-4 space-y-3">
                  {stats.byDomain.map((d) => (
                    <li key={d.domain} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 truncate">{d.domain}</span>
                      <span className="h-2 flex-1 rounded-full bg-surface">
                        <span className="block h-2 rounded-full bg-brand-500" style={{ width: `${(d.count / stats.registrations) * 100}%` }} />
                      </span>
                      <span className="w-8 text-right font-semibold">{d.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-line bg-white p-1">
            {[['registrations', 'Registrations'], ['cancellations', 'Cancellations']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => switchTab(key)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === key ? 'bg-navy-900 text-white' : 'text-navy-900 hover:bg-surface'}`}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'registrations' && (
            <Button variant="secondary" onClick={handleExport} loading={exporting}><Download className="h-4 w-4" />Download CSV</Button>
          )}
        </div>

        {tab === 'registrations' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-[2fr_1fr]">
            <Input label="Search" icon={Search} placeholder="Name, email, project or college" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select label="Domain" placeholder="All domains" options={stats ? stats.byDomain.map((d) => d.domain) : []} value={domain}
              onChange={(e) => { setDomain(e.target.value); setPage(1); }} />
          </div>
        )}

        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          {loading ? (
            <PageLoader label="Loading…" />
          ) : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted">Nothing here yet.</p>
          ) : tab === 'registrations' ? (
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Participant</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">College</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold"><span className="sr-only">Details</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Fragment key={r._id}>
                    <tr className="border-b border-line align-top">
                      <td className="px-4 py-3"><p className="font-semibold">{r.fullName}</p><p className="break-all text-xs text-muted">{r.email}</p></td>
                      <td className="px-4 py-3"><p className="font-semibold">{r.projectName}</p><p className="text-xs text-muted">{r.domain}</p></td>
                      <td className="px-4 py-3">{r.collegeName}</td>
                      <td className="px-4 py-3">{r.teamSize === 1 ? 'Solo' : `${r.teamSize} members`}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <button type="button" aria-expanded={openId === r._id} onClick={() => setOpenId(openId === r._id ? null : r._id)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
                          Details {openId === r._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                    {openId === r._id && (
                      <tr className="border-b border-line bg-surface">
                        <td colSpan={6} className="px-4 py-5">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-1 text-sm">
                              <p className="font-semibold">Contact and education</p>
                              <p>Mobile: {r.mobileNumber}</p>
                              <p>{r.course}, {r.branch}, {r.yearOfStudy}</p>
                            </div>
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold">Submission links</p>
                              <DetailLink label="PPT" href={r.pptLink} />
                              <DetailLink label="Prototype" href={r.prototypeLink} />
                              {r.demoVideoLink && <DetailLink label="Demo video" href={r.demoVideoLink} />}
                            </div>
                            <div className="text-sm">
                              <p className="font-semibold">Team members</p>
                              {r.teamMembers.length === 0 ? <p className="text-muted">Solo participant</p> : (
                                <ul className="mt-1 space-y-1">
                                  {r.teamMembers.map((m) => <li key={m.email}>{m.name} <span className="break-all text-xs text-muted">{m.email}</span></li>)}
                                </ul>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Participant</th>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c._id} className="border-b border-line align-top">
                    <td className="px-4 py-3"><p className="font-semibold">{c.fullName}</p><p className="break-all text-xs text-muted">{c.email}</p></td>
                    <td className="px-4 py-3"><p className="font-semibold">{c.projectName}</p><p className="text-xs text-muted">{c.domain}</p></td>
                    <td className="px-4 py-3 text-xs">{formatDate(c.registeredAt)}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>{total} total</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <span>Page {page} of {pages}</span>
            <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailLink({ label, href }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 font-semibold text-brand-600 hover:underline">
      <span>{label}</span><ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>
  );
}